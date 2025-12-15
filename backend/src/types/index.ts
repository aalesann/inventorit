// Types
export type UserRole = 'admin' | 'user';

export enum AssetStatus {
    EN_USO = 'EN_USO',
    EN_DEPOSITO = 'EN_DEPOSITO',
    EN_REPARACION = 'EN_REPARACION',
    BAJA = 'BAJA'
}

// Token types
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface AccessTokenPayload {
    user_id: number;
    username: string;
    role: UserRole;
    type: 'access';
}

export interface RefreshTokenPayload {
    user_id: number;
    jti: string;
    type: 'refresh';
}

// Password validation
export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
}

// Pagination
export interface Pagination {
    page: number;
    limit: number;
    offset: number;
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    data: T[];
}

// User DTOs
export interface UserDTO {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDTO {
    username: string;
    password: string;
    email: string;
    role?: UserRole;
}

export interface UpdateUserDTO {
    username?: string;
    email?: string;
    password?: string;
    role?: UserRole;
}

export interface RegisterDTO {
    username: string;
    password: string;
    email: string;
    role?: UserRole;
}

export interface LoginDTO {
    username: string;
    password: string;
}

export interface UserFilters {
    role?: UserRole;
    is_active?: boolean;
}

// Category DTOs
export interface CategoryDTO {
    id: number;
    nombre: string;
    descripcion?: string;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryDTO {
    nombre: string;
    descripcion?: string;
}

// Asset DTOs
export interface AssetDTO {
    id: number;
    category_id: number;
    marca: string;
    modelo: string;
    numero_serie?: string;
    codigo_inventario: string;
    area?: string;
    estado: AssetStatus;
    usuario_asignado?: string;
    observaciones?: string;
    created_by: number;
    updated_by?: number;
    deleted_by?: number;
    deleted_at?: Date;
    is_deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: CategoryDTO;
    creator?: UserDTO;
    updater?: UserDTO;
    deleter?: UserDTO;
    specs?: Record<string, any>;
}

export interface CreateAssetDTO {
    category_id: number;
    marca: string;
    modelo: string;
    numero_serie?: string;
    codigo_inventario: string;
    area?: string;
    estado?: AssetStatus;
    usuario_asignado?: string;
    observaciones?: string;
    specs?: Record<string, any>;
}

export interface UpdateAssetDTO {
    category_id?: number;
    marca?: string;
    modelo?: string;
    numero_serie?: string;
    codigo_inventario?: string;
    area?: string;
    estado?: AssetStatus;
    usuario_asignado?: string;
    observaciones?: string;
    specs?: Record<string, any>;
}

export interface AssetFilters {
    category_id?: number;
    estado?: AssetStatus;
    area?: string;
    usuario_asignado?: string;
    search?: string;
}

export interface PaginatedAssets extends PaginatedResponse<AssetDTO> {
    assets: AssetDTO[];
}

// JWT Payload
export interface JWTPayload {
    user_id: number;
    username: string;
    role: UserRole;
}

// Custom Error
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
