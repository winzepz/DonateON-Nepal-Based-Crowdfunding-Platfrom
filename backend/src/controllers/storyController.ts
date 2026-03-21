import { Request, Response } from 'express';
import pool from '../db';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const createStory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { campaign_id, title, content, category, impact_amount, impact_people, quote, author_name } = req.body;
        const authorId = req.user?.id;
        const file = req.file;

        if (!authorId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify the campaign exists and belongs to the user
        const campaignCheck = await pool.query(
            'SELECT organizer_id FROM campaigns WHERE id = $1',
            [campaign_id]
        );

        if (campaignCheck.rowCount === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (campaignCheck.rows[0].organizer_id !== authorId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You are not authorized to post a story for this campaign' });
        }

        let imageUrl = null;

        if (file) {
            const result: any = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'stories' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                Readable.from(file.buffer).pipe(uploadStream);
            });
            imageUrl = result.secure_url;
        }

        const result = await pool.query(
            `INSERT INTO stories (campaign_id, author_id, title, content, image_url, category, impact_amount, impact_people, quote, author_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [campaign_id, authorId, title, content, imageUrl, category, impact_amount, impact_people, quote, author_name]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create story error:', error);
        res.status(500).json({ error: 'Failed to create story' });
    }
};

export const getAllStories = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT s.*, c.title AS "campaignTitle", u.name AS "authorProfileName"
             FROM stories s
             JOIN campaigns c ON s.campaign_id = c.id
             JOIN users u ON s.author_id = u.id
             ORDER BY s.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get all stories error:', error);
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
};

export const getStoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT s.*, c.title AS "campaignTitle", u.name AS "authorProfileName"
             FROM stories s
             JOIN campaigns c ON s.campaign_id = c.id
             JOIN users u ON s.author_id = u.id
             WHERE s.id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Story not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get story error:', error);
        res.status(500).json({ error: 'Failed to fetch story' });
    }
};
