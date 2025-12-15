import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Asset attributes interface
export interface AssetAttributes {
    id: number;
    category_id: number;
    marca: string;
    modelo: string;
    numero_serie?: string;
    codigo_inventario: string;
    area?: string;
    estado: 'EN_USO' | 'EN_DEPOSITO' | 'EN_REPARACION' | 'BAJA';
    usuario_asignado?: string;
    observaciones?: string;
    created_by: number;
    updated_by?: number;
    deleted_by?: number;
    deleted_at?: Date;
    is_deleted: boolean;
    specs?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

// Asset creation attributes
export interface AssetCreationAttributes extends Optional<AssetAttributes, 'id' | 'numero_serie' | 'area' | 'estado' | 'usuario_asignado' | 'observaciones' | 'updated_by' | 'deleted_by' | 'deleted_at' | 'is_deleted' | 'specs'> { }

// Asset model class
class Asset extends Model<AssetAttributes, AssetCreationAttributes> implements AssetAttributes {
    public id!: number;
    public category_id!: number;
    public marca!: string;
    public modelo!: string;
    public numero_serie?: string;
    public codigo_inventario!: string;
    public area?: string;
    public estado!: 'EN_USO' | 'EN_DEPOSITO' | 'EN_REPARACION' | 'BAJA';
    public usuario_asignado?: string;
    public observaciones?: string;
    public created_by!: number;
    public updated_by?: number;
    public deleted_by?: number;
    public deleted_at?: Date;
    public is_deleted!: boolean;
    public specs?: Record<string, any>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Asset.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Categories',
                key: 'id'
            }
        },
        marca: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modelo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numero_serie: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        codigo_inventario: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        area: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        estado: {
            type: DataTypes.ENUM('EN_USO', 'EN_DEPOSITO', 'EN_REPARACION', 'BAJA'),
            defaultValue: 'EN_DEPOSITO',
        },
        usuario_asignado: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        specs: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        }
    },
    {
        sequelize,
        tableName: 'Assets',
        timestamps: true,
    }
);

export default Asset;
