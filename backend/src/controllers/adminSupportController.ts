import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllSupportTickets = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT t.*, u.name as user_name, u.email as user_email
             FROM support_tickets t
             LEFT JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC`
        );
        res.json({ success: true, tickets: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
    }
};

export const getSupportTicketDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const ticketRes = await pool.query(
            `SELECT t.*, u.name as user_name, u.email as user_email
             FROM support_tickets t
             LEFT JOIN users u ON t.user_id = u.id
             WHERE t.id = $1`,
            [id]
        );

        if (ticketRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        const messagesRes = await pool.query(
            `SELECT m.*, u.name as sender_name, u.role as sender_role
             FROM ticket_messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.ticket_id = $1
             ORDER BY m.created_at ASC`,
            [id]
        );

        res.json({
            success: true,
            ticket: ticketRes.rows[0],
            messages: messagesRes.rows,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch ticket details' });
    }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await pool.query(
            `UPDATE support_tickets SET status = $1, assigned_to = $2 WHERE id = $3`,
            [status, req.user?.id, id]
        );
        res.json({ success: true, message: 'Ticket status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update ticket' });
    }
};

export const adminReplyToTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        await pool.query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, message) 
             VALUES ($1, $2, $3)`,
            [id, req.user?.id, message]
        );
        
        await pool.query(
            `UPDATE support_tickets SET status = 'IN_PROGRESS', assigned_to = $2 WHERE id = $1`,
            [id, req.user?.id]
        );

        res.json({ success: true, message: 'Reply sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reply' });
    }
};
