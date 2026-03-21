import crypto from 'crypto';
import { PoolClient } from 'pg';
import pool from '../db';

/**
 * Generates a unique donation code in the format: DN-XXXX-XXXX-XXXX
 */
export const generateDonationCode = (): string => {
    const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `DN-${part()}-${part()}-${part()}`;
};

/**
 * Creates a donation code record for a successful donation.
 * Idempotent: if one already exists for this donation_id, returns the existing code.
 */
export const createDonationCode = async (
    donationId: string,
    campaignId: string,
    donorDisplayName: string,
    amount: number,
    gateway: string,
    client?: PoolClient
): Promise<string> => {
    const db = client || pool;

    // Check if code already exists (idempotency)
    const existing = await db.query(
        `SELECT code FROM donation_codes WHERE donation_id = $1`,
        [donationId]
    );
    if (existing.rows.length > 0) {
        return existing.rows[0].code;
    }

    // Generate unique code (retry on collision, extremely unlikely)
    let code = generateDonationCode();
    let attempts = 0;
    while (attempts < 5) {
        const conflict = await db.query(
            `SELECT id FROM donation_codes WHERE code = $1`,
            [code]
        );
        if (conflict.rows.length === 0) break;
        code = generateDonationCode();
        attempts++;
    }

    await db.query(
        `INSERT INTO donation_codes (code, donation_id, campaign_id, donor_display_name, amount, gateway)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (donation_id) DO NOTHING`,
        [code, donationId, campaignId, donorDisplayName || 'Anonymous', amount, gateway]
    );

    return code;
};

/**
 * Looks up a donation code and returns public (possibly masked) info.
 */
export const lookupDonationCode = async (code: string) => {
    const result = await pool.query(
        `SELECT 
            dc.code,
            dc.donor_display_name AS "donorDisplayName",
            dc.amount,
            dc.gateway,
            dc.created_at AS "createdAt",
            c.title AS "campaignTitle",
            c.id AS "campaignId",
            d.is_released AS "isReleased",
            d.is_anonymous AS "isAnonymous"
         FROM donation_codes dc
         JOIN campaigns c ON dc.campaign_id = c.id
         JOIN donations d ON dc.donation_id = d.id
         WHERE dc.code = $1`,
        [code.toUpperCase()]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    // Mask donor name if anonymous
    const maskedName = row.isAnonymous
        ? 'Anonymous'
        : maskName(row.donorDisplayName);

    return {
        code: row.code,
        campaignTitle: row.campaignTitle,
        campaignId: row.campaignId,
        amount: parseFloat(row.amount),
        donorName: maskedName,
        gateway: row.gateway,
        createdAt: row.createdAt,
        isReleased: row.isReleased,
        status: 'VERIFIED',
    };
};

/**
 * Masks a name: "Ram Shrestha" → "R** S*******"
 */
const maskName = (name: string): string => {
    if (!name || name === 'Anonymous') return 'Anonymous';
    return name
        .split(' ')
        .map(part => {
            if (part.length <= 1) return part;
            return part[0] + '*'.repeat(part.length - 1);
        })
        .join(' ');
};
