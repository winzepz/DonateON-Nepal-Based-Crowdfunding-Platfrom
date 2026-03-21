import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';
import { submitKYC, getKYCStatus } from '../controllers/kycController';

const router = express.Router();

router.post('/submit', authenticateToken, upload.single('image'), submitKYC);
router.get('/status', authenticateToken, getKYCStatus);

export default router;
