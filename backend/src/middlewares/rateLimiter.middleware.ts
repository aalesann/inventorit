import rateLimit from 'express-rate-limit';

// Global rate limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Has excedido el número máximo de solicitudes. Inténtalo nuevamente más tarde.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Has excedido el número máximo de solicitudes. Inténtalo nuevamente más tarde.'
        });
    }
});

// Strict rate limiter for login: 10 attempts per 1 minute (relaxed for dev)
export const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: 'Demasiados intentos de inicio de sesión. Inténtalo nuevamente en 1 minuto.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Demasiados intentos de inicio de sesión. Inténtalo nuevamente en 1 minuto.'
        });
    }
});
