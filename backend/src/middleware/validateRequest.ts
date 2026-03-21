import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const shape = 'shape' in schema ? (schema as any).shape : {};
            const expectsWrappedPayload =
                Object.prototype.hasOwnProperty.call(shape, 'body') ||
                Object.prototype.hasOwnProperty.call(shape, 'query') ||
                Object.prototype.hasOwnProperty.call(shape, 'params');

            await schema.parseAsync(
                expectsWrappedPayload
                    ? {
                        body: req.body,
                        query: req.query,
                        params: req.params,
                    }
                    : req.body
            );
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                console.error('Validation Error Details:', {
                    path: req.path,
                    body: req.body,
                    issues: error.issues
                });

                return res.status(400).json({
                    message: 'Validation failed',
                    errors: error.issues.map((e: any) => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }

            console.error('Unexpected Error in validateRequest:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};
