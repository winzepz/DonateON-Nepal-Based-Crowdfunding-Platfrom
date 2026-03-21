import pool from '../db';
import { PoolClient } from 'pg';

interface BadgeDefinition {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    rule_type: string;
    threshold: number;
}

export interface EarnedBadge {
    slug: string;
    title: string;
    description: string;
    icon: string;
}

/**
 * Evaluates all badge rules for a given donor and grants any newly earned badges.
 * Returns the list of newly earned badges (for showing on the success page).
 */
export const evaluateAndGrantBadges = async (
    userId: string,
    client?: PoolClient
): Promise<EarnedBadge[]> => {
    if (!userId) return [];

    const db = client || pool;
    const newlyEarned: EarnedBadge[] = [];

    try {
        // Get donor's current stats
        const statsRes = await db.query(
            `SELECT 
                COUNT(*)::int AS donation_count,
                COALESCE(SUM(amount), 0) AS total_amount
             FROM donations
             WHERE user_id = $1
               AND payment_status = 'SUCCEEDED'`,
            [userId]
        );
        const stats = statsRes.rows[0];
        const donationCount: number = stats.donation_count;
        const totalAmount: number = parseFloat(stats.total_amount);

        // Get all badge definitions
        const badgesRes = await db.query(
            `SELECT * FROM badge_definitions ORDER BY threshold ASC`
        );
        const badges: BadgeDefinition[] = badgesRes.rows;

        // Get already earned badges
        const earnedRes = await db.query(
            `SELECT badge_id FROM donor_badges WHERE user_id = $1`,
            [userId]
        );
        const earnedIds = new Set(earnedRes.rows.map((r: any) => r.badge_id));

        for (const badge of badges) {
            if (earnedIds.has(badge.id)) continue; // Already earned

            let qualified = false;

            switch (badge.rule_type) {
                case 'FIRST_DONATION':
                    qualified = donationCount >= 1;
                    break;
                case 'DONATION_COUNT':
                    qualified = donationCount >= badge.threshold;
                    break;
                case 'TOTAL_AMOUNT':
                    qualified = totalAmount >= badge.threshold;
                    break;
                default:
                    break;
            }

            if (qualified) {
                try {
                    await db.query(
                        `INSERT INTO donor_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [userId, badge.id]
                    );
                    newlyEarned.push({
                        slug: badge.slug,
                        title: badge.title,
                        description: badge.description,
                        icon: badge.icon,
                    });
                } catch (_err) {
                    // Ignore duplicate insert errors silently
                }
            }
        }
    } catch (error) {
        console.error('Badge evaluation error:', error);
        // Non-fatal: don't throw, just return empty
    }

    return newlyEarned;
};
