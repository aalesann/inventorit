import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import logger from '../utils/logger';

class UserController {
    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role, is_active } = req.query;

            const filters: any = {};
            if (role) filters.role = role as 'admin' | 'user';
            if (is_active !== undefined) filters.is_active = is_active === 'true';

            const users = await userService.getAllUsers(filters);

            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            const user = await userService.getUserById(id);

            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, password, email, role } = req.body;

            const user = await userService.createUser(
                { username, password, email, role }
            );

            logger.info(`User created: ${username} by ${req.user!.username}`);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { username, email, password, role } = req.body;

            const user = await userService.updateUser(
                id,
                { username, email, password, role }
            );

            logger.info(`User updated: ${user.username} by ${req.user!.username}`);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async toggleUserActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            // Validate ID
            if (isNaN(id)) {
                res.status(400).json({ error: 'ID de usuario inválido' });
                return;
            }

            // Validate and parse is_active
            const { is_active } = req.body;

            if (is_active === undefined || is_active === null) {
                res.status(400).json({ error: 'El campo is_active es requerido' });
                return;
            }

            // Convert to boolean if it's a string
            const isActiveBoolean = typeof is_active === 'string'
                ? is_active === 'true'
                : Boolean(is_active);

            const user = await userService.toggleUserActive(id, isActiveBoolean);

            logger.info(`User ${isActiveBoolean ? 'activated' : 'deactivated'}: ${user.username} by ${req.user!.username}`);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            // Prevent deleting yourself
            if (req.user!.user_id === id) {
                res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
                return;
            }

            await userService.deleteUser(id);

            logger.info(`User deleted: ID ${id} by ${req.user!.username}`);
            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
