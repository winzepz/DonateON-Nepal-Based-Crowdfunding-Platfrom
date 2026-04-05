import express from 'express';
import { getAllCategoryPools, getCategoryPoolBySlug } from '../controllers/categoryController';

const router = express.Router();

router.get('/', getAllCategoryPools);
router.get('/:slug', getCategoryPoolBySlug);

export default router;
