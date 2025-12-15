import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import logger from '../utils/logger';

class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, password } = req.body;

            const tokens = await authService.login(username, password);

            // Set httpOnly cookies for tokens
            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
                path: '/'
            });

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });

            logger.info(`User logged in: ${username}`);

            // Don't send tokens in response body for security
            res.status(200).json({
                message: 'Login exitoso',
                user: {
                    user_id: req.user?.user_id,
                    username: req.user?.username,
                    role: req.user?.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, password, email, role } = req.body;

            const user = await authService.register(
                { username, password, email, role }
            );

            logger.info(`New user registered: ${username} by ${req.user!.username}`);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                res.status(400).json({ error: 'Token requerido' });
                return;
            }

            const tokens = await authService.refreshAccessToken(refreshToken);

            // Set new httpOnly cookies
            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
                path: '/'
            });

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.status(200).json({ message: 'Token refrescado' });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            // Clear httpOnly cookies
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });

            res.status(200).json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    // New endpoint to get current user info
    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // User info is already attached by verifyToken middleware
            if (!req.user) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            res.status(200).json(req.user);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
