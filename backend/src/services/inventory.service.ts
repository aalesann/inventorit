import assetRepository, { AssetFilters, Pagination } from '../repositories/asset.repository';
import categoryRepository from '../repositories/category.repository';
import {
    AppError,
    AssetDTO,
    CreateAssetDTO,
    UpdateAssetDTO,
    PaginatedAssets,
    CategoryDTO,
    CreateCategoryDTO
} from '../types';

class InventoryService {
    async getAssets(filters: AssetFilters, pagination: Pagination): Promise<PaginatedAssets> {
        const { rows, count } = await assetRepository.findAll(filters, pagination);

        return {
            total: count,
            page: pagination.page,
            limit: pagination.limit,
            assets: rows.map(asset => asset.toJSON() as AssetDTO),
            data: rows.map(asset => asset.toJSON() as AssetDTO)
        };
    }

    async getAssetById(id: number): Promise<AssetDTO | null> {
        const asset = await assetRepository.findById(id);

        if (!asset) {
            return null;
        }

        return asset.toJSON() as AssetDTO;
    }

    async createAsset(data: CreateAssetDTO, createdBy: number): Promise<AssetDTO> {
        // Check if inventory code already exists
        const existingAsset = await assetRepository.findByInventoryCode(data.codigo_inventario);
        if (existingAsset) {
            throw new AppError('El código de inventario ya existe', 409);
        }

        const asset = await assetRepository.create({
            ...data,
            estado: data.estado || 'EN_DEPOSITO',
            created_by: createdBy
        });

        return asset.toJSON() as AssetDTO;
    }

    async updateAsset(id: number, data: UpdateAssetDTO, updatedBy: number): Promise<AssetDTO> {
        const asset = await assetRepository.findById(id);

        if (!asset) {
            throw new AppError('Equipo no encontrado', 404);
        }

        // Check if new inventory code is already taken by another asset
        if (data.codigo_inventario && data.codigo_inventario !== asset.codigo_inventario) {
            const existingAsset = await assetRepository.findByInventoryCodeExcludingId(
                data.codigo_inventario,
                id
            );
            if (existingAsset) {
                throw new AppError('El código de inventario ya existe', 409);
            }
        }

        const updatedAsset = await assetRepository.update(id, {
            ...data,
            updated_by: updatedBy
        });

        if (!updatedAsset) {
            throw new AppError('Error al actualizar equipo', 500);
        }

        return updatedAsset.toJSON() as AssetDTO;
    }

    async deleteAsset(id: number, deletedBy: number): Promise<void> {
        const success = await assetRepository.softDelete(id, deletedBy);

        if (!success) {
            throw new AppError('Equipo no encontrado', 404);
        }
    }

    async getCategories(): Promise<CategoryDTO[]> {
        const categories = await categoryRepository.findAll();
        return categories.map(cat => cat.toJSON() as CategoryDTO);
    }

    async createCategory(data: CreateCategoryDTO): Promise<CategoryDTO> {
        // Check if category already exists
        const existingCategory = await categoryRepository.findByName(data.nombre);
        if (existingCategory) {
            throw new AppError('La categoría ya existe', 409);
        }

        const category = await categoryRepository.create(data);
        return category.toJSON() as CategoryDTO;
    }
}

export default new InventoryService();
