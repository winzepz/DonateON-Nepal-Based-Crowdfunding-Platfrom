import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool, { withTransaction } from '../db';
import { recordAuditLog } from '../services/auditService';

export const requestPayout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { campaignId, amount, bankName, accountNumber, accountHolderName, remarks } = req.body;

        await withTransaction(async (client) => {
            const campaignRes = await client.query(
                `SELECT current_amount, organizer_id FROM campaigns WHERE id = $1 FOR UPDATE`,
                [campaignId]
            );

            if (campaignRes.rows.length === 0) {
                throw new Error('Campaign not found');
            }

            const campaign = campaignRes.rows[0];
            if (campaign.organizer_id !== userId) {
                throw new Error('Not authorized');
            }

            const reservedRes = await client.query(
                `SELECT COALESCE(SUM(amount), 0) as "reservedTotal"
                 FROM payouts
                 WHERE campaign_id = $1 AND status IN ('PENDING', 'APPROVED')`,
                [campaignId]
            );

            const reservedTotal = parseFloat(reservedRes.rows[0].reservedTotal);
            const availableBalance = parseFloat(campaign.current_amount) - reservedTotal;

            if (parseFloat(amount) > availableBalance) {
                throw new Error(`Insufficient available balance. Available: ${availableBalance}`);
            }

            await client.query(
                `INSERT INTO payouts (campaign_id, organizer_id, amount, bank_name, account_number, account_holder_name, remarks)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [campaignId, userId, amount, bankName, accountNumber, accountHolderName, remarks]
            );
        });

        res.status(201).json({ message: 'Payout requested successfully' });
    } catch (error) {
        console.error('Request payout error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to request payout' });
    }
};

export const getMyPayouts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await pool.query(
            `SELECT p.*, c.title as "campaignTitle" 
             FROM payouts p
             JOIN campaigns c ON p.campaign_id = c.id
             WHERE p.organizer_id = $1
             ORDER BY p.requested_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get my payouts error:', error);
        res.status(500).json({ error: 'Failed to fetch payouts' });
    }
};

export const getAllPayouts = async (_req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT p.*, c.title as "campaignTitle", u.name as "organizerName", u.email as "organizerEmail"
             FROM payouts p
             JOIN campaigns c ON p.campaign_id = c.id
             JOIN users u ON p.organizer_id = u.id
             ORDER BY p.requested_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get all payouts error:', error);
        res.status(500).json({ error: 'Failed to fetch all payouts' });
    }
};

export const getPayoutDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT p.*, 
                    c.title AS "campaignTitle", c.current_amount AS "campaignCurrentAmount", c.target_amount AS "campaignTargetAmount",
                    u.name AS "organizerName", u.email AS "organizerEmail", u.kyc_status AS "organizerKycStatus"
             FROM payouts p
             JOIN campaigns c ON p.campaign_id = c.id
             JOIN users u ON p.organizer_id = u.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payout request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get payout details error:', error);
        res.status(500).json({ error: 'Failed to fetch payout intelligence' });
    }
};

export const approvePayout = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await withTransaction(async (client) => {
            const payoutRes = await client.query(
                `SELECT * FROM payouts WHERE id = $1 FOR UPDATE`,
                [id]
            );

            if (payoutRes.rows.length === 0) {
                throw new Error('Payout not found');
            }

            const payout = payoutRes.rows[0];
            if (payout.status !== 'PENDING') {
                throw new Error('Payout already processed');
            }

            let remaining = parseFloat(payout.amount);
            const donationsRes = await client.query<{
                id: string;
                amount: string;
                allocated_amount: string;
            }>(
                `SELECT
                    d.id,
                    d.amount,
                    COALESCE((
                        SELECT SUM(pa.allocated_amount)
                        FROM payout_allocations pa
                        WHERE pa.donation_id = d.id
                    ), 0) AS allocated_amount
                 FROM donations d
                 WHERE d.campaign_id = $1
                   AND d.payment_status = 'SUCCEEDED'
                 ORDER BY d.created_at ASC
                 FOR UPDATE`,
                [payout.campaign_id]
            );

            for (const donation of donationsRes.rows) {
                if (remaining <= 0) break;

                const donationAmount = parseFloat(donation.amount);
                const alreadyAllocated = parseFloat(donation.allocated_amount);
                const allocatable = donationAmount - alreadyAllocated;
                if (allocatable <= 0) continue;

                const allocation = Math.min(remaining, allocatable);
                await client.query(
                    `INSERT INTO payout_allocations (payout_id, donation_id, allocated_amount)
                     VALUES ($1, $2, $3)`,
                    [id, donation.id, allocation]
                );

                remaining -= allocation;

                if (Math.abs(allocation - allocatable) < 0.01) {
                    await client.query(
                        `UPDATE donations
                         SET is_released = true,
                             payout_id = $1,
                             updated_at = NOW()
                         WHERE id = $2`,
                        [id, donation.id]
                    );
                }
            }

            if (remaining > 0.01) {
                throw new Error('Insufficient fully verified funds available for this payout');
            }

            await client.query(
                `UPDATE payouts SET status = 'APPROVED', processed_at = NOW() WHERE id = $1`,
                [id]
            );

            await recordAuditLog({
                client,
                userId: req.user?.id,
                action: 'PAYOUT_APPROVE',
                entityType: 'PAYOUT',
                entityId: id,
                details: { campaignId: payout.campaign_id, amount: payout.amount },
            });
        });

        res.json({ message: 'Payout approved and allocated' });
    } catch (error) {
        console.error('Approve payout error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to approve payout' });
    }
};

export const rejectPayout = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await withTransaction(async (client) => {
            await client.query(
                `UPDATE payouts SET status = 'REJECTED', processed_at = NOW() WHERE id = $1`,
                [id]
            );

            await recordAuditLog({
                client,
                userId: req.user?.id,
                action: 'PAYOUT_REJECT',
                entityType: 'PAYOUT',
                entityId: id,
            });
        });

        res.json({ message: 'Payout rejected' });
    } catch (error) {
        console.error('Reject payout error:', error);
        res.status(500).json({ error: 'Failed to reject payout' });
    }
};
