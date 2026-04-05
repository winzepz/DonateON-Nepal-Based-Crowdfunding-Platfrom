import { Router } from 'express';
import { z } from 'zod';
import {
    initiateEsewa,
    initiateKhalti,
    verifyEsewa,
    verifyKhalti,
    webhookEsewa,
    webhookKhalti,
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

const basePaymentSchema = z.object({
    amount: z.coerce.number().positive(),
    productId: z.string().uuid().nullable().optional(),
    categoryPoolId: z.string().uuid().nullable().optional(),
    isAnonymous: z.boolean().optional(),
    donorName: z.string().trim().min(1).max(120).optional(),
    idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

const paymentInitiationSchema = basePaymentSchema.refine(data => data.productId || data.categoryPoolId, {
    message: "Either productId or categoryPoolId must be provided",
    path: ["productId"]
});

const khaltiInitiationSchema = basePaymentSchema.extend({
    name: z.string().trim().min(1).max(120).optional(),
}).refine(data => data.productId || data.categoryPoolId, {
    message: "Either productId or categoryPoolId must be provided",
    path: ["productId"]
});

const khaltiVerificationSchema = z.object({
    pidx: z.string().trim().min(3),
});

router.post('/esewa', authenticateToken, validateRequest(paymentInitiationSchema), initiateEsewa);
router.get('/verify/esewa', verifyEsewa);
router.post('/khalti', authenticateToken, validateRequest(khaltiInitiationSchema), initiateKhalti);
router.post('/verify/khalti', validateRequest(khaltiVerificationSchema), verifyKhalti);
router.post('/webhook/esewa', webhookEsewa);
router.post('/webhook/khalti', webhookKhalti);

export default router;
