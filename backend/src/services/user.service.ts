import userRepository, { UserFilters } from '../repositories/user.repository';
import { AppError, UserDTO, CreateUserDTO, UpdateUserDTO } from '../types';

class UserService {
    async getAllUsers(filters?: UserFilters): Promise<UserDTO[]> {
        const users = await userRepository.findAll(filters);

        // Remove passwords from response
        return users.map(user => {
            const { password, ...userDTO } = user.toJSON();
            return userDTO as UserDTO;
        });
    }

    async getUserById(id: number): Promise<UserDTO | null> {
        const user = await userRepository.findById(id);

        if (!user) {
            return null;
        }

        const { password, ...userDTO } = user.toJSON();
        return userDTO as UserDTO;
    }

    async createUser(data: CreateUserDTO): Promise<UserDTO> {
        // Check if username already exists
        const existingUser = await userRepository.findByUsername(data.username);
        if (existingUser) {
            throw new AppError('El nombre de usuario ya existe', 409);
        }

        // Check if email already exists
        const existingEmail = await userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new AppError('El email ya está en uso', 409);
        }

        const user = await userRepository.create({
            username: data.username,
            password: data.password,
            email: data.email,
            role: data.role || 'user',
        });

        const { password, ...userDTO } = user.toJSON();
        return userDTO as UserDTO;
    }

    async updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO> {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Check if new username is already taken by another user
        if (data.username && data.username !== user.username) {
            const existingUser = await userRepository.findByUsername(data.username);
            if (existingUser) {
                throw new AppError('El nombre de usuario ya existe', 409);
            }
        }

        // Check if new email is already taken by another user
        if (data.email && data.email !== user.email) {
            const existingEmail = await userRepository.findByEmail(data.email);
            if (existingEmail) {
                throw new AppError('El email ya está en uso', 409);
            }
        }

        const updatedUser = await userRepository.update(id, data);

        if (!updatedUser) {
            throw new AppError('Error al actualizar usuario', 500);
        }

        const { password, ...userDTO } = updatedUser.toJSON();
        return userDTO as UserDTO;
    }

    async toggleUserActive(id: number, isActive: boolean): Promise<UserDTO> {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        const updatedUser = await userRepository.toggleActive(id, isActive);

        if (!updatedUser) {
            throw new AppError('Error al actualizar usuario', 500);
        }

        const { password, ...userDTO } = updatedUser.toJSON();
        return userDTO as UserDTO;
    }

    async deleteUser(id: number): Promise<void> {
        const user = await userRepository.findById(id);

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Prevent deleting yourself
        // This check should be done in controller with req.user.user_id

        await userRepository.delete(id);
    }
}

export default new UserService();
