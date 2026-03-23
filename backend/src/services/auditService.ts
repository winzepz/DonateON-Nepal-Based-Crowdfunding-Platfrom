import { PoolClient } from 'pg';
import pool from '../db';

export type AuditAction =
    | 'KYC_SUBMIT'
    | 'KYC_APPROVE'
    | 'KYC_REJECT'
    | 'CAMPAIGN_CREATE'
    | 'CAMPAIGN_UPDATE'
    | 'CAMPAIGN_DELETE'
    | 'CAMPAIGN_APPROVE'
    | 'CAMPAIGN_REJECT'
    | 'PAYOUT_APPROVE'
    | 'PAYOUT_REJECT'
    | 'USER_ROLE_CHANGE'
    | 'DONATION_RELEASE'
    | 'DONATION_SUCCESS'
    | 'EXPORT_DONATIONS_CSV'
    | 'FINANCIAL_AUDIT';

export type AuditEntity = 'KYC' | 'CAMPAIGN' | 'PAYOUT' | 'USER' | 'DONATION';

export const recordAuditLog = async (params: {
    userId?: string;
    action: AuditAction;
    entityType: AuditEntity;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    client?: PoolClient;
}) => {
    try {
        const db = params.client || pool;
        await db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                params.userId || null,
                params.action,
                params.entityType,
                params.entityId || null,
                params.details ? JSON.stringify(params.details) : null,
                params.ipAddress || null
            ]
        );
    } catch (error) {
        console.error('Failed to record audit log:', error);
        // We don't throw here to avoid failing the main transaction if logging fails, 
        // though in high-security apps you might want to.
    }
};
