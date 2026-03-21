import express from 'express';
import { 
    createCampaign, 
    getAllCampaigns, 
    getCampaignById, 
    getMyCampaigns, 
    getSupportedCampaigns,
    updateCampaign,
    deleteCampaign
} from '../controllers/campaignController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const campaignSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    description: z.string().min(50, "Story must be at least 50 characters to build trust"),
    targetAmount: z.union([z.string(), z.number()]).refine(val => !isNaN(Number(val)), "Target amount must be a number"),
    deadline: z.string().optional(),
});

const router = express.Router();

// Public routes
router.get('/', getAllCampaigns);

// Protected routes (Specific paths first)
router.get('/my/created', authenticateToken, getMyCampaigns);
router.get('/my-campaigns', authenticateToken, getMyCampaigns); // Backward-compatible alias
router.get('/my/supported', authenticateToken, getSupportedCampaigns);
router.post('/', authenticateToken, authorizeRole(['CAMPAIGN_CREATOR']), upload.single('image'), validateRequest(campaignSchema), createCampaign);
router.put('/:id', authenticateToken, authorizeRole(['CAMPAIGN_CREATOR', 'ADMIN']), upload.single('image'), validateRequest(campaignSchema), updateCampaign);
router.delete('/:id', authenticateToken, authorizeRole(['CAMPAIGN_CREATOR', 'ADMIN']), deleteCampaign);

// Dynamic routes
router.get('/:id', getCampaignById);

export default router;
