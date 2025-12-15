import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Inventory attributes interface
export interface InventoryAttributes {
    id: number;
    name: string;
    type: string;
    serial_number: string;
    status: 'available' | 'assigned' | 'maintenance' | 'retired';
    assigned_to?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    specs?: Record<string, any>;
}

// Inventory creation attributes
export interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'id' | 'status' | 'assigned_to' | 'createdBy' | 'updatedBy'> { }

// Inventory model class
class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
    public id!: number;
    public name!: string;
    public type!: string;
    public serial_number!: string;
    public status!: 'available' | 'assigned' | 'maintenance' | 'retired';
    public assigned_to?: string;
    public createdBy?: string;
    public updatedBy?: string;
    public specs?: Record<string, any>; // JSONB field for technical specs

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Inventory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        serial_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired'),
            defaultValue: 'available',
        },
        specs: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
        assigned_to: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'Inventories',
        timestamps: true,
    }
);

export default Inventory;
