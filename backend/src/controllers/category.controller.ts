import { Request, Response, NextFunction } from 'express';
import inventoryService from '../services/inventory.service';
import logger from '../utils/logger';

class CategoryController {
    async getAllCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const categories = await inventoryService.getCategories();
            res.status(200).json(categories);
        } catch (error) {
            next(error);
        }
    }

    async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nombre, descripcion } = req.body;

            const category = await inventoryService.createCategory({ nombre, descripcion });

            logger.info(`Category created: ${nombre} by ${req.user!.username}`);
            res.status(201).json(category);
        } catch (error) {
            next(error);
        }
    }
}

export default new CategoryController();
