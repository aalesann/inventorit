import bcrypt from 'bcryptjs';

import userRepository from '../repositories/user.repository';
import { AppError, UserDTO } from '../types';
import logger from '../utils/logger';

class ProfileService {
    async getProfile(userId: number): Promise<UserDTO> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }
        const { password, ...userDTO } = user.toJSON();
        return userDTO as UserDTO;
    }

    async updateProfile(userId: number, data: { username?: string; email?: string }): Promise<UserDTO> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Check uniqueness if changing
        if (data.username && data.username !== user.username) {
            const exists = await userRepository.findByUsername(data.username);
            if (exists) throw new AppError('El nombre de usuario ya está en uso', 409);
        }
        if (data.email && data.email !== user.email) {
            const exists = await userRepository.findByEmail(data.email);
            if (exists) throw new AppError('El email ya está en uso', 409);
        }

        const updatedUser = await user.update(data);
        const { password, ...userDTO } = updatedUser.toJSON();
        return userDTO as UserDTO;
    }

    async changePassword(userId: number, currentPass: string, newPass: string): Promise<void> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        const isValid = await bcrypt.compare(currentPass, user.password);
        if (!isValid) {
            throw new AppError('La contraseña actual no es correcta', 400);
        }

        // Password hashing is handled by User model hooks (beforeUpdate)
        await user.update({ password: newPass });
        logger.info(`Password changed for user ${user.username}`);
    }

    async updateAvatar(userId: number, avatarUrl: string): Promise<string> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        await user.update({ avatar_url: avatarUrl });
        return avatarUrl;
    }
}

export default new ProfileService();
