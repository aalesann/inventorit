import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Category attributes interface
export interface CategoryAttributes {
    id: number;
    nombre: string;
    descripcion?: string;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Category creation attributes
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'descripcion' | 'is_active'> { }

// Category model class
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: number;
    public nombre!: string;
    public descripcion?: string;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    },
    {
        sequelize,
        tableName: 'Categories',
        timestamps: true,
    }
);

export default Category;
