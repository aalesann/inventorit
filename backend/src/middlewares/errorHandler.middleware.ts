import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import logger from '../utils/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log error
    logger.error('Error occurred: %o', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Handle AppError (custom errors with status codes)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message
        });
        return;
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
            error: 'Error de validación',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Token inválido'
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: 'Token expirado'
        });
        return;
    }

    // Default error response
    const errorResponse: any = {
        error: 'Error interno del servidor'
    };

    // Only include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.details = err.message;
        errorResponse.stack = err.stack;
    }

    res.status(500).json(errorResponse);
};
