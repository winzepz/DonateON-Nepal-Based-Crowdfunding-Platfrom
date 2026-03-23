import { Response } from 'express';
import { recordAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';
import pool, { withTransaction } from '../db';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export const submitKYC = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { documentType } = req.body;
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!documentType) {
            return res.status(400).json({ error: 'Document type is required' });
        }

        // Check if user is already verified or has a pending submission
        const userCheck = await pool.query('SELECT kyc_status FROM users WHERE id = $1', [userId]);
        const currentStatus = userCheck.rows[0]?.kyc_status;

        if (currentStatus === 'VERIFIED') {
            return res.status(403).json({ error: 'You are already verified.' });
        }
        if (currentStatus === 'PENDING') {
            return res.status(403).json({ error: 'You already have a pending submission. Please wait for review.' });
        }

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'kyc_documents',
                public_id: `kyc_${userId}_${Date.now()}`,
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: 'Image upload failed' });
                }

                if (!result) {
                    return res.status(500).json({ error: 'Image upload failed' });
                }

                try {
                    await withTransaction(async (client) => {
                        const docInsert = await client.query(
                            `INSERT INTO kyc_documents (user_id, document_type, image_url, public_id, status)
                             VALUES ($1, $2, $3, $4, 'PENDING')
                             RETURNING id`,
                            [userId, documentType, result.secure_url, result.public_id]
                        );

                        await client.query(
                            `UPDATE users SET kyc_status = 'PENDING' WHERE id = $1`,
                            [userId]
                        );

                        await recordAuditLog({
                            client,
                            userId,
                            action: 'KYC_SUBMIT',
                            entityType: 'KYC',
                            entityId: docInsert.rows[0].id,
                            details: { documentType }
                        });
                    });

                    res.status(201).json({
                        message: 'KYC submitted successfully',
                        imageUrl: result.secure_url,
                        status: 'PENDING'
                    });
                } catch (dbError) {
                    console.error('Database error during KYC submission:', dbError);
                    res.status(500).json({ error: 'Database error' });
                }
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('KYC submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getKYCStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            `SELECT k.status, k.document_type, k.image_url, k.created_at
             FROM kyc_documents k
             WHERE k.user_id = $1
             ORDER BY k.created_at DESC
             LIMIT 1`,
            [userId]
        );

        const userResult = await pool.query('SELECT kyc_status FROM users WHERE id = $1', [userId]);

        const currentStatus = userResult.rows[0]?.kyc_status || 'UNVERIFIED';

        if (result.rows.length === 0) {
            return res.json({ status: currentStatus, history: null });
        }

        res.json({
            status: currentStatus,
            lastSubmission: result.rows[0]
        });

    } catch (error) {
        console.error('Get KYC status error:', error);
        res.status(500).json({ error: 'Failed to fetch KYC status' });
    }
};
