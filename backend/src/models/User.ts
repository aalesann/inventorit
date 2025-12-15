import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

// User attributes interface
export interface UserAttributes {
    id: number;
    username: string;
    password: string;
    email: string;
    role: 'admin' | 'user';
    avatar_url?: string | null;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// User creation attributes (id is optional as it's auto-generated)
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'is_active'> { }

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public password!: string;
    public email!: string;
    public role!: 'admin' | 'user';
    public avatar_url!: string | null;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user',
        },
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    },
    {
        sequelize,
        tableName: 'Users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user: User) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user: User) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
);

export default User;
