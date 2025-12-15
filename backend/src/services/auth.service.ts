import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import userRepository from '../repositories/user.repository';
import refreshTokenRepository from '../repositories/refreshToken.repository';
import loginAttemptRepository from '../repositories/loginAttempt.repository';
import { AppError, RegisterDTO, UserDTO, TokenPair, AccessTokenPayload, RefreshTokenPayload } from '../types';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

class AuthService {
    // Generate a pair of access and refresh tokens
    private async generateTokenPair(userId: number, username: string, role: 'admin' | 'user'): Promise<TokenPair> {
        // Generate access token
        const accessPayload: AccessTokenPayload = {
            user_id: userId,
            username,
            role,
            type: 'access'
        };

        const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
            expiresIn: JWT_ACCESS_EXPIRATION
        } as jwt.SignOptions);

        // Generate refresh token with unique ID
        const jti = crypto.randomBytes(32).toString('hex');
        const refreshPayload: RefreshTokenPayload = {
            user_id: userId,
            jti,
            type: 'refresh'
        };

        const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRATION
        } as jwt.SignOptions);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await refreshTokenRepository.createToken(userId, refreshToken, expiresAt);

        return { accessToken, refreshToken };
    }

    async login(username: string, password: string): Promise<TokenPair> {
        // Check if username is blocked
        const isBlocked = await loginAttemptRepository.isBlocked(username, 'username');

        if (isBlocked) {
            const remainingTime = await loginAttemptRepository.getRemainingBlockTime(username, 'username');
            logger.security('Login attempt on blocked account', { username, remainingTime });
            throw new AppError(
                `Cuenta bloqueada temporalmente. Inténtalo nuevamente en ${remainingTime} minutos.`,
                403
            );
        }

        // Find user
        const user = await userRepository.findByUsername(username);

        if (!user) {
            // Record failed attempt
            await loginAttemptRepository.recordFailedAttempt(username, 'username');
            logger.security('Login failed - user not found', { username });
            throw new AppError('Credenciales inválidas', 400);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Record failed attempt
            await loginAttemptRepository.recordFailedAttempt(username, 'username');
            const attemptCount = await loginAttemptRepository.getAttemptCount(username, 'username');
            logger.security('Login failed - invalid password', { username, attemptCount });
            throw new AppError('Credenciales inválidas', 400);
        }

        // Check if user is active
        if (!user.is_active) {
            logger.security('Login attempt on inactive account', { username });
            throw new AppError('Usuario inactivo', 403);
        }

        // Reset login attempts on successful login
        await loginAttemptRepository.resetAttempts(username, 'username');

        // Generate token pair
        const tokens = await this.generateTokenPair(user.id, user.username, user.role as 'admin' | 'user');

        logger.info(`User logged in successfully: ${username}`);
        logger.security('Successful login', { username, userId: user.id });

        return tokens;
    }

    async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, JWT_SECRET) as RefreshTokenPayload;

            if (decoded.type !== 'refresh') {
                throw new AppError('Token inválido', 401);
            }

            // Check if token exists and is valid in database
            const isValid = await refreshTokenRepository.isTokenValid(refreshToken);

            if (!isValid) {
                const tokenRecord = await refreshTokenRepository.findByToken(refreshToken);

                if (tokenRecord && tokenRecord.is_revoked) {
                    // Token reuse detected - security breach
                    logger.security('Refresh token reuse detected', {
                        userId: decoded.user_id,
                        jti: decoded.jti
                    });

                    // Revoke all user tokens
                    await refreshTokenRepository.revokeAllUserTokens(decoded.user_id);

                    throw new AppError(
                        'Token revocado. Por favor, inicia sesión nuevamente.',
                        403
                    );
                }

                throw new AppError('Token no válido o expirado', 401);
            }

            // Get user info
            const user = await userRepository.findById(decoded.user_id);

            if (!user || !user.is_active) {
                throw new AppError('Usuario no encontrado o inactivo', 403);
            }

            // Generate new token pair
            const newTokens = await this.generateTokenPair(
                user.id,
                user.username,
                user.role as 'admin' | 'user'
            );

            // Revoke old refresh token and link to new one
            await refreshTokenRepository.revokeToken(refreshToken, newTokens.refreshToken);

            logger.security('Access token refreshed', { userId: user.id });

            return newTokens;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError('Token inválido', 401);
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError('Token expirado', 401);
            }
            throw error;
        }
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            // Verify token format
            const decoded = jwt.verify(refreshToken, JWT_SECRET) as RefreshTokenPayload;

            // Revoke refresh token
            await refreshTokenRepository.revokeToken(refreshToken);

            logger.security('User logged out', { userId: decoded.user_id });
        } catch (error) {
            // Even if token is invalid, we don't throw error on logout
            logger.warn('Logout attempted with invalid token', { error });
        }
    }

    async register(data: RegisterDTO): Promise<UserDTO> {
        // Check if user already exists
        const existingUser = await userRepository.findByUsername(data.username);
        if (existingUser) {
            throw new AppError('El usuario ya existe', 409);
        }

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

        logger.security('New user registered', { username: data.username, role: data.role });

        // Return user without password
        const { password, ...userDTO } = user.toJSON();
        return userDTO as UserDTO;
    }
}

export default new AuthService();
