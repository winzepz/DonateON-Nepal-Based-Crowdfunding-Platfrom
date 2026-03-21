import { Request, Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

export const createTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { subject, description } = req.body;
        
        if (!subject || !description) {
            return res.status(400).json({ success: false, error: 'Subject and description are required' });
        }

        const result = await pool.query(
            `INSERT INTO support_tickets (user_id, subject, description) 
             VALUES ($1, $2, $3) RETURNING *`,
            [req.user?.id, subject, description]
        );

        logger.info('support.ticket_created', { ticketId: result.rows[0].id, userId: req.user?.id });
        res.status(201).json({ success: true, ticket: result.rows[0] });
    } catch (error) {
        logger.error('support.ticket_create_error', { error, userId: req.user?.id });
        res.status(500).json({ success: false, error: 'Failed to create support ticket' });
    }
};

export const getMyTickets = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM support_tickets 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [req.user?.id]
        );
        res.json({ success: true, tickets: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch support tickets' });
    }
};

export const getTicketDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        const ticketRes = await pool.query(
            `SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2`,
            [id, req.user?.id]
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
            messages: messagesRes.rows 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch ticket details' });
    }
};

export const replyToTicket = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Verify ownership
        const ticketCheck = await pool.query(`SELECT status FROM support_tickets WHERE id = $1 AND user_id = $2`, [id, req.user?.id]);
        if (ticketCheck.rows.length === 0) return res.status(404).json({ success: false, error: 'Ticket not found' });
        if (ticketCheck.rows[0].status === 'CLOSED') return res.status(400).json({ success: false, error: 'Cannot reply to a closed ticket' });

        const result = await pool.query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, message) 
             VALUES ($1, $2, $3) RETURNING *`,
            [id, req.user?.id, message]
        );

        // Update ticket status to OPEN automatically if it was marked RESOLVED
        if (ticketCheck.rows[0].status === 'RESOLVED') {
            await pool.query(`UPDATE support_tickets SET status = 'OPEN' WHERE id = $1`, [id]);
        }

        res.status(201).json({ success: true, reply: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to reply to ticket' });
    }
};

// Admin Functions
export const adminGetAllTickets = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Access denied' });
        
        const result = await pool.query(
            `SELECT t.*, u.name as user_name, u.email as user_email
             FROM support_tickets t
             JOIN users u ON t.user_id = u.id
             ORDER BY t.created_at DESC`
        );
        res.json({ success: true, tickets: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
    }
};

export const adminGetTicketDetails = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Access denied' });
        const { id } = req.params;

        const ticketRes = await pool.query(
            `SELECT t.*, u.name as user_name, u.email as user_email
             FROM support_tickets t
             JOIN users u ON t.user_id = u.id
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
            messages: messagesRes.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch ticket details' });
    }
};

export const adminUpdateTicketStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Access denied' });
        const { id } = req.params;
        const { status } = req.body;

        await pool.query(
            `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
            [status, id]
        );

        res.json({ success: true, message: 'Ticket status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update ticket status' });
    }
};

export const adminReplyToTicket = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Access denied' });
        const { id } = req.params;
        const { message } = req.body;

        if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

        const result = await pool.query(
            `INSERT INTO ticket_messages (ticket_id, sender_id, message) 
             VALUES ($1, $2, $3) RETURNING *`,
            [id, req.user?.id, message]
        );

        // Update ticket status to RESOLVED or remains OPEN?
        // Let's just keep it OPEN unless explicitly closed or user replies.
        
        res.status(201).json({ success: true, reply: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to send admin reply' });
    }
};
