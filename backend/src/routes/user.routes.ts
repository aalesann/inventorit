import { Router } from 'express';
import userController from '../controllers/user.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { userUpdateValidation, validateRequest } from '../middlewares/validators.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user (admin only)
router.post('/', isAdmin, userController.createUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', isAdmin, userUpdateValidation, validateRequest, userController.updateUser);

// PATCH /api/users/:id/toggle-active - Toggle user active status (admin only)
router.patch('/:id/toggle-active', isAdmin, userController.toggleUserActive);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

export default router;
