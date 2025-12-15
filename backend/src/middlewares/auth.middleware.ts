import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AccessTokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    // Read token from httpOnly cookie instead of Authorization header
    const token = req.cookies.accessToken;

    if (!token) {
        res.status(403).json({ error: 'Se requiere autenticación' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;

        // Verify it's an access token
        if (decoded.type !== 'access') {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        // Attach user info to request
        req.user = {
            user_id: decoded.user_id,
            username: decoded.username,
            role: decoded.role
        };

        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expirado. Por favor, refresca tu sesión.' });
            return;
        }
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
        return;
    }
    res.status(403).json({ error: 'Se requiere rol de administrador' });
};
