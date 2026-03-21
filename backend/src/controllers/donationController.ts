import { Request, Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { lookupDonationCode } from '../services/donationCodeService';

// ──────────────────────────────────────────────────────────────────────────────
// Public: verify a donation code
// GET /api/donations/verify?code=DN-XXXX-XXXX-XXXX
// ──────────────────────────────────────────────────────────────────────────────
export const verifyDonationCode = async (req: Request, res: Response) => {
    try {
        const code = (req.query.code as string || '').trim().toUpperCase();

        if (!code) {
            return res.status(400).json({ error: 'Donation code is required' });
        }

        const result = await lookupDonationCode(code);

        if (!result) {
            return res.status(404).json({ error: 'Donation code not found. Please check the code and try again.' });
        }

        res.json(result);
    } catch (error) {
        console.error('Verify donation code error:', error);
        res.status(500).json({ error: 'Failed to verify donation code' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Public: track by legacy tracking code
// GET /api/donations/track/:code
// ──────────────────────────────────────────────────────────────────────────────
export const trackDonation = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({ error: 'Tracking code is required' });
        }

        const result = await pool.query(
            `SELECT d.id, d.amount, d.created_at AS "createdAt", d.is_released AS "isReleased",
                    c.title AS "campaignTitle", c.id AS "campaignId",
                    u.name AS "organizerName"
             FROM donations d
             JOIN campaigns c ON d.campaign_id = c.id
             JOIN users u ON c.organizer_id = u.id
             WHERE d.tracking_code = $1
               AND d.payment_status = 'SUCCEEDED'`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Donation not found. Please check your tracking code.' });
        }

        const donation = result.rows[0];
        res.json(donation);

    } catch (error) {
        console.error('Track donation error:', error);
        res.status(500).json({ error: 'Failed to track donation' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Authenticated: get current user's donation history
// GET /api/donations/me
// ──────────────────────────────────────────────────────────────────────────────
export const getMyDonations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await pool.query(
            `SELECT 
                d.id,
                d.amount,
                d.created_at AS "createdAt",
                d.is_anonymous AS "isAnonymous",
                d.tracking_code AS "trackingCode",
                dc.code AS "donationCode",
                c.title AS "campaignTitle",
                c.id AS "campaignId",
                c.image_url AS "campaignImageUrl"
             FROM donations d
             JOIN campaigns c ON d.campaign_id = c.id
             LEFT JOIN donation_codes dc ON dc.donation_id = d.id
             WHERE d.user_id = $1
               AND d.payment_status = 'SUCCEEDED'
             ORDER BY d.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get my donations error:', error);
        res.status(500).json({ error: 'Failed to fetch donation history' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Authenticated: get current user's badges
// GET /api/donations/me/badges
// ──────────────────────────────────────────────────────────────────────────────
export const getMyBadges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Get all badge definitions + mark which are earned
        const result = await pool.query(
            `SELECT 
                bd.id,
                bd.slug,
                bd.title,
                bd.description,
                bd.icon,
                bd.rule_type AS "ruleType",
                bd.threshold,
                CASE WHEN db.id IS NOT NULL THEN true ELSE false END AS "earned",
                db.earned_at AS "earnedAt"
             FROM badge_definitions bd
             LEFT JOIN donor_badges db ON db.badge_id = bd.id AND db.user_id = $1
             ORDER BY bd.threshold ASC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get my badges error:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Public: get all badge definitions
// GET /api/donations/badges
// ──────────────────────────────────────────────────────────────────────────────
export const getAllBadgeDefinitions = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, slug, title, description, icon, rule_type AS "ruleType", threshold
             FROM badge_definitions
             ORDER BY threshold ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get badge definitions error:', error);
        res.status(500).json({ error: 'Failed to fetch badge definitions' });
    }
};
