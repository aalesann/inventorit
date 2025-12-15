import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/categories - Get all categories
router.get('/', categoryController.getAllCategories);

// POST /api/categories - Create new category (admin only)
router.post('/', isAdmin, categoryController.createCategory);

export default router;
