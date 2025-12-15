import helmet from 'helmet';
import { Express } from 'express';

export const configureSecurityHeaders = (app: Express): void => {
    // Use Helmet to set various HTTP headers for security
    app.use(helmet({
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        // X-Content-Type-Options: nosniff
        noSniff: true,
        // X-Frame-Options: DENY
        frameguard: { action: 'deny' },
        // X-XSS-Protection: 1; mode=block
        xssFilter: true,
        // Hide X-Powered-By header
        hidePoweredBy: true,
        // Strict-Transport-Security (HSTS)
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        }
    }));
};
