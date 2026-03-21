import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

dotenv.config();

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err || typeof decoded !== 'object' || !decoded) return res.sendStatus(403);

        const { id, role } = decoded as { id?: string; role?: string };
        if (!id || !role) return res.sendStatus(403);

        req.user = { id, role };
        next();
    });
};

export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return res.sendStatus(403);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }

        next();
    };
};
