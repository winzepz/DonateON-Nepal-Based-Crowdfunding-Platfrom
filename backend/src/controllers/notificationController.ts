import { Request, Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user?.id]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        logger.error('notifications.fetch.error', { error, userId: req.user?.id });
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE notifications 
             SET read_status = TRUE 
             WHERE id = $1 AND user_id = $2`,
            [id, req.user?.id]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        await pool.query(
            `UPDATE notifications 
             SET read_status = TRUE 
             WHERE user_id = $1`,
            [req.user?.id]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
};
