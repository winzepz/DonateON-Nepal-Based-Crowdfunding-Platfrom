import { PoolClient } from 'pg';
import pool from '../db';
import { logger } from '../utils/logger';

/**
 * Distributes a donation amount from a category pool to its active campaigns.
 * Uses a "Finish Line First" strategy:
 * 1. Prioritize campaigns closest to their goal (e.g. > 80% funded).
 * 2. If all are balanced, split among active ones.
 */
export const distributePoolDonation = async (
    categoryPoolId: string,
    amount: number,
    donationId: string,
    client: PoolClient
) => {
    try {
        // Find the category slug first (to link with campaigns)
        const poolRes = await client.query('SELECT slug FROM category_pools WHERE id = $1', [categoryPoolId]);
        if (poolRes.rows.length === 0) return;
        const categorySlug = poolRes.rows[0].slug;

        // Find active campaigns in this category
        const campaignsRes = await client.query(`
            SELECT id, target_amount, current_amount, 
                   (current_amount / target_amount * 100) as percent_funded
            FROM campaigns
            WHERE category = $1 
              AND status = 'APPROVED'
              AND current_amount < target_amount
            ORDER BY percent_funded DESC -- Closest to finishing first
            LIMIT 5
        `, [categorySlug]);

        if (campaignsRes.rows.length === 0) {
            logger.info('distribution.skipped', { categoryPoolId, reason: 'No active campaigns' });
            return;
        }

        const eligibleCampaigns = campaignsRes.rows;
        let remainingAmount = amount;
        const distributedTo = [];

        for (const campaign of eligibleCampaigns) {
            if (remainingAmount <= 0) break;

            const needed = Number(campaign.target_amount) - Number(campaign.current_amount);
            const allocation = Math.min(remainingAmount, needed);

            if (allocation > 0) {
                await client.query(`
                    INSERT INTO donation_distributions (donation_id, campaign_id, amount)
                    VALUES ($1, $2, $3)
                `, [donationId, campaign.id, allocation]);

                await client.query(`
                    UPDATE campaigns 
                    SET current_amount = current_amount + $1 
                    WHERE id = $2
                `, [allocation, campaign.id]);

                distributedTo.push({
                    id: campaign.id,
                    title: campaign.title,
                    amount: allocation
                });

                remainingAmount -= allocation;
            }
        }

        logger.info('distribution.completed', { donationId, amount, campaignsHelped: distributedTo.length });
        return distributedTo;

    } catch (error) {
        logger.error('distribution.failed', { error, donationId });
        throw error;
    }
};
