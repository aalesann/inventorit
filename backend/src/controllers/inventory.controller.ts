import { Request, Response, NextFunction } from 'express';
import inventoryService from '../services/inventory.service';
import { AssetFilters } from '../repositories/asset.repository';
import logger from '../utils/logger';

class InventoryController {
    async getAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                page = '1',
                limit = '10',
                category_id,
                estado,
                area,
                usuario_asignado,
                search
            } = req.query;

            const filters: AssetFilters = {};
            if (category_id) filters.category_id = parseInt(category_id as string);
            if (estado) filters.estado = estado as any;
            if (area) filters.area = area as string;
            if (usuario_asignado) filters.usuario_asignado = usuario_asignado as string;
            if (search) filters.search = search as string;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const offset = (pageNum - 1) * limitNum;

            const result = await inventoryService.getAssets(filters, {
                page: pageNum,
                limit: limitNum,
                offset
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAssetById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            const asset = await inventoryService.getAssetById(id);

            if (!asset) {
                res.status(404).json({ error: 'Equipo no encontrado' });
                return;
            }

            res.status(200).json(asset);
        } catch (error) {
            next(error);
        }
    }

    async createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                category_id,
                marca,
                modelo,
                numero_serie,
                codigo_inventario,
                area,
                estado,
                usuario_asignado,
                observaciones,
                specs
            } = req.body;

            const createdBy = req.user!.user_id;

            const asset = await inventoryService.createAsset(
                {
                    category_id,
                    marca,
                    modelo,
                    numero_serie,
                    codigo_inventario,
                    area,
                    estado,
                    usuario_asignado,
                    observaciones,
                    specs
                },
                createdBy
            );

            logger.info(`Asset created: ${codigo_inventario} by ${req.user!.username}`);
            res.status(201).json(asset);
        } catch (error) {
            next(error);
        }
    }

    async updateAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const {
                category_id,
                marca,
                modelo,
                numero_serie,
                codigo_inventario,
                area,
                estado,
                usuario_asignado,
                observaciones,
                specs
            } = req.body;

            const updatedBy = req.user!.user_id;

            const asset = await inventoryService.updateAsset(
                id,
                {
                    category_id,
                    marca,
                    modelo,
                    numero_serie,
                    codigo_inventario,
                    area,
                    estado,
                    usuario_asignado,
                    observaciones,
                    specs
                },
                updatedBy
            );

            logger.info(`Asset updated: ${asset.codigo_inventario} by ${req.user!.username}`);
            res.status(200).json(asset);
        } catch (error) {
            next(error);
        }
    }

    async deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const deletedBy = req.user!.user_id;

            await inventoryService.deleteAsset(id, deletedBy);

            logger.info(`Asset deleted: ID ${id} by ${req.user!.username}`);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new InventoryController();
