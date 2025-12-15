import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = 'logs';

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Extend Winston Logger interface
interface SecurityLogger extends winston.Logger {
    security: (event: string, details: object) => void;
}

const baseLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'inventory-service' },
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
        new winston.transports.File({ filename: path.join(logDir, 'security.log'), level: 'warn' }),
    ],
});

// If we're not in production then log to the console
if (process.env.NODE_ENV !== 'production') {
    baseLogger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

// Create extended logger with security method
const logger = baseLogger as SecurityLogger;
logger.security = (event: string, details: object) => {
    logger.warn(`[SECURITY] ${event}`, details);
};

export default logger;
