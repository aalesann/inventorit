import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

type ValidationSource = 'body' | 'params' | 'query';

export const validate = (schema: z.ZodSchema, source: ValidationSource = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const data = req[source];
            schema.parse(data);
            next();
        } catch (error: any) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err: any) => ({
                    campo: err.path.join('.'),
                    mensaje: err.message
                }));

                res.status(400).json({
                    error: 'Error de validación',
                    detalles: errors
                });
                return;
            }
            next(error);
        }
    };
};
