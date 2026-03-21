import { Router } from 'express';
import { getGlobalStats, getUserStats, getAdminSummary } from '../controllers/statsController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/global', getGlobalStats);
router.get('/user', authenticateToken, getUserStats);
router.get('/admin', authenticateToken, authorizeRole(['ADMIN']), getAdminSummary);

export default router;
