import { Request, Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getGlobalStats = async (_req: Request, res: Response) => {
    try {
        const campaignStats = await pool.query(
            `SELECT 
                COALESCE(SUM(current_amount), 0) as "totalRaised",
                COUNT(*) FILTER (WHERE status = 'APPROVED') as "activeCampaigns"
             FROM campaigns`
        );

        const donorStats = await pool.query(
            `SELECT COUNT(DISTINCT user_id) as "happyDonors"
             FROM donations
             WHERE payment_status = 'SUCCEEDED'`
        );

        const communityStats = await pool.query(
            `SELECT COUNT(DISTINCT organizer_id) as "impactedCommunities" FROM campaigns`
        );

        res.json({
            totalRaised: parseFloat(campaignStats.rows[0].totalRaised),
            activeCampaigns: parseInt(campaignStats.rows[0].activeCampaigns),
            happyDonors: parseInt(donorStats.rows[0].happyDonors),
            impactedCommunities: parseInt(communityStats.rows[0].impactedCommunities),
        });
    } catch (error) {
        console.error('Get global stats error:', error);
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const stats = await pool.query(
            `SELECT 
                COALESCE(SUM(amount), 0) as "totalImpact",
                COALESCE(SUM(amount) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)), 0) as "thisMonth"
             FROM donations
             WHERE user_id = $1
               AND payment_status = 'SUCCEEDED'`,
            [userId]
        );

        res.json({
            totalImpact: parseFloat(stats.rows[0].totalImpact),
            thisMonth: parseFloat(stats.rows[0].thisMonth),
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

export const getAdminSummary = async (_req: AuthRequest, res: Response) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as "totalUsers",
                (SELECT COUNT(*) FROM kyc_documents WHERE status = 'PENDING') as "pendingKYC",
                (SELECT COUNT(*) FROM campaigns WHERE status = 'PENDING') as "pendingCampaigns",
                (SELECT COUNT(*) FROM payouts WHERE status = 'PENDING') as "pendingPayouts",
                (SELECT COUNT(*) FROM support_tickets WHERE status != 'CLOSED' AND status != 'RESOLVED') as "pendingTickets",
                (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE payment_status = 'SUCCEEDED') as "totalDonated",
                (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE status = 'APPROVED') as "totalReleased"
        `);

        const row = stats.rows[0];
        res.json({
            totalUsers: parseInt(row.totalUsers),
            pendingKYC: parseInt(row.pendingKYC),
            pendingCampaigns: parseInt(row.pendingCampaigns),
            pendingPayouts: parseInt(row.pendingPayouts),
            pendingTickets: parseInt(row.pendingTickets || 0),
            totalDonated: parseFloat(row.totalDonated),
            totalReleased: parseFloat(row.totalReleased),
            escrowBalance: parseFloat(row.totalDonated) - parseFloat(row.totalReleased),
        });
    } catch (error) {
        console.error('Get admin summary error:', error);
        res.status(500).json({ error: 'Failed to fetch admin summary' });
    }
};
