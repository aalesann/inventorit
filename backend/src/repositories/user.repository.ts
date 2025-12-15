import User from '../models/User';
import { UserCreationAttributes, UserAttributes } from '../models/User';

export interface UserFilters {
    role?: 'admin' | 'user';
    is_active?: boolean;
}

class UserRepository {
    async findById(id: number): Promise<User | null> {
        return await User.findByPk(id);
    }

    async findByUsername(username: string): Promise<User | null> {
        return await User.findOne({ where: { username } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await User.findOne({ where: { email } });
    }

    async findAll(filters?: UserFilters): Promise<User[]> {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        if (filters?.is_active !== undefined) {
            where.is_active = filters.is_active;
        }

        return await User.findAll({ where });
    }

    async create(data: UserCreationAttributes): Promise<User> {
        return await User.create(data);
    }

    async update(id: number, data: Partial<UserAttributes>): Promise<User | null> {
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }

        await user.update(data);
        return user;
    }

    async toggleActive(id: number, isActive: boolean): Promise<User | null> {
        const user = await User.findByPk(id);
        if (!user) {
            return null;
        }

        await user.update({ is_active: isActive });
        return user;
    }

    async delete(id: number): Promise<boolean> {
        const user = await User.findByPk(id);
        if (!user) {
            return false;
        }

        await user.destroy();
        return true;
    }
}

export default new UserRepository();
