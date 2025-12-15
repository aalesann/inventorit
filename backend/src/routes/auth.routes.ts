import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { registerValidation, loginValidation, validateRequest } from '../middlewares/validators.middleware';

const router = Router();

// POST /api/auth/login - User login
router.post('/login', loginValidation, validateRequest, authController.login);

// POST /api/auth/register - Register new user (admin only)
router.post('/register', verifyToken, isAdmin, registerValidation, validateRequest, authController.register);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refresh);

// POST /api/auth/logout - Logout and revoke refresh token
router.post('/logout', authController.logout);

// GET /api/auth/me - Get current user info
router.get('/me', verifyToken, authController.me);

export default router;
