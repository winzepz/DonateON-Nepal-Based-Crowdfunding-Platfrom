import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import pool, { withTransaction } from '../db';
import { recordAuditLog } from '../services/auditService';

// ──────────────────────────────────────────────────────────────────────────────
// KYC Management
// ──────────────────────────────────────────────────────────────────────────────

export const getPendingKYC = async (_req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT d.id, d.user_id AS "userId", d.document_type AS "documentType", 
                    d.image_url AS "imageUrl", d.status, d.created_at AS "createdAt",
                    u.name AS "userName", u.email AS "userEmail"
             FROM kyc_documents d
             JOIN users u ON d.user_id = u.id
             WHERE d.status = 'PENDING'
             ORDER BY d.created_at ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get pending KYC error:', error);
        res.status(500).json({ error: 'Failed to fetch KYC requests' });
    }
};

export const getKYCDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT d.id, d.user_id AS "userId", d.document_type AS "documentType", 
                    d.image_url AS "imageUrl", d.status, d.created_at AS "createdAt",
                    u.name AS "userName", u.email AS "userEmail", u.kyc_status AS "userKycStatus"
             FROM kyc_documents d
             JOIN users u ON d.user_id = u.id
             WHERE d.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            console.warn(`KYC detail fetch failed: No record found for ID ${id}`);
            return res.status(404).json({ error: 'KYC request not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get KYC details error:', error);
        res.status(500).json({ error: 'Failed to fetch KYC details' });
    }
};

export const approveKYC = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await withTransaction(async (client) => {
            const docResult = await client.query('SELECT user_id FROM kyc_documents WHERE id = $1 FOR UPDATE', [id]);
            if (docResult.rows.length === 0) {
                throw new Error('Document not found');
            }
            const userId = docResult.rows[0].user_id;

            await client.query("UPDATE kyc_documents SET status = 'VERIFIED' WHERE id = $1", [id]);
            await client.query("UPDATE users SET kyc_status = 'VERIFIED', role = 'CAMPAIGN_CREATOR' WHERE id = $1 AND role = 'DONOR'", [userId]);
            
            await recordAuditLog({
                client,
                userId: req.user?.id,
                action: 'KYC_APPROVE',
                entityType: 'KYC',
                entityId: id,
                details: { targetUserId: userId }
            });

            await client.query(
                `INSERT INTO notifications (user_id, type, message) VALUES ($1, 'KYC_APPROVED', 'Your KYC documents have been approved. You can now create campaigns.')`,
                [userId]
            );
        });

        res.json({ message: 'KYC approved' });
    } catch (error) {
        console.error('Approve KYC error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to approve KYC' });
    }
};

export const rejectKYC = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await withTransaction(async (client) => {
            const docResult = await client.query('SELECT user_id FROM kyc_documents WHERE id = $1 FOR UPDATE', [id]);
            if (docResult.rows.length === 0) {
                throw new Error('Document not found');
            }
            const userId = docResult.rows[0].user_id;

            await client.query("UPDATE kyc_documents SET status = 'REJECTED' WHERE id = $1", [id]);
            await client.query("UPDATE users SET kyc_status = 'REJECTED' WHERE id = $1", [userId]);
            
            await recordAuditLog({
                client,
                userId: req.user?.id,
                action: 'KYC_REJECT',
                entityType: 'KYC',
                entityId: id,
                details: { targetUserId: userId }
            });

            await client.query(
                `INSERT INTO notifications (user_id, type, message) VALUES ($1, 'KYC_REJECTED', 'Your KYC documents were rejected. Please check the requirements and submit again.')`,
                [userId]
            );
        });

        res.json({ message: 'KYC rejected' });
    } catch (error) {
        console.error('Reject KYC error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to reject KYC' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Campaign Management
// ──────────────────────────────────────────────────────────────────────────────

export const getPendingCampaigns = async (_req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.title, c.description, c.image_url AS "imageUrl", 
                    c.target_amount AS "targetAmount", c.current_amount AS "currentAmount",
                    c.status, c.created_at AS "createdAt", u.name AS "organizerName"
             FROM campaigns c
             JOIN users u ON c.organizer_id = u.id
             WHERE c.status = 'PENDING'
             ORDER BY c.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get pending campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch pending campaigns' });
    }
};

export const getCampaignDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT c.*, 
                    c.image_url AS "imageUrl", c.target_amount AS "targetAmount", c.current_amount AS "currentAmount",
                    u.name AS "organizerName", u.email AS "organizerEmail", 
                    u.kyc_status AS "organizerKycStatus",
                    (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE campaign_id = c.id AND payment_status = 'SUCCEEDED') AS "totalRaised",
                    (SELECT COUNT(*) FROM donations WHERE campaign_id = c.id AND payment_status = 'SUCCEEDED') AS "donationCount"
             FROM campaigns c
             JOIN users u ON c.organizer_id = u.id
             WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            console.warn(`Campaign detail fetch failed: No record found for ID ${id}`);
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const campaign = result.rows[0];

        // Fetch Payout Stats
        const payoutStats = await pool.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN amount ELSE 0 END), 0) AS "releasedAmount",
                COALESCE(SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END), 0) AS "pendingPayoutAmount"
             FROM payouts WHERE campaign_id = $1`,
            [id]
        );

        // Fetch Recent Donations for this campaign
        const recentDonations = await pool.query(
            `SELECT d.*, u.name AS "donorName", dc.code AS "donationCode"
             FROM donations d
             LEFT JOIN users u ON d.user_id = u.id
             LEFT JOIN donation_codes dc ON dc.donation_id = d.id
             WHERE d.campaign_id = $1 AND d.payment_status = 'SUCCEEDED'
             ORDER BY d.created_at DESC LIMIT 10`,
            [id]
        );

        res.json({
            ...campaign,
            payouts: payoutStats.rows[0],
            recentDonations: recentDonations.rows
        });
    } catch (error) {
        console.error('Get admin campaign details error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign intelligence' });
    }
};

export const approveCampaign = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        await withTransaction(async (client) => {
            const campRes = await client.query("UPDATE campaigns SET status = 'APPROVED' WHERE id = $1 RETURNING organizer_id, title", [id]);
            
            if (campRes.rows.length === 0) throw new Error("Campaign not found");
            const campaign = campRes.rows[0];

            await recordAuditLog({ client, userId: req.user?.id, action: 'CAMPAIGN_APPROVE', entityType: 'CAMPAIGN', entityId: id });
            
            // Notify User
            await client.query(
                `INSERT INTO notifications (user_id, type, message, link) VALUES ($1, 'CAMPAIGN_APPROVED', $2, $3)`,
                [campaign.organizer_id, `Your campaign "${campaign.title}" has been approved and is now live!`, `/campaigns/${id}`]
            );
        });

        res.json({ message: 'Campaign approved' });
    } catch (error) {
        console.error('Approve campaign error:', error);
        res.status(500).json({ error: 'Failed to approve campaign' });
    }
};

export const rejectCampaign = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await withTransaction(async (client) => {
            const campRes = await client.query("UPDATE campaigns SET status = 'REJECTED' WHERE id = $1 RETURNING organizer_id, title", [id]);
            
            if (campRes.rows.length === 0) throw new Error("Campaign not found");
            const campaign = campRes.rows[0];

            await recordAuditLog({ client, userId: req.user?.id, action: 'CAMPAIGN_REJECT', entityType: 'CAMPAIGN', entityId: id });
            
            // Notify User
            await client.query(
                `INSERT INTO notifications (user_id, type, message) VALUES ($1, 'CAMPAIGN_REJECTED', $2)`,
                [campaign.organizer_id, `Your campaign "${campaign.title}" was not approved. Please review our guidelines or contact support.`]
            );
        });
        
        res.json({ message: 'Campaign rejected' });
    } catch (error) {
        console.error('Reject campaign error:', error);
        res.status(500).json({ error: 'Failed to reject campaign' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Donations Management
// ──────────────────────────────────────────────────────────────────────────────

export const getAdminDonations = async (req: AuthRequest, res: Response) => {
    try {
        const {
            search = '',
            campaign_id = '',
            startDate = '',
            endDate = '',
            page = '1',
            limit = '50'
        } = req.query as Record<string, string>;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (search) {
            conditions.push(`(dc.code ILIKE $${idx} OR d.gateway_transaction_id ILIKE $${idx} OR u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }

        if (campaign_id) {
            conditions.push(`d.campaign_id = $${idx}`);
            params.push(campaign_id);
            idx++;
        }

        if (startDate) {
            conditions.push(`d.created_at >= $${idx}`);
            params.push(new Date(startDate));
            idx++;
        }

        if (endDate) {
            conditions.push(`d.created_at <= $${idx}`);
            params.push(new Date(endDate + 'T23:59:59'));
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countRes = await pool.query(
            `SELECT COUNT(*) FROM donations d
             LEFT JOIN donation_codes dc ON dc.donation_id = d.id
             LEFT JOIN users u ON d.user_id = u.id
             ${whereClause}`,
            params
        );
        const total = parseInt(countRes.rows[0].count);

        const result = await pool.query(
            `SELECT 
                d.id,
                d.amount,
                d.payment_status AS "paymentStatus",
                d.created_at AS "createdAt",
                d.is_anonymous AS "isAnonymous",
                d.is_released AS "isReleased",
                d.gateway_transaction_id AS "gatewayRef",
                dc.code AS "donationCode",
                dc.gateway,
                c.title AS "campaignTitle",
                c.id AS "campaignId",
                COALESCE(u.name, d.donor_name, 'Guest') AS "donorName",
                u.email AS "donorEmail",
                u.id AS "donorId"
             FROM donations d
             LEFT JOIN donation_codes dc ON dc.donation_id = d.id
             LEFT JOIN campaigns c ON d.campaign_id = c.id
             LEFT JOIN users u ON d.user_id = u.id
             ${whereClause}
             ORDER BY d.created_at DESC
             LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, parseInt(limit), offset]
        );

        res.json({
            data: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('Get admin donations error:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
};

export const exportDonationsCSV = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate = '', endDate = '', campaign_id = '' } = req.query as Record<string, string>;
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (campaign_id) {
            conditions.push(`d.campaign_id = $${idx}`);
            params.push(campaign_id);
            idx++;
        }
        if (startDate) {
            conditions.push(`d.created_at >= $${idx}`);
            params.push(new Date(startDate));
            idx++;
        }
        if (endDate) {
            conditions.push(`d.created_at <= $${idx}`);
            params.push(new Date(endDate + 'T23:59:59'));
            idx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT 
                dc.code AS "Donation Code",
                d.amount AS "Amount (NPR)",
                d.payment_status AS "Payment Status",
                dc.gateway AS "Gateway",
                c.title AS "Campaign",
                CASE WHEN d.is_anonymous THEN 'Anonymous' ELSE COALESCE(u.name, d.donor_name, 'Guest') END AS "Donor Name",
                u.email AS "Donor Email",
                d.gateway_transaction_id AS "Gateway Ref",
                d.is_released AS "Released",
                d.created_at AS "Date"
             FROM donations d
             LEFT JOIN donation_codes dc ON dc.donation_id = d.id
             LEFT JOIN campaigns c ON d.campaign_id = c.id
             LEFT JOIN users u ON d.user_id = u.id
             ${whereClause}
             ORDER BY d.created_at DESC`,
            params
        );

        const rows = result.rows;
        if (rows.length === 0) {
            return res.status(200).send('No donations found for the selected filters.');
        }

        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map(row =>
            Object.values(row).map(val => `"${val !== null && val !== undefined ? String(val).replace(/"/g, '""') : ''}"`).join(',')
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=donations_export.csv');
        res.status(200).send(headers + '\n' + csvRows);

        await recordAuditLog({
            userId: req.user?.id,
            action: 'EXPORT_DONATIONS_CSV',
            entityType: 'DONATION',
            details: { filters: { startDate, endDate, campaign_id } }
        });
    } catch (error) {
        console.error('Export donations CSV error:', error);
        res.status(500).json({ error: 'Failed to export donations' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Platform Statistics
// ──────────────────────────────────────────────────────────────────────────────

export const getAdminStats = async (_req: AuthRequest, res: Response) => {
    try {
        const [
            totalsRes,
            timeBreakdownRes,
            campaignCountRes,
            donorCountRes,
            topCampaignsRes,
            gatewayBreakdownRes,
            recentRes,
            volumeRes,
            creatorCountRes,
            verifiedCountRes
        ] = await Promise.all([
            pool.query(
                `SELECT 
                    COUNT(*)::int AS "totalDonations",
                    COALESCE(SUM(amount), 0)::numeric AS "totalRaised",
                    COALESCE(AVG(amount), 0)::numeric AS "avgDonation"
                 FROM donations
                 WHERE payment_status = 'SUCCEEDED'`
            ),
            pool.query(
                `SELECT 
                    COALESCE(SUM(amount) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 0)::numeric AS "raised24h",
                    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS "donations24h",
                    COALESCE(SUM(amount) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'), 0)::numeric AS "raised7d",
                    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS "donations7d",
                    COALESCE(SUM(amount) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'), 0)::numeric AS "raised30d",
                    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS "donations30d",
                    COALESCE(SUM(amount) FILTER (WHERE created_at > NOW() - INTERVAL '1 year'), 0)::numeric AS "raised1y",
                    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 year')::int AS "donations1y"
                 FROM donations
                 WHERE payment_status = 'SUCCEEDED'`
            ),
            pool.query(`SELECT COUNT(*)::int AS "totalCampaigns" FROM campaigns WHERE status = 'APPROVED'`),
            pool.query(`SELECT COUNT(DISTINCT user_id)::int AS "totalDonors" FROM donations WHERE user_id IS NOT NULL AND payment_status = 'SUCCEEDED'`),
            pool.query(
                `SELECT c.id, c.title, COUNT(d.id)::int AS "donationCount", COALESCE(SUM(d.amount), 0)::numeric AS "totalRaised"
                 FROM campaigns c
                 LEFT JOIN donations d ON d.campaign_id = c.id AND d.payment_status = 'SUCCEEDED'
                 WHERE c.status = 'APPROVED'
                 GROUP BY c.id, c.title
                 ORDER BY "totalRaised" DESC
                 LIMIT 5`
            ),
            pool.query(
                `SELECT dc.gateway, COUNT(*)::int AS "count", COALESCE(SUM(d.amount), 0)::numeric AS "total"
                 FROM donations d
                 LEFT JOIN donation_codes dc ON dc.donation_id = d.id
                 WHERE d.payment_status = 'SUCCEEDED'
                 GROUP BY dc.gateway`
            ),
            pool.query(
                `SELECT d.amount, dc.code, c.title AS "campaignTitle", d.created_at AS "createdAt"
                 FROM donations d
                 LEFT JOIN donation_codes dc ON dc.donation_id = d.id
                 LEFT JOIN campaigns c ON d.campaign_id = c.id
                 WHERE d.payment_status = 'SUCCEEDED'
                 ORDER BY d.created_at DESC
                 LIMIT 10`
            ),
            pool.query(
                `SELECT DATE(created_at) AS date, SUM(amount) AS volume 
                 FROM donations 
                 WHERE payment_status = 'SUCCEEDED' 
                 AND created_at > NOW() - INTERVAL '30 days'
                 GROUP BY DATE(created_at) 
                 ORDER BY date ASC`
            ),
            pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'CAMPAIGN_CREATOR'`),
            pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE kyc_status = 'VERIFIED'`)
        ]);

        const timeData = timeBreakdownRes.rows[0];

        res.json({
            totalDonations: totalsRes.rows[0].totalDonations,
            totalRaised: parseFloat(totalsRes.rows[0].totalRaised),
            avgDonation: parseFloat(totalsRes.rows[0].avgDonation),
            
            // Time Breakdowns
            raised24h: parseFloat(timeData.raised24h),
            donations24h: parseInt(timeData.donations24h),
            raised7d: parseFloat(timeData.raised7d),
            donations7d: parseInt(timeData.donations7d),
            raised30d: parseFloat(timeData.raised30d),
            donations30d: parseInt(timeData.donations30d),
            raised1y: parseFloat(timeData.raised1y),
            donations1y: parseInt(timeData.donations1y),

            totalCampaigns: campaignCountRes.rows[0].totalCampaigns,
            totalDonors: donorCountRes.rows[0].totalDonors,
            topCampaigns: topCampaignsRes.rows,
            gatewayBreakdown: gatewayBreakdownRes.rows,
            recentDonations: recentRes.rows,
            campaignVolume: volumeRes.rows,
            activeCreators: creatorCountRes.rows[0].count,
            verifiedUsers: verifiedCountRes.rows[0].count
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch platform stats' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ──────────────────────────────────────────────────────────────────────────────

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const { entityType, entityId, action } = req.query as Record<string, string>;
        
        let query = `
            SELECT al.id, al.user_id, al.action, al.entity_type AS "entityType", al.entity_id AS "entityId", 
                   al.details, al.ip_address AS "ipAddress", al.created_at AS "createdAt",
                   u.name AS "adminName", u.email AS "adminEmail"
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
        `;
        
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (entityType) {
            if (entityType === 'FINANCIAL') {
                conditions.push(`al.entity_type IN ('PAYOUT', 'DONATION')`);
            } else {
                conditions.push(`al.entity_type = $${idx}`);
                params.push(entityType);
                idx++;
            }
        }
        if (entityId) {
            conditions.push(`al.entity_id = $${idx}`);
            params.push(entityId);
            idx++;
        }
        if (action) {
            conditions.push(`al.action = $${idx}`);
            params.push(action);
            idx++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY al.created_at DESC LIMIT 200`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

export const exportAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const { entityType, entityId } = req.query as Record<string, string>;
        
        let query = `
            SELECT al.*, u.name AS "adminName", u.email AS "adminEmail"
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
        `;
        
        const conditions: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (entityType) {
            conditions.push(`al.entity_type = $${idx}`);
            params.push(entityType);
            idx++;
        }
        if (entityId) {
            conditions.push(`al.entity_id = $${idx}`);
            params.push(entityId);
            idx++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY al.created_at DESC`;

        const result = await pool.query(query, params);

        const rows = result.rows;
        const csvHeader = 'ID,Timestamp,Admin Name,Admin Email,Action,Entity Type,Entity ID,Details,IP Address\n';
        const csvRows = rows.map(row => {
            const details = row.details ? JSON.stringify(row.details).replace(/"/g, '""') : '';
            return `${row.id},${row.created_at},"${row.adminName || ''}","${row.adminEmail || ''}",${row.action},${row.entity_type},${row.entity_id},"${details}",${row.ip_address || ''}`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
        res.status(200).send(csvHeader + csvRows);
    } catch (error) {
        console.error('Export audit logs error:', error);
        res.status(500).json({ error: 'Failed to export audit logs' });
    }
};
