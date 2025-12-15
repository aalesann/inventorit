import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// RefreshToken attributes interface
export interface RefreshTokenAttributes {
    id: number;
    user_id: number;
    token_hash: string;
    expires_at: Date;
    is_revoked: boolean;
    revoked_at?: Date;
    replaced_by_token?: string;
    createdAt?: Date;
}

// RefreshToken creation attributes
export interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'is_revoked' | 'revoked_at' | 'replaced_by_token'> { }

// RefreshToken model class
class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    public id!: number;
    public user_id!: number;
    public token_hash!: string;
    public expires_at!: Date;
    public is_revoked!: boolean;
    public revoked_at?: Date;
    public replaced_by_token?: string;

    public readonly createdAt!: Date;
}

RefreshToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        token_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        replaced_by_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'RefreshTokens',
        timestamps: true,
        updatedAt: false, // Only track creation
        indexes: [
            { fields: ['user_id'] },
            { fields: ['token_hash'] },
            { fields: ['expires_at'] }
        ]
    }
);

export default RefreshToken;
