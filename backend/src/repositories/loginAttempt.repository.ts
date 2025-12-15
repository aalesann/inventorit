import { Op } from 'sequelize';
import LoginAttempt from '../models/LoginAttempt';

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '10');
const BLOCK_DURATION_MINUTES = parseInt(process.env.BLOCK_DURATION_MINUTES || '1');

class LoginAttemptRepository {
    // Record a failed login attempt
    async recordFailedAttempt(identifier: string, type: 'username' | 'ip'): Promise<LoginAttempt> {
        const existing = await LoginAttempt.findOne({
            where: { identifier, type }
        });

        if (existing) {
            const newAttempts = existing.attempts + 1;
            const shouldBlock = newAttempts >= MAX_LOGIN_ATTEMPTS;

            await existing.update({
                attempts: newAttempts,
                last_attempt: new Date(),
                blocked_until: shouldBlock
                    ? new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000)
                    : existing.blocked_until
            });

            return existing;
        } else {
            return await LoginAttempt.create({
                identifier,
                type,
                attempts: 1,
                last_attempt: new Date()
            });
        }
    }

    // Check if an identifier is currently blocked
    async isBlocked(identifier: string, type: 'username' | 'ip'): Promise<boolean> {
        const attempt = await LoginAttempt.findOne({
            where: { identifier, type }
        });

        if (!attempt || !attempt.blocked_until) {
            return false;
        }

        // Check if block has expired
        if (new Date() > attempt.blocked_until) {
            // Block expired, reset attempts
            await attempt.update({
                attempts: 0,
                blocked_until: undefined
            });
            return false;
        }

        return true;
    }

    // Get remaining block time in minutes
    async getRemainingBlockTime(identifier: string, type: 'username' | 'ip'): Promise<number> {
        const attempt = await LoginAttempt.findOne({
            where: { identifier, type }
        });

        if (!attempt || !attempt.blocked_until) {
            return 0;
        }

        const now = new Date();
        if (now > attempt.blocked_until) {
            return 0;
        }

        const remainingMs = attempt.blocked_until.getTime() - now.getTime();
        return Math.ceil(remainingMs / (60 * 1000));
    }

    // Reset attempts after successful login
    async resetAttempts(identifier: string, type: 'username' | 'ip'): Promise<void> {
        await LoginAttempt.destroy({
            where: { identifier, type }
        });
    }

    // Clean up old login attempt records (older than 24 hours)
    async cleanupOld(): Promise<number> {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await LoginAttempt.destroy({
            where: {
                last_attempt: {
                    [Op.lt]: oneDayAgo
                },
                [Op.or]: [
                    { blocked_until: { [Op.is]: null as any } },
                    { blocked_until: { [Op.lt]: new Date() } }
                ]
            }
        });

        return result;
    }

    // Get current attempt count
    async getAttemptCount(identifier: string, type: 'username' | 'ip'): Promise<number> {
        const attempt = await LoginAttempt.findOne({
            where: { identifier, type }
        });

        return attempt ? attempt.attempts : 0;
    }
}

export default new LoginAttemptRepository();
