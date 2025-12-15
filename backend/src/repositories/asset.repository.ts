import { Op } from 'sequelize';
import Asset from '../models/Asset';
import Category from '../models/Category';
import User from '../models/User';
import { AssetCreationAttributes, AssetAttributes } from '../models/Asset';

export interface AssetFilters {
    category_id?: number;
    estado?: 'EN_USO' | 'EN_DEPOSITO' | 'EN_REPARACION' | 'BAJA';
    area?: string;
    usuario_asignado?: string;
    search?: string;
}

export interface Pagination {
    page: number;
    limit: number;
    offset: number;
}

class AssetRepository {
    async findAll(filters: AssetFilters, pagination: Pagination): Promise<{ rows: Asset[], count: number }> {
        const where: any = { is_deleted: false };

        if (filters.category_id) {
            where.category_id = filters.category_id;
        }

        if (filters.estado) {
            where.estado = filters.estado;
        }

        if (filters.area) {
            where.area = { [Op.iLike]: `%${filters.area}%` };
        }

        if (filters.usuario_asignado) {
            where.usuario_asignado = { [Op.iLike]: `%${filters.usuario_asignado}%` };
        }

        if (filters.search) {
            where[Op.or] = [
                { marca: { [Op.iLike]: `%${filters.search}%` } },
                { modelo: { [Op.iLike]: `%${filters.search}%` } },
                { numero_serie: { [Op.iLike]: `%${filters.search}%` } },
                { codigo_inventario: { [Op.iLike]: `%${filters.search}%` } }
            ];
        }

        return await Asset.findAndCountAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'nombre']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'username']
                }
            ],
            limit: pagination.limit,
            offset: pagination.offset,
            order: [['createdAt', 'DESC']]
        });
    }

    async findById(id: number): Promise<Asset | null> {
        return await Asset.findOne({
            where: { id, is_deleted: false },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'nombre']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'deleter',
                    attributes: ['id', 'username']
                }
            ]
        });
    }

    async findByInventoryCode(codigo: string): Promise<Asset | null> {
        return await Asset.findOne({
            where: { codigo_inventario: codigo, is_deleted: false }
        });
    }

    async findByInventoryCodeExcludingId(codigo: string, excludeId: number): Promise<Asset | null> {
        return await Asset.findOne({
            where: {
                codigo_inventario: codigo,
                id: { [Op.ne]: excludeId },
                is_deleted: false
            }
        });
    }

    async create(data: AssetCreationAttributes): Promise<Asset> {
        const asset = await Asset.create(data);

        // Reload with associations
        await asset.reload({
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'nombre']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username']
                }
            ]
        });

        return asset;
    }

    async update(id: number, data: Partial<AssetAttributes>): Promise<Asset | null> {
        const asset = await Asset.findOne({
            where: { id, is_deleted: false }
        });

        if (!asset) {
            return null;
        }

        await asset.update(data);

        // Reload with associations
        await asset.reload({
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'nombre']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username']
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'username']
                }
            ]
        });

        return asset;
    }

    async softDelete(id: number, deletedBy: number): Promise<boolean> {
        const asset = await Asset.findOne({
            where: { id, is_deleted: false }
        });

        if (!asset) {
            return false;
        }

        await asset.update({
            is_deleted: true,
            deleted_at: new Date(),
            deleted_by: deletedBy
        });

        return true;
    }
}

export default new AssetRepository();
