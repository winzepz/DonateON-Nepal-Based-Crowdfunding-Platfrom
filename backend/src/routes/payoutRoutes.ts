import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';
import { requestPayout, getMyPayouts, getAllPayouts, approvePayout, rejectPayout, getPayoutDetails } from '../controllers/payoutController';

const router = express.Router();

const payoutRequestSchema = z.object({
    campaignId: z.string().uuid(),
    amount: z.number().positive(),
    bankName: z.string().min(2),
    accountNumber: z.string().min(5),
    accountHolderName: z.string().min(3),
    remarks: z.string().optional(),
});

// Campaign Creator routes
router.post('/request', authenticateToken, authorizeRole(['CAMPAIGN_CREATOR']), validateRequest(payoutRequestSchema), requestPayout);
router.get('/my', authenticateToken, authorizeRole(['CAMPAIGN_CREATOR']), getMyPayouts);

// Admin routes
router.get('/all', authenticateToken, authorizeRole(['ADMIN']), getAllPayouts);
router.get('/:id', authenticateToken, authorizeRole(['ADMIN']), getPayoutDetails);
router.post('/:id/approve', authenticateToken, authorizeRole(['ADMIN']), approvePayout);
router.post('/:id/reject', authenticateToken, authorizeRole(['ADMIN']), rejectPayout);

export default router;
