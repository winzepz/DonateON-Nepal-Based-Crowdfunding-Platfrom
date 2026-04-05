import { Request, Response } from 'express';
import pool from '../db';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';
import { recordAuditLog } from '../services/auditService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, description, targetAmount, deadline, imageUrl } = req.body;
        const userId = req.user?.id;
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const parsedTarget = Number(targetAmount);
        if (!Number.isFinite(parsedTarget)) {
            return res.status(400).json({ error: 'Invalid target amount' });
        }

        let finalImageUrl = imageUrl;

        // If file is uploaded, send to Cloudinary
        if (file) {
            try {
                const result: any = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'campaigns' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    Readable.from(file.buffer).pipe(uploadStream);
                });
                finalImageUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ error: 'Image upload failed' });
            }
        }

        const deadlineDate = deadline ? new Date(deadline) : null;

        const result = await pool.query(
            `INSERT INTO campaigns (title, description, target_amount, deadline, image_url, organizer_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id,
                       title,
                       description,
                       target_amount AS "targetAmount",
                       current_amount AS "currentAmount",
                       deadline,
                       image_url AS "imageUrl",
                       organizer_id AS "organizerId",
                       created_at AS "createdAt",
                       updated_at AS "updatedAt"`,
            [title, description, parsedTarget, deadlineDate, finalImageUrl ?? null, userId]
        );

        const createdCampaign = result.rows[0];

        await recordAuditLog({
            userId,
            action: 'CAMPAIGN_CREATE' as any,
            entityType: 'CAMPAIGN',
            entityId: createdCampaign.id,
            details: { title: createdCampaign.title, targetAmount: createdCampaign.targetAmount }
        });

        res.status(201).json(createdCampaign);
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

export const getMyCampaigns = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const campaigns = await pool.query(
            `SELECT c.id,
                    c.title,
                    c.description,
                    c.target_amount AS "targetAmount",
                    c.current_amount AS "currentAmount",
                    c.deadline,
                    c.image_url AS "imageUrl",
                    c.organizer_id AS "organizerId",
                    c.created_at AS "createdAt",
                    c.updated_at AS "updatedAt",
                    u.name AS "organizerName",
                    u.email AS "organizerEmail"
              FROM campaigns c
              JOIN users u ON c.organizer_id = u.id
              WHERE c.organizer_id = $1
              ORDER BY c.created_at DESC`,
            [userId]
        );

        const formattedCampaigns = campaigns.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            targetAmount: row.targetAmount,
            currentAmount: row.currentAmount,
            deadline: row.deadline,
            imageUrl: row.imageUrl,
            organizerId: row.organizerId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            organizer: {
                name: row.organizerName,
                email: row.organizerEmail
            }
        }));

        res.json(formattedCampaigns);
    } catch (error) {
        console.error('Get my campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const getSupportedCampaigns = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const campaigns = await pool.query(
            `SELECT DISTINCT c.id,
                    c.title,
                    c.description,
                    c.target_amount AS "targetAmount",
                    c.current_amount AS "currentAmount",
                    c.deadline,
                    c.image_url AS "imageUrl",
                    c.organizer_id AS "organizerId",
                    c.created_at AS "createdAt",
                    c.updated_at AS "updatedAt",
                    u.name AS "organizerName",
                    u.email AS "organizerEmail"
              FROM campaigns c
              JOIN users u ON c.organizer_id = u.id
              JOIN donations d ON c.id = d.campaign_id
              WHERE d.user_id = $1
                AND d.payment_status = 'SUCCEEDED'
              ORDER BY c.created_at DESC`,
            [userId]
        );

        const formattedCampaigns = campaigns.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            targetAmount: row.targetAmount,
            currentAmount: row.currentAmount,
            deadline: row.deadline,
            imageUrl: row.imageUrl,
            organizerId: row.organizerId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            organizer: {
                name: row.organizerName,
                email: row.organizerEmail
            }
        }));

        res.json(formattedCampaigns);
    } catch (error) {
        console.error('Get supported campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch supported campaigns' });
    }
};

export const getAllCampaigns = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT c.id,
                    c.title,
                    c.description,
                    c.target_amount AS "targetAmount",
                    c.current_amount AS "currentAmount",
                    c.deadline,
                    c.image_url AS "imageUrl",
                    c.organizer_id AS "organizerId",
                    c.created_at AS "createdAt",
                    c.updated_at AS "updatedAt",
                    u.name AS "organizerName",
                    u.email AS "organizerEmail"
              FROM campaigns c
              JOIN users u ON c.organizer_id = u.id
              WHERE c.status = 'APPROVED'
        `;
        const params: any[] = [];

        if (category) {
            query += ` AND c.category = $1`;
            params.push(category);
        }

        query += ` ORDER BY c.created_at DESC`;
        
        const campaigns = await pool.query(query, params);

        const formattedCampaigns = campaigns.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            targetAmount: row.targetAmount,
            currentAmount: row.currentAmount,
            deadline: row.deadline,
            imageUrl: row.imageUrl,
            organizerId: row.organizerId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            organizer: {
                name: row.organizerName,
                email: row.organizerEmail
            }
        }));

        res.json(formattedCampaigns);
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const getCampaignById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const campaignResult = await pool.query(
            `SELECT c.id,
                    c.title,
                    c.description,
                    c.target_amount AS "targetAmount",
                    c.current_amount AS "currentAmount",
                    c.deadline,
                    c.image_url AS "imageUrl",
                    c.organizer_id AS "organizerId",
                    c.created_at AS "createdAt",
                    c.updated_at AS "updatedAt",
                    u.name AS "organizerName",
                    u.kyc_status::text AS "kycStatus"
              FROM campaigns c
              JOIN users u ON c.organizer_id = u.id
              WHERE c.id = $1`,
            [id]
        );

        const campaign = campaignResult.rows[0];

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Fetch released amount (approved payouts)
        const releasedRes = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as "releasedAmount" FROM payouts WHERE campaign_id = $1 AND status = \'APPROVED\'',
            [id]
        );
        const releasedAmount = parseFloat(releasedRes.rows[0].releasedAmount);

        const donationsResult = await pool.query(
            `SELECT d.id,
                    d.amount,
                    d.created_at AS "createdAt",
                    d.user_id AS "userId",
                    d.is_anonymous AS "isAnonymous",
                    u.name AS "donorName",
                    u.kyc_status::text AS "kycStatus"
              FROM donations d
              LEFT JOIN users u ON d.user_id = u.id
              WHERE d.campaign_id = $1
                AND d.payment_status = 'SUCCEEDED'
              ORDER BY d.created_at DESC
              LIMIT 5`,
            [id]
        );

        const formattedCampaign = {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            targetAmount: campaign.targetAmount,
            currentAmount: campaign.currentAmount,
            releasedAmount,
            deadline: campaign.deadline,
            imageUrl: campaign.imageUrl,
            organizerId: campaign.organizerId,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
            organizer: {
                name: campaign.organizerName,
                kycStatus: campaign.kycStatus
            },
            donations: donationsResult.rows.map(donation => ({
                id: donation.id,
                amount: donation.amount,
                createdAt: donation.createdAt,
                userId: donation.userId,
                isAnonymous: donation.isAnonymous,
                user: {
                    name: donation.isAnonymous ? 'Anonymous' : (donation.donorName || 'Anonymous'),
                    kycStatus: donation.kycStatus
                }
            }))
        };

        res.json(formattedCampaign);
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
};

export const updateCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, targetAmount, deadline } = req.body;
        const userId = req.user?.id;
        const file = req.file;

        // Check ownership or admin
        const ownershipRes = await pool.query(
            'SELECT organizer_id, image_url FROM campaigns WHERE id = $1',
            [id]
        );

        if (ownershipRes.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const isOwner = ownershipRes.rows[0].organizer_id === userId;
        const isAdmin = req.user?.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        let finalImageUrl = ownershipRes.rows[0].image_url;

        if (file) {
            const result: any = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'campaigns' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                Readable.from(file.buffer).pipe(uploadStream);
            });
            finalImageUrl = result.secure_url;
        }

        const deadlineDate = deadline ? new Date(deadline) : undefined;
        const parsedTarget = targetAmount ? Number(targetAmount) : undefined;

        const result = await pool.query(
            `UPDATE campaigns 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 target_amount = COALESCE($3, target_amount),
                 deadline = COALESCE($4, deadline),
                 image_url = COALESCE($5, image_url),
                 updated_at = NOW()
             WHERE id = $6
             RETURNING id, title, description, target_amount AS "targetAmount", current_amount AS "currentAmount", deadline, image_url AS "imageUrl"`,
            [title || null, description || null, parsedTarget || null, deadlineDate || null, finalImageUrl, id]
        );

        const updatedCampaign = result.rows[0];

        await recordAuditLog({
            userId,
            action: 'CAMPAIGN_UPDATE' as any,
            entityType: 'CAMPAIGN',
            entityId: id,
            details: { changes: req.body }
        });

        res.json(updatedCampaign);
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
};

export const deleteCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const ownershipRes = await pool.query(
            'SELECT organizer_id FROM campaigns WHERE id = $1',
            [id]
        );

        if (ownershipRes.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const isOwner = ownershipRes.rows[0].organizer_id === userId;
        const isAdmin = req.user?.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);

        await recordAuditLog({
            userId,
            action: 'CAMPAIGN_DELETE' as any,
            entityType: 'CAMPAIGN',
            entityId: id,
            details: { campaignId: id }
        });

        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
};
