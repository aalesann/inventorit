import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// LoginAttempt attributes interface
export interface LoginAttemptAttributes {
    id: number;
    identifier: string;
    type: 'username' | 'ip';
    attempts: number;
    blocked_until?: Date;
    last_attempt: Date;
    createdAt?: Date;
}

// LoginAttempt creation attributes
export interface LoginAttemptCreationAttributes extends Optional<LoginAttemptAttributes, 'id' | 'attempts' | 'blocked_until' | 'last_attempt'> { }

// LoginAttempt model class
class LoginAttempt extends Model<LoginAttemptAttributes, LoginAttemptCreationAttributes> implements LoginAttemptAttributes {
    public id!: number;
    public identifier!: string;
    public type!: 'username' | 'ip';
    public attempts!: number;
    public blocked_until?: Date;
    public last_attempt!: Date;

    public readonly createdAt!: Date;
}

LoginAttempt.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        identifier: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: [['username', 'ip']]
            }
        },
        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        blocked_until: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        last_attempt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'LoginAttempts',
        timestamps: true,
        updatedAt: false,
        indexes: [
            { fields: ['identifier', 'type'] },
            { fields: ['blocked_until'] }
        ]
    }
);

export default LoginAttempt;
