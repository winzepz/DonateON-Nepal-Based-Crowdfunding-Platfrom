import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
    initiatePayment,
    logPaymentError,
    persistWebhookEvent,
    updateWebhookEventStatus,
    verifyEsewaPayment,
    verifyKhaltiPayment,
    verifyWebhookSecret,
} from '../services/paymentService';
import { logger } from '../utils/logger';

const getIdempotencyKey = (req: Request) => {
    const headerKey = req.header('x-idempotency-key');
    if (typeof headerKey === 'string' && headerKey.trim()) {
        return headerKey.trim();
    }

    const bodyKey = req.body?.idempotencyKey;
    return typeof bodyKey === 'string' && bodyKey.trim() ? bodyKey.trim() : undefined;
};

const handleInitiationError = (error: unknown, res: Response, action: string) => {
    logPaymentError(action, {
        error: error instanceof Error ? error.message : String(error),
    });

    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    const statusCode =
        message.includes('Campaign') || message.includes('amount') || message.includes('idempotency')
            ? 400
            : 500;

    res.status(statusCode).json({ message });
};

export const initiateEsewa = async (req: AuthRequest, res: Response) => {
    const requestId = res.locals.requestId;
    try {
        const { amount, productId, isAnonymous, donorName } = req.body;
        logger.info('payment.esewa.initiate_start', { 
            userId: req.user?.id, 
            amount, 
            productId,
            requestId 
        });

        const result = await initiatePayment({
            gateway: 'ESEWA',
            amount: Number(amount),
            campaignId: productId,
            userId: req.user?.id,
            isAnonymous,
            donorName,
            idempotencyKey: getIdempotencyKey(req),
            requestId: requestId,
            ipAddress: req.ip,
        });

        logger.info('payment.esewa.initiate_success', { 
            donationId: result.donationId,
            requestId 
        });
        res.json(result);
    } catch (error) {
        handleInitiationError(error, res, 'esewa.initiate.failed');
    }
};

export const initiateKhalti = async (req: AuthRequest, res: Response) => {
    const requestId = res.locals.requestId;
    try {
        const { amount, productId, name, isAnonymous, donorName } = req.body;
        logger.info('payment.khalti.initiate_start', { 
            userId: req.user?.id, 
            amount, 
            productId,
            requestId 
        });

        const result = await initiatePayment({
            gateway: 'KHALTI',
            amount: Number(amount),
            campaignId: productId,
            userId: req.user?.id,
            isAnonymous,
            donorName,
            customerName: name,
            idempotencyKey: getIdempotencyKey(req),
            requestId: requestId,
            ipAddress: req.ip,
        });

        logger.info('payment.khalti.initiate_success', { 
            donationId: result.donationId,
            requestId 
        });
        res.json(result);
    } catch (error) {
        handleInitiationError(error, res, 'khalti.initiate.failed');
    }
};

export const verifyEsewa = async (req: Request, res: Response) => {
    try {
        const data = typeof req.query.data === 'string' ? req.query.data : '';
        if (!data) {
            return res.status(400).json({ message: 'Missing data' });
        }

        const result = await verifyEsewaPayment(data, res.locals.requestId);
        const statusCode =
            result.status === 'success' ? 200 : result.status === 'pending' ? 202 : 400;

        res.status(statusCode).json(result);
    } catch (error: any) {
        logPaymentError('esewa.verify.failed', {
            error: error?.message || String(error),
        });
        res.status(500).json({ message: error?.message || 'Error verifying eSewa payment' });
    }
};

export const verifyKhalti = async (req: Request, res: Response) => {
    try {
        const pidx = typeof req.body?.pidx === 'string'
            ? req.body.pidx
            : typeof req.query.pidx === 'string'
                ? req.query.pidx
                : '';

        if (!pidx) {
            return res.status(400).json({ message: 'pidx is required' });
        }

        const result = await verifyKhaltiPayment(pidx, res.locals.requestId);
        const statusCode =
            result.status === 'success' ? 200 : result.status === 'pending' ? 202 : 400;

        res.status(statusCode).json(result);
    } catch (error: any) {
        logPaymentError('khalti.verify.failed', {
            error: error?.message || String(error),
        });
        res.status(500).json({ message: error?.message || 'Error verifying Khalti payment' });
    }
};

export const webhookEsewa = async (req: Request, res: Response) => {
    const webhook = await persistWebhookEvent({
        gateway: 'ESEWA',
        payload: req.body,
        headers: req.headers as Record<string, unknown>,
    });

    try {
        if (!verifyWebhookSecret(req.header('x-webhook-secret') || undefined)) {
            await updateWebhookEventStatus({
                dedupeKey: webhook.dedupeKey,
                processingStatus: 'REJECTED',
                verificationStatus: 'FAILED',
                errorMessage: 'Invalid webhook secret',
            });
            return res.status(401).json({ message: 'Invalid webhook secret' });
        }

        if (!webhook.inserted) {
            return res.status(200).json({ message: 'Duplicate webhook ignored' });
        }

        const data =
            typeof req.body?.data === 'string'
                ? req.body.data
                : typeof req.query.data === 'string'
                    ? req.query.data
                    : '';

        if (!data) {
            await updateWebhookEventStatus({
                dedupeKey: webhook.dedupeKey,
                processingStatus: 'SKIPPED',
                verificationStatus: 'RECEIVED',
                errorMessage: 'No eSewa callback payload found',
            });
            return res.status(202).json({ message: 'Webhook stored without actionable payment data' });
        }

        const result = await verifyEsewaPayment(data, res.locals.requestId);
        await updateWebhookEventStatus({
            dedupeKey: webhook.dedupeKey,
            processingStatus: 'PROCESSED',
            verificationStatus: result.status === 'success' ? 'VERIFIED' : 'RECEIVED',
        });

        res.status(200).json(result);
    } catch (error: any) {
        await updateWebhookEventStatus({
            dedupeKey: webhook.dedupeKey,
            processingStatus: 'FAILED',
            verificationStatus: 'FAILED',
            errorMessage: error?.message || 'Webhook processing failed',
        });
        logPaymentError('esewa.webhook.failed', {
            error: error?.message || String(error),
        });
        res.status(500).json({ message: error?.message || 'Webhook processing failed' });
    }
};

export const webhookKhalti = async (req: Request, res: Response) => {
    const webhook = await persistWebhookEvent({
        gateway: 'KHALTI',
        payload: req.body,
        headers: req.headers as Record<string, unknown>,
    });

    try {
        if (!verifyWebhookSecret(req.header('x-webhook-secret') || undefined)) {
            await updateWebhookEventStatus({
                dedupeKey: webhook.dedupeKey,
                processingStatus: 'REJECTED',
                verificationStatus: 'FAILED',
                errorMessage: 'Invalid webhook secret',
            });
            return res.status(401).json({ message: 'Invalid webhook secret' });
        }

        if (!webhook.inserted) {
            return res.status(200).json({ message: 'Duplicate webhook ignored' });
        }

        const pidx = typeof req.body?.pidx === 'string' ? req.body.pidx : '';
        if (!pidx) {
            await updateWebhookEventStatus({
                dedupeKey: webhook.dedupeKey,
                processingStatus: 'SKIPPED',
                verificationStatus: 'RECEIVED',
                errorMessage: 'No Khalti pidx found',
            });
            return res.status(202).json({ message: 'Webhook stored without actionable payment data' });
        }

        const result = await verifyKhaltiPayment(pidx, res.locals.requestId);
        await updateWebhookEventStatus({
            dedupeKey: webhook.dedupeKey,
            processingStatus: 'PROCESSED',
            verificationStatus: result.status === 'success' ? 'VERIFIED' : 'RECEIVED',
        });

        res.status(200).json(result);
    } catch (error: any) {
        await updateWebhookEventStatus({
            dedupeKey: webhook.dedupeKey,
            processingStatus: 'FAILED',
            verificationStatus: 'FAILED',
            errorMessage: error?.message || 'Webhook processing failed',
        });
        logPaymentError('khalti.webhook.failed', {
            error: error?.message || String(error),
        });
        res.status(500).json({ message: error?.message || 'Webhook processing failed' });
    }
};
