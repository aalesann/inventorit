import { z } from 'zod';

// Create asset validation schema
export const createAssetSchema = z.object({
    category_id: z.number().int().positive(),
    marca: z.string().min(1, 'La marca es requerida'),
    modelo: z.string().min(1, 'El modelo es requerido'),
    numero_serie: z.string().optional(),
    codigo_inventario: z.string().min(1, 'El código de inventario es requerido'),
    area: z.string().optional(),
    estado: z.enum(['EN_USO', 'EN_DEPOSITO', 'EN_REPARACION', 'BAJA']).optional(),
    usuario_asignado: z.string().optional(),
    observaciones: z.string().optional()
});

// Update asset validation schema
export const updateAssetSchema = z.object({
    category_id: z.number().int().positive().optional(),
    marca: z.string().min(1).optional(),
    modelo: z.string().min(1).optional(),
    numero_serie: z.string().optional(),
    codigo_inventario: z.string().min(1).optional(),
    area: z.string().optional(),
    estado: z.enum(['EN_USO', 'EN_DEPOSITO', 'EN_REPARACION', 'BAJA']).optional(),
    usuario_asignado: z.string().optional(),
    observaciones: z.string().optional()
});

// Asset filters validation schema
export const assetFiltersSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    category_id: z.string().regex(/^\d+$/).transform(Number).optional(),
    estado: z.enum(['EN_USO', 'EN_DEPOSITO', 'EN_REPARACION', 'BAJA']).optional(),
    area: z.string().optional(),
    usuario_asignado: z.string().optional(),
    search: z.string().optional()
});
