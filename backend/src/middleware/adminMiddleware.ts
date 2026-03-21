import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    next();
};
