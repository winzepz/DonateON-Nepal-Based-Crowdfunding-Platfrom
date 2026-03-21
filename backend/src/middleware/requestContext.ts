import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export const attachRequestContext = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header('x-request-id') || crypto.randomUUID();
    const startedAt = Date.now();

    res.locals.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    logger.info('request.started', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
    });

    res.on('finish', () => {
        logger.info('request.completed', {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });

    next();
};
