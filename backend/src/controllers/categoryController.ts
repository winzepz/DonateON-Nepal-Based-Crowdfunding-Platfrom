import { Request, Response } from 'express';
import pool from '../db';
import { logger } from '../utils/logger';

export const getAllCategoryPools = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, slug, name, description, image_url, total_amount, accent_color, icon_name, impact_label, created_at
            FROM category_pools
            ORDER BY name ASC
        `);
        res.json(result.rows);
    } catch (error) {
        logger.error('categories.getAll.failed', { error });
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

export const getCategoryPoolBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(`
            SELECT id, slug, name, description, image_url, total_amount, accent_color, icon_name, impact_label, created_at
            FROM category_pools
            WHERE slug = $1
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        logger.error('categories.getBySlug.failed', { error, slug: req.params.slug });
        res.status(500).json({ message: 'Error fetching category' });
    }
};
