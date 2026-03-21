import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    verifyDonationCode,
    trackDonation,
    getMyDonations,
    getMyBadges,
    getAllBadgeDefinitions,
} from '../controllers/donationController';

const router = express.Router();

// Public routes
router.get('/verify', verifyDonationCode);                // GET /api/donations/verify?code=DN-...
router.get('/track/:code', trackDonation);               // GET /api/donations/track/:code (legacy)
router.get('/badges', getAllBadgeDefinitions);            // GET /api/donations/badges (public list)

// Authenticated routes
router.get('/me', authenticateToken, getMyDonations);         // GET /api/donations/me
router.get('/me/badges', authenticateToken, getMyBadges);     // GET /api/donations/me/badges

export default router;
