import axios from 'axios';
import crypto from 'crypto';
import { PoolClient } from 'pg';
import pool, { withTransaction } from '../db';
import { createDonationCode } from './donationCodeService';
import { evaluateAndGrantBadges, EarnedBadge } from './badgeService';
import { logger } from '../utils/logger';
import { recordAuditLog } from './auditService';

export type PaymentGateway = 'ESEWA' | 'KHALTI';
type DonationPaymentStatus = 'INITIATED' | 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'MISMATCHED';
type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'MISMATCHED';

type DonationRow = {
    id: string;
    amount: string;
    campaign_id: string;
    user_id: string | null;
    is_anonymous: boolean;
    donor_name: string | null;
    payment_gateway: PaymentGateway;
    payment_status: DonationPaymentStatus;
    currency: string;
};

type PaymentTransactionRow = {
    id: string;
    donation_id: string;
    gateway: PaymentGateway;
    gateway_reference: string | null;
    gateway_transaction_id: string | null;
    gateway_redirect_url: string | null;
    verification_status: VerificationStatus;
};

type InitiatePaymentInput = {
    gateway: PaymentGateway;
    amount: number;
    campaignId: string;
    userId?: string;
    isAnonymous?: boolean;
    donorName?: string;
    customerName?: string;
    idempotencyKey?: string;
    requestId?: string;
    ipAddress?: string;
};

type ExistingPaymentState = {
    donation: DonationRow;
    transaction: PaymentTransactionRow;
};

export type PaymentInitiationResult = {
    donationId: string;
    paymentStatus: DonationPaymentStatus;
    gateway: PaymentGateway;
    url?: string;
    params?: Record<string, string | number>;
    payment_url?: string;
    pidx?: string;
    expiresAt?: string;
    reused?: boolean;
};

export type PaymentVerificationResult = {
    status: 'success' | 'pending' | 'failed';
    message: string;
    donationId?: string;
    donationCode?: string;
    newBadges?: EarnedBadge[];
    paymentStatus?: DonationPaymentStatus;
};

type KhaltiLookupResponse = {
    pidx: string;
    total_amount: number;
    status: string;
    transaction_id: string | null;
    fee?: number;
    refunded?: boolean;
};

type EsewaSuccessPayload = {
    status: string;
    signature?: string;
    transaction_code?: string;
    total_amount: number | string;
    transaction_uuid: string;
    product_code: string;
    signed_field_names?: string;
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const WEBHOOK_SHARED_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || '';

const ensureConfiguredValue = (name: string, fallback?: string) => {
    const value = process.env[name] || fallback;
    if (!value) {
        throw new Error(`${name} is not configured`);
    }
    if (process.env.NODE_ENV === 'production' && fallback && value === fallback) {
        throw new Error(`${name} must be explicitly configured in production`);
    }
    return value;
};

const getEsewaConfig = () => ({
    merchantCode: ensureConfiguredValue('ESEWA_MERCHANT_CODE', 'EPAYTEST'),
    secretKey: ensureConfiguredValue('ESEWA_SECRET_KEY', '8gBm/:&EnhH.1/q'),
    paymentUrl: process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    statusCheckUrl:
        process.env.ESEWA_STATUS_CHECK_URL ||
        'https://rc.esewa.com.np/api/epay/transaction/status/',
});

const getKhaltiConfig = () => ({
    secretKey: ensureConfiguredValue('KHALTI_SECRET_KEY', 'test_secret_key_placeholder'),
    initiateUrl: process.env.KHALTI_INITIATE_URL || 'https://dev.khalti.com/api/v2/epayment/initiate/',
    lookupUrl: process.env.KHALTI_LOOKUP_URL || 'https://dev.khalti.com/api/v2/epayment/lookup/',
});

const normalizeAmount = (amount: number) => {
    const normalized = Number(amount);
    if (!Number.isFinite(normalized) || normalized <= 0) {
        throw new Error('Invalid donation amount');
    }
    return Number(normalized.toFixed(2));
};

const amountsMatch = (left: number, right: number) => Math.abs(left - right) < 0.01;

const buildSignature = (message: string, secretKey: string) =>
    crypto.createHmac('sha256', secretKey).update(message).digest('base64');

const buildSignedPayload = (payload: Record<string, string | number>, signedFields: string[]) =>
    signedFields.map((field) => `${field}=${payload[field]}`).join(',');

const getClientDonorName = async (
    client: PoolClient,
    userId?: string,
    explicitName?: string,
    isAnonymous?: boolean
) => {
    if (isAnonymous) return 'Anonymous';
    if (explicitName?.trim()) return explicitName.trim();
    if (!userId) return 'Guest';

    const userRes = await client.query<{ name: string | null }>(
        `SELECT name FROM users WHERE id = $1`,
        [userId]
    );

    return userRes.rows[0]?.name?.trim() || 'Guest';
};

const insertPaymentLog = async (params: {
    client?: PoolClient;
    paymentTransactionId?: string | null;
    donationId?: string | null;
    eventType: string;
    status: string;
    requestPayload?: unknown;
    responsePayload?: unknown;
    requestId?: string;
}) => {
    const db = params.client || pool;
    await db.query(
        `INSERT INTO payment_logs (
            payment_transaction_id,
            donation_id,
            event_type,
            status,
            request_payload,
            response_payload,
            request_id
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
            params.paymentTransactionId || null,
            params.donationId || null,
            params.eventType,
            params.status,
            params.requestPayload ? JSON.stringify(params.requestPayload) : null,
            params.responsePayload ? JSON.stringify(params.responsePayload) : null,
            params.requestId || null,
        ]
    );
};

const getExistingPaymentState = async (
    client: PoolClient,
    idempotencyKey?: string,
    userId?: string
): Promise<ExistingPaymentState | null> => {
    if (!idempotencyKey) return null;

    const result = await client.query<DonationRow & PaymentTransactionRow>(
        `SELECT
            d.id,
            d.amount,
            d.campaign_id,
            d.user_id,
            d.is_anonymous,
            d.donor_name,
            d.payment_gateway,
            d.payment_status,
            d.currency,
            pt.id AS "id",
            pt.donation_id,
            pt.gateway,
            pt.gateway_reference,
            pt.gateway_transaction_id,
            pt.gateway_redirect_url,
            pt.verification_status
         FROM donations d
         JOIN payment_transactions pt ON pt.donation_id = d.id
         WHERE d.idempotency_key = $1
           AND ($2::uuid IS NULL OR d.user_id = $2::uuid)
         ORDER BY d.created_at DESC
         LIMIT 1`,
        [idempotencyKey, userId || null]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        donation: {
            id: row.donation_id,
            amount: row.amount,
            campaign_id: row.campaign_id,
            user_id: row.user_id,
            is_anonymous: row.is_anonymous,
            donor_name: row.donor_name,
            payment_gateway: row.payment_gateway,
            payment_status: row.payment_status,
            currency: row.currency,
        },
        transaction: {
            id: row.id,
            donation_id: row.donation_id,
            gateway: row.gateway,
            gateway_reference: row.gateway_reference,
            gateway_transaction_id: row.gateway_transaction_id,
            gateway_redirect_url: row.gateway_redirect_url,
            verification_status: row.verification_status,
        },
    };
};

const mapGatewayFailureStatus = (status: string): DonationPaymentStatus => {
    if (status === 'PENDING' || status === 'Pending' || status === 'Initiated') {
        return 'PENDING';
    }
    return 'FAILED';
};

export const logPaymentError = (message: string, meta?: Record<string, unknown>) => {
    logger.error(message, meta);
};

const createPendingDonation = async (
    client: PoolClient,
    input: InitiatePaymentInput
) => {
    const amount = normalizeAmount(input.amount);

    const campaignRes = await client.query<{ id: string; status: string }>(
        `SELECT id, status
         FROM campaigns
         WHERE id = $1`,
        [input.campaignId]
    );

    if (campaignRes.rows.length === 0) {
        throw new Error('Campaign not found');
    }

    if (campaignRes.rows[0].status !== 'APPROVED') {
        throw new Error('Campaign is not open for donations');
    }

    const donorName = await getClientDonorName(
        client,
        input.userId,
        input.donorName || input.customerName,
        input.isAnonymous
    );

    // Use atomic insert with ON CONFLICT if idempotency key is present
    const donationRes = await client.query<{ id: string }>(
        `INSERT INTO donations (
            amount,
            campaign_id,
            user_id,
            is_anonymous,
            donor_name,
            payment_gateway,
            payment_status,
            currency,
            idempotency_key
        )
         VALUES ($1, $2, $3, $4, $5, $6, 'INITIATED', 'NPR', $7)
         ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
         RETURNING id`,
        [
            amount,
            input.campaignId,
            input.userId || null,
            input.isAnonymous || false,
            donorName,
            input.gateway,
            input.idempotencyKey || null,
        ]
    );

    // If no row returned, it means a conflict occurred (duplicate idempotency key)
    if (donationRes.rows.length === 0) {
        return null;
    }

    const donationId = donationRes.rows[0].id;

    const paymentTxRes = await client.query<{ id: string }>(
        `INSERT INTO payment_transactions (
            donation_id,
            gateway,
            amount,
            currency,
            verification_status,
            gateway_status
        )
         VALUES ($1, $2, $3, 'NPR', 'PENDING', 'INITIATED')
         RETURNING id`,
        [donationId, input.gateway, amount]
    );

    await insertPaymentLog({
        client,
        paymentTransactionId: paymentTxRes.rows[0].id,
        donationId,
        eventType: 'INITIATE_REQUEST',
        status: 'ACCEPTED',
        requestPayload: { ...input, amount }, // Use normalized amount in logs
        requestId: input.requestId,
    });

    return {
        donationId,
        paymentTransactionId: paymentTxRes.rows[0].id,
        amount,
        donorName,
    };
};

const buildEsewaInitiationPayload = (donationId: string, amount: number) => {
    const config = getEsewaConfig();
    const signedFields = ['total_amount', 'transaction_uuid', 'product_code'];
    const params: Record<string, string | number> = {
        amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid: donationId,
        product_code: config.merchantCode,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${FRONTEND_URL}/payment/success?gateway=ESEWA&donationId=${donationId}`,
        failure_url: `${FRONTEND_URL}/payment/failure?gateway=ESEWA&donationId=${donationId}`,
        signed_field_names: signedFields.join(','),
    };

    params.signature = buildSignature(
        buildSignedPayload(params, signedFields),
        config.secretKey
    );

    return {
        url: config.paymentUrl,
        params,
    };
};

const reuseExistingInitiation = async (
    existing: ExistingPaymentState
): Promise<PaymentInitiationResult | null> => {
    if (
        existing.donation.payment_gateway === 'KHALTI' &&
        existing.transaction.gateway_redirect_url &&
        existing.transaction.gateway_reference
    ) {
        return {
            donationId: existing.donation.id,
            paymentStatus: existing.donation.payment_status,
            gateway: 'KHALTI',
            payment_url: existing.transaction.gateway_redirect_url,
            pidx: existing.transaction.gateway_reference,
            reused: true,
        };
    }

    if (existing.donation.payment_gateway === 'ESEWA') {
        const payload = buildEsewaInitiationPayload(
            existing.donation.id,
            Number(existing.donation.amount)
        );
        return {
            donationId: existing.donation.id,
            paymentStatus: existing.donation.payment_status,
            gateway: 'ESEWA',
            url: payload.url,
            params: payload.params,
            reused: true,
        };
    }

    return null;
};

export const initiatePayment = async (
    input: InitiatePaymentInput
): Promise<PaymentInitiationResult> => {
    const amount = normalizeAmount(input.amount);
    const existing = await withTransaction((client) =>
        getExistingPaymentState(client, input.idempotencyKey, input.userId)
    );

    if (existing) {
        const reusable = await reuseExistingInitiation(existing);
        if (reusable) {
            return reusable;
        }
        throw new Error('A payment with the same idempotency key already exists');
    }

    const baseRecord = await withTransaction(async (client) => {
        const existingAfterLock = await getExistingPaymentState(client, input.idempotencyKey, input.userId);
        if (existingAfterLock) return { existing: existingAfterLock };

        const created = await createPendingDonation(client, {
            ...input,
            amount,
        });

        if (!created) {
            // This happens if another thread inserted just before us but after our check
            const fallback = await getExistingPaymentState(client, input.idempotencyKey, input.userId);
            if (!fallback) throw new Error('Collision during donation creation and failed to retrieve record');
            return { existing: fallback };
        }

        return { created };
    });

    if ('existing' in baseRecord) {
        const reusable = await reuseExistingInitiation(baseRecord.existing!);
        if (reusable) return reusable;
        throw new Error('Payment already exists and could not be reused');
    }

    const { donationId, paymentTransactionId, donorName } = baseRecord.created;

    if (input.gateway === 'ESEWA') {
        const payload = buildEsewaInitiationPayload(donationId, amount);

        await pool.query(
            `UPDATE payment_transactions
             SET gateway_redirect_url = $1
             WHERE id = $2`,
            [payload.url, paymentTransactionId]
        );

        await insertPaymentLog({
            paymentTransactionId: paymentTransactionId,
            donationId: donationId,
            eventType: 'INITIATE_RESPONSE',
            status: 'READY',
            responsePayload: payload,
            requestId: input.requestId,
        });

        return {
            donationId: donationId,
            paymentStatus: 'INITIATED',
            gateway: 'ESEWA',
            url: payload.url,
            params: payload.params,
        };
    }

    const khalti = getKhaltiConfig();
    const payload = {
        return_url: `${FRONTEND_URL}/payment/success?gateway=KHALTI&donationId=${donationId}`,
        website_url: FRONTEND_URL,
        amount: Math.round(amount * 100),
        purchase_order_id: donationId,
        purchase_order_name: input.customerName || 'Donation',
        customer_info: {
            name: donorName,
            email: 'donor@example.com',
            phone: '9800000000',
        },
    };

    try {
        const response = await axios.post<{
            pidx: string;
            payment_url: string;
            expires_at?: string;
        }>(khalti.initiateUrl, payload, {
            headers: {
                Authorization: `Key ${khalti.secretKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });

        await pool.query(
            `UPDATE payment_transactions
             SET gateway_reference = $1,
                  gateway_redirect_url = $2,
                  request_payload = $3,
                  response_payload = $4,
                  gateway_status = 'INITIATED',
                  updated_at = NOW()
             WHERE id = $5`,
            [
                response.data.pidx,
                response.data.payment_url,
                JSON.stringify(payload),
                JSON.stringify(response.data),
                paymentTransactionId,
            ]
        );

        await insertPaymentLog({
            paymentTransactionId: paymentTransactionId,
            donationId: donationId,
            eventType: 'INITIATE_RESPONSE',
            status: 'READY',
            requestPayload: payload,
            responsePayload: response.data,
            requestId: input.requestId,
        });

        return {
            donationId: donationId,
            paymentStatus: 'INITIATED',
            gateway: 'KHALTI',
            payment_url: response.data.payment_url,
            pidx: response.data.pidx,
            expiresAt: response.data.expires_at,
        };
    } catch (error: any) {
        await pool.query(
            `UPDATE donations
             SET payment_status = 'FAILED',
                  failure_reason = $2,
                  updated_at = NOW()
             WHERE id = $1`,
            [donationId, error.response?.data?.detail || error.message || 'Khalti initiation failed']
        );
        await pool.query(
            `UPDATE payment_transactions
             SET verification_status = 'FAILED',
                  gateway_status = 'INITIATION_FAILED',
                  response_payload = $2,
                  updated_at = NOW()
             WHERE id = $1`,
            [paymentTransactionId, JSON.stringify(error.response?.data || { message: error.message })]
        );

        await insertPaymentLog({
            paymentTransactionId: paymentTransactionId,
            donationId: donationId,
            eventType: 'INITIATE_RESPONSE',
            status: 'FAILED',
            requestPayload: payload,
            responsePayload: error.response?.data || { message: error.message },
            requestId: input.requestId,
        });

        throw new Error('Error initiating Khalti payment');
    }
};

const getPaymentStateByDonationId = async (client: PoolClient, donationId: string) => {
    const result = await client.query<
        DonationRow & {
            payment_transaction_id: string;
            gateway_reference: string | null;
            gateway_transaction_id_stored: string | null;
            verification_status: VerificationStatus;
        }
    >(
        `SELECT
            d.id,
            d.amount,
            d.campaign_id,
            d.user_id,
            d.is_anonymous,
            d.donor_name,
            d.payment_gateway,
            d.payment_status,
            d.currency,
            pt.id AS "payment_transaction_id",
            pt.gateway_reference,
            pt.gateway_transaction_id AS "gateway_transaction_id_stored",
            pt.verification_status
         FROM donations d
         JOIN payment_transactions pt ON pt.donation_id = d.id
         WHERE d.id = $1
         FOR UPDATE`,
        [donationId]
    );

    if (result.rows.length === 0) {
        throw new Error('Donation payment record not found');
    }

    return result.rows[0];
};

const updatePaymentState = async (
    client: PoolClient,
    params: {
        donationId: string;
        paymentTransactionId: string;
        paymentStatus: DonationPaymentStatus;
        verificationStatus: VerificationStatus;
        gatewayStatus: string;
        gatewayReference?: string | null;
        gatewayTransactionId?: string | null;
        responsePayload?: unknown;
        failureReason?: string | null;
        requestId?: string;
        eventType: string;
    }
) => {
    await client.query(
        `UPDATE donations
         SET payment_status = $2,
             gateway_transaction_id = COALESCE($3, gateway_transaction_id),
             failure_reason = $4,
             updated_at = NOW()
         WHERE id = $1`,
        [
            params.donationId,
            params.paymentStatus,
            params.gatewayTransactionId || null,
            params.failureReason || null,
        ]
    );

    await client.query(
        `UPDATE payment_transactions
         SET verification_status = $2,
             gateway_status = $3,
             gateway_reference = COALESCE($4, gateway_reference),
             gateway_transaction_id = COALESCE($5, gateway_transaction_id),
             response_payload = $6,
             last_verified_at = NOW(),
             verified_at = CASE WHEN $2 = 'VERIFIED' THEN COALESCE(verified_at, NOW()) ELSE verified_at END,
             updated_at = NOW()
         WHERE id = $1`,
        [
            params.paymentTransactionId,
            params.verificationStatus,
            params.gatewayStatus,
            params.gatewayReference || null,
            params.gatewayTransactionId || null,
            params.responsePayload ? JSON.stringify(params.responsePayload) : null,
        ]
    );

    await insertPaymentLog({
        client,
        paymentTransactionId: params.paymentTransactionId,
        donationId: params.donationId,
        eventType: params.eventType,
        status: params.gatewayStatus,
        responsePayload: params.responsePayload,
        requestId: params.requestId,
    });
};

const finalizeSuccessfulPayment = async (
    client: PoolClient,
    params: {
        donationId: string;
        paymentTransactionId: string;
        gateway: PaymentGateway;
        gatewayReference?: string | null;
        gatewayTransactionId: string;
        responsePayload: unknown;
        requestId?: string;
    }
) => {
    const paymentState = await getPaymentStateByDonationId(client, params.donationId);

    if (paymentState.payment_status === 'SUCCEEDED' || paymentState.verification_status === 'VERIFIED') {
        const existingCode = await createDonationCode(
            paymentState.id,
            paymentState.campaign_id,
            paymentState.donor_name || 'Anonymous',
            Number(paymentState.amount),
            params.gateway,
            client
        );
        return {
            donationId: paymentState.id,
            donationCode: existingCode,
            userId: paymentState.user_id,
        };
    }

    await updatePaymentState(client, {
        donationId: paymentState.id,
        paymentTransactionId: params.paymentTransactionId,
        paymentStatus: 'SUCCEEDED',
        verificationStatus: 'VERIFIED',
        gatewayStatus: 'COMPLETED',
        gatewayReference: params.gatewayReference,
        gatewayTransactionId: params.gatewayTransactionId,
        responsePayload: params.responsePayload,
        requestId: params.requestId,
        eventType: 'VERIFY_SUCCESS',
    });
    
    await recordAuditLog({
        client,
        userId: paymentState.user_id || undefined,
        action: 'DONATION_SUCCESS',
        entityType: 'DONATION',
        entityId: paymentState.id,
        details: { 
            campaignId: paymentState.campaign_id, 
            amount: paymentState.amount,
            gateway: params.gateway,
            reference: params.gatewayTransactionId
        }
    });



    const donationCode = await createDonationCode(
        paymentState.id,
        paymentState.campaign_id,
        paymentState.donor_name || 'Anonymous',
        Number(paymentState.amount),
        params.gateway,
        client
    );

    return {
        donationId: paymentState.id,
        donationCode,
        userId: paymentState.user_id,
    };
};

const verifyEsewaCallbackSignature = (payload: EsewaSuccessPayload) => {
    if (!payload.signature || !payload.signed_field_names) {
        return false;
    }

    const { secretKey } = getEsewaConfig();
    const signedFields = payload.signed_field_names.split(',');
    const rawPayload = payload as unknown as Record<string, string | number>;
    const generated = buildSignature(buildSignedPayload(rawPayload, signedFields), secretKey);
    return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(payload.signature));
};

export const verifyEsewaPayment = async (encodedData: string, requestId?: string) => {
    let decoded: EsewaSuccessPayload;
    try {
        decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
        if (!decoded || typeof decoded !== 'object') {
            throw new Error('Invalid payload structure');
        }
    } catch (error) {
        throw new Error('Malformed eSewa callback data');
    }

    if (!verifyEsewaCallbackSignature(decoded)) {
        throw new Error('Invalid eSewa callback signature');
    }

    return verifyEsewaByUuid(decoded.transaction_uuid, Number(decoded.total_amount), {
        callback: decoded,
        transactionCode: decoded.transaction_code,
    }, requestId);
};

export const verifyEsewaByUuid = async (
    uuid: string, 
    amount: number, 
    meta?: { callback?: any, transactionCode?: string }, 
    requestId?: string
) => {
    const normalizedAmount = normalizeAmount(amount);
    const config = getEsewaConfig();
    
    const statusCheck = await axios.get<{
        status: string;
        ref_id?: string;
        total_amount?: number | string;
    }>(config.statusCheckUrl, {
        params: {
            product_code: config.merchantCode,
            total_amount: normalizedAmount,
            transaction_uuid: uuid,
        },
        timeout: 15000,
    });

    const remoteStatus = statusCheck.data.status || meta?.callback?.status;
    if (remoteStatus !== 'COMPLETE') {
        const pendingStatus = mapGatewayFailureStatus(remoteStatus);

        await withTransaction(async (client) => {
            const paymentState = await getPaymentStateByDonationId(client, uuid);
            await updatePaymentState(client, {
                donationId: paymentState.id,
                paymentTransactionId: paymentState.payment_transaction_id,
                paymentStatus: pendingStatus,
                verificationStatus: pendingStatus === 'FAILED' ? 'FAILED' : 'PENDING',
                gatewayStatus: remoteStatus,
                gatewayReference: uuid,
                gatewayTransactionId: statusCheck.data.ref_id || meta?.transactionCode || null,
                responsePayload: { callback: meta?.callback, lookup: statusCheck.data },
                failureReason: remoteStatus,
                requestId,
                eventType: 'VERIFY_NON_SUCCESS',
            });
        });

        return {
            status: pendingStatus === 'PENDING' ? 'pending' : 'failed',
            message:
                pendingStatus === 'PENDING'
                    ? 'Payment is still pending at eSewa.'
                    : 'Payment was not completed at eSewa.',
            paymentStatus: pendingStatus,
        } satisfies PaymentVerificationResult;
    }

    const finalization = await withTransaction(async (client) => {
        const paymentState = await getPaymentStateByDonationId(client, uuid);
        const expectedAmount = normalizeAmount(Number(paymentState.amount));

        if (!amountsMatch(expectedAmount, normalizedAmount)) {
            await updatePaymentState(client, {
                donationId: paymentState.id,
                paymentTransactionId: paymentState.payment_transaction_id,
                paymentStatus: 'MISMATCHED',
                verificationStatus: 'MISMATCHED',
                gatewayStatus: 'AMOUNT_MISMATCH',
                gatewayReference: uuid,
                gatewayTransactionId: statusCheck.data.ref_id || meta?.transactionCode || null,
                responsePayload: { callback: meta?.callback, lookup: statusCheck.data },
                failureReason: 'Amount mismatch during eSewa verification',
                requestId,
                eventType: 'VERIFY_MISMATCH',
            });
            throw new Error('Amount mismatch during eSewa verification');
        }

        return finalizeSuccessfulPayment(client, {
            donationId: paymentState.id,
            paymentTransactionId: paymentState.payment_transaction_id,
            gateway: 'ESEWA',
            gatewayReference: uuid,
            gatewayTransactionId: statusCheck.data.ref_id || meta?.transactionCode || uuid,
            responsePayload: { callback: meta?.callback, lookup: statusCheck.data },
            requestId,
        });
    });

    const newBadges = finalization.userId
        ? await evaluateAndGrantBadges(finalization.userId)
        : [];

    return {
        status: 'success',
        message: 'Payment verification successful',
        donationId: finalization.donationId,
        donationCode: finalization.donationCode,
        newBadges,
        paymentStatus: 'SUCCEEDED',
    } satisfies PaymentVerificationResult;
};

export const verifyKhaltiPayment = async (pidx: string, requestId?: string) => {
    const khalti = getKhaltiConfig();
    const lookup = await axios.post<KhaltiLookupResponse>(
        khalti.lookupUrl,
        { pidx },
        {
            headers: {
                Authorization: `Key ${khalti.secretKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        }
    );

    const lookupData = lookup.data;
    const paymentState = await withTransaction(async (client) => {
        const res = await client.query<
            DonationRow & {
                payment_transaction_id: string;
                gateway_reference: string | null;
                verification_status: VerificationStatus;
            }
        >(
            `SELECT
                d.id,
                d.amount,
                d.campaign_id,
                d.user_id,
                d.is_anonymous,
                d.donor_name,
                d.payment_gateway,
                d.payment_status,
                d.currency,
                pt.id AS "payment_transaction_id",
                pt.gateway_reference,
                pt.verification_status
             FROM donations d
             JOIN payment_transactions pt ON pt.donation_id = d.id
             WHERE pt.gateway = 'KHALTI'
               AND pt.gateway_reference = $1
             FOR UPDATE`,
            [pidx]
        );

        if (res.rows.length === 0) {
            throw new Error('Khalti payment attempt not found');
        }

        return res.rows[0];
    });

    const expectedAmount = Math.round(normalizeAmount(Number(paymentState.amount)) * 100);
    if (lookupData.total_amount !== expectedAmount) {
        await withTransaction(async (client) => {
            await updatePaymentState(client, {
                donationId: paymentState.id,
                paymentTransactionId: paymentState.payment_transaction_id,
                paymentStatus: 'MISMATCHED',
                verificationStatus: 'MISMATCHED',
                gatewayStatus: 'AMOUNT_MISMATCH',
                gatewayReference: pidx,
                gatewayTransactionId: lookupData.transaction_id,
                responsePayload: lookupData,
                failureReason: 'Amount mismatch during Khalti verification',
                requestId,
                eventType: 'VERIFY_MISMATCH',
            });
        });

        throw new Error('Amount mismatch during Khalti verification');
    }

    if (lookupData.status !== 'Completed') {
        const paymentStatus = mapGatewayFailureStatus(lookupData.status);

        await withTransaction(async (client) => {
            await updatePaymentState(client, {
                donationId: paymentState.id,
                paymentTransactionId: paymentState.payment_transaction_id,
                paymentStatus,
                verificationStatus: paymentStatus === 'FAILED' ? 'FAILED' : 'PENDING',
                gatewayStatus: lookupData.status,
                gatewayReference: pidx,
                gatewayTransactionId: lookupData.transaction_id,
                responsePayload: lookupData,
                failureReason: lookupData.status,
                requestId,
                eventType: 'VERIFY_NON_SUCCESS',
            });
        });

        return {
            status: paymentStatus === 'PENDING' ? 'pending' : 'failed',
            message:
                paymentStatus === 'PENDING'
                    ? 'Payment is still pending at Khalti.'
                    : 'Payment was not completed at Khalti.',
            paymentStatus,
        } satisfies PaymentVerificationResult;
    }

    const finalization = await withTransaction(async (client) => {
        return finalizeSuccessfulPayment(client, {
            donationId: paymentState.id,
            paymentTransactionId: paymentState.payment_transaction_id,
            gateway: 'KHALTI',
            gatewayReference: pidx,
            gatewayTransactionId: lookupData.transaction_id || pidx,
            responsePayload: lookupData,
            requestId,
        });
    });

    const newBadges = finalization.userId
        ? await evaluateAndGrantBadges(finalization.userId)
        : [];

    return {
        status: 'success',
        message: 'Payment verified successfully',
        donationId: finalization.donationId,
        donationCode: finalization.donationCode,
        newBadges,
        paymentStatus: 'SUCCEEDED',
    } satisfies PaymentVerificationResult;
};

export const persistWebhookEvent = async (params: {
    gateway: PaymentGateway;
    payload: unknown;
    headers: Record<string, unknown>;
}) => {
    const payloadString = JSON.stringify(params.payload);
    const dedupeKey = crypto
        .createHash('sha256')
        .update(`${params.gateway}:${payloadString}`)
        .digest('hex');

    const result = await pool.query<{ id: string }>(
        `INSERT INTO webhook_events (
            gateway,
            dedupe_key,
            payload,
            headers,
            verification_status,
            processing_status
        )
         VALUES ($1, $2, $3, $4, 'RECEIVED', 'RECEIVED')
         ON CONFLICT (dedupe_key) DO NOTHING
         RETURNING id`,
        [
            params.gateway,
            dedupeKey,
            payloadString,
            JSON.stringify(params.headers),
        ]
    );

    return {
        eventId: result.rows[0]?.id || null,
        dedupeKey,
        inserted: result.rows.length > 0,
    };
};

export const verifyWebhookSecret = (providedSecret?: string | string[]) => {
    if (!WEBHOOK_SHARED_SECRET) return true;
    if (!providedSecret || Array.isArray(providedSecret)) return false;
    if (providedSecret.length !== WEBHOOK_SHARED_SECRET.length) return false;
    return crypto.timingSafeEqual(
        Buffer.from(providedSecret),
        Buffer.from(WEBHOOK_SHARED_SECRET)
    );
};

export const updateWebhookEventStatus = async (params: {
    dedupeKey: string;
    processingStatus: string;
    verificationStatus: string;
    errorMessage?: string;
}) => {
    await pool.query(
        `UPDATE webhook_events
         SET processing_status = $2,
             verification_status = $3,
             error_message = $4,
             processed_at = NOW()
         WHERE dedupe_key = $1`,
        [
            params.dedupeKey,
            params.processingStatus,
            params.verificationStatus,
            params.errorMessage || null,
        ]
    );
};
