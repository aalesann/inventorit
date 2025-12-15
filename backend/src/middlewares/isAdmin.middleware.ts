import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
        return;
    }
    res.status(403).json({ error: 'Se requiere rol de administrador' });
};
