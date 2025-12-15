import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken';

class RefreshTokenRepository {
    // Hash a token using SHA-256
    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    // Create a new refresh token
    async createToken(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
        const tokenHash = this.hashToken(token);

        return await RefreshToken.create({
            user_id: userId,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
    }

    // Find a refresh token by its hash
    async findByToken(token: string): Promise<RefreshToken | null> {
        const tokenHash = this.hashToken(token);

        return await RefreshToken.findOne({
            where: { token_hash: tokenHash }
        });
    }

    // Revoke a refresh token
    async revokeToken(token: string, replacedByToken?: string): Promise<boolean> {
        const tokenHash = this.hashToken(token);

        const refreshToken = await RefreshToken.findOne({
            where: { token_hash: tokenHash }
        });

        if (!refreshToken) {
            return false;
        }

        await refreshToken.update({
            is_revoked: true,
            revoked_at: new Date(),
            replaced_by_token: replacedByToken ? this.hashToken(replacedByToken) : undefined
        });

        return true;
    }

    // Revoke all refresh tokens for a user (security breach scenario)
    async revokeAllUserTokens(userId: number): Promise<number> {
        const [affectedCount] = await RefreshToken.update(
            {
                is_revoked: true,
                revoked_at: new Date()
            },
            {
                where: {
                    user_id: userId,
                    is_revoked: false
                }
            }
        );

        return affectedCount;
    }

    // Check if a token is valid (not revoked and not expired)
    async isTokenValid(token: string): Promise<boolean> {
        const refreshToken = await this.findByToken(token);

        if (!refreshToken) {
            return false;
        }

        if (refreshToken.is_revoked) {
            return false;
        }

        if (new Date() > refreshToken.expires_at) {
            return false;
        }

        return true;
    }

    // Clean up expired tokens (should be run periodically)
    async cleanupExpired(): Promise<number> {
        const result = await RefreshToken.destroy({
            where: {
                expires_at: {
                    [require('sequelize').Op.lt]: new Date()
                }
            }
        });

        return result;
    }
}

export default new RefreshTokenRepository();
