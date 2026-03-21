import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const requestId = res.locals.requestId;
    
    // Handle validation errors from Zod
    if (err instanceof ZodError) {
        logger.warn('validation.failed', { requestId, errors: err.errors });
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.flatten().fieldErrors,
            requestId
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (statusCode >= 500) {
        logger.error('server.error', { requestId, error: message, stack: err.stack });
    } else {
        logger.warn('client.error', { requestId, statusCode, error: message });
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        requestId,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
