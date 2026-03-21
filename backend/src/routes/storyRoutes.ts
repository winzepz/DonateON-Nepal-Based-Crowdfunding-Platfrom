import { Router } from 'express';
import { createStory, getAllStories, getStoryById } from '../controllers/storyController';
import { authenticateToken } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Public routes
router.get('/', getAllStories);
router.get('/:id', getStoryById);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), createStory);

export default router;
