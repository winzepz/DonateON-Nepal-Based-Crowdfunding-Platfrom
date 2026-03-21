import express from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken); // All endpoints require login

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
