import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import inventoryRoutes from './routes/inventory.routes';
import reportRoutes from './routes/reports.routes';
import { User, Category } from './models';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { configureSecurityHeaders } from './middlewares/security.middleware';
import { globalLimiter, loginLimiter } from './middlewares/rateLimiter.middleware';
import logger from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const SERVER_IP = process.env.SERVER_IP || 'localhost';

// Security Headers - MUST be first
configureSecurityHeaders(app);

// Configure allowed origins for CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
        `http://${SERVER_IP}`,
        `http://${SERVER_IP}:80`,
        `http://${SERVER_IP}:3000`,
        'http://10.0.2.2',
        'http://10.0.2.2:80',
        'http://10.0.2.2:5173',
        'http://10.0.2.2:3000'
    ];

// Warn if using wildcard in production
if (process.env.NODE_ENV === 'production' && allowedOrigins.includes('*')) {
    logger.warn('⚠️  WARNING: CORS configured with wildcard (*) in production! This is a security risk.');
}

logger.info(`CORS configurado para los siguientes orígenes: ${allowedOrigins.join(', ')}`);

const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            logger.warn(`Origen bloqueado por CORS: ${origin}`);
            logger.security('CORS blocked origin', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // IMPORTANT: Enable credentials for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Global rate limiter
app.use(globalLimiter);

// Initialize Socket.IO with the same CORS configuration
const io = new SocketIOServer(server, {
    cors: {
        origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io available in routes
app.use((req: Request, _res: Response, next) => {
    req.io = io;
    next();
});

import profileRoutes from './routes/profile.routes';
import path from 'path';

// ... (imports)

// Mount routes with specific rate limiters
app.use('/api/auth/login', loginLimiter); // Strict rate limit for login
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reportes', reportRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (_req: Request, res: Response) => {
    res.send('Inventory API is running');
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('A user connected via WebSocket');
    socket.on('disconnect', () => {
        logger.info('User disconnected from WebSocket');
    });
});

// Sync database and start server
sequelize.sync({ alter: true })
    .then(async () => {
        logger.info('Database synced');

        // Create default admin user if it doesn't exist
        const admin = await User.findOne({ where: { username: 'admin' } });
        if (!admin) {
            const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Adm1n$ecur3!2024';
            await User.create({
                username: 'admin',
                email: 'admin@sistema.com',
                password: defaultPassword,
                role: 'admin'
            });
            logger.info('Admin por defecto creado: admin/[PASSWORD_HIDDEN]');
            logger.security('Default admin user created', { username: 'admin' });
        }

        // Create predefined categories
        const categories = [
            { nombre: 'PC de Escritorio', descripcion: 'Computadoras de escritorio' },
            { nombre: 'Notebooks', descripcion: 'Computadoras portátiles' },
            { nombre: 'Monitores', descripcion: 'Pantallas y monitores' },
            { nombre: 'UPS', descripcion: 'Sistemas de alimentación ininterrumpida' },
            { nombre: 'Impresoras', descripcion: 'Impresoras y multifuncionales' }
        ];

        for (const cat of categories) {
            await Category.findOrCreate({
                where: { nombre: cat.nombre },
                defaults: cat
            });
        }
        logger.info('Categorías predefinidas verificadas');

        server.listen(Number(PORT), '0.0.0.0', () => {
            logger.info(`Server running on http://${SERVER_IP}:${PORT}`);
            logger.info(`Server listening on all network interfaces (0.0.0.0:${PORT})`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info('✅ Security features enabled:');
            logger.info('  - Rate limiting (100 req/15min global, 5 req/15min login)');
            logger.info('  - Login attempt blocking (5 attempts, 15min block)');
            logger.info('  - Access/Refresh token system (15min/7days)');
            logger.info('  - Token rotation and revocation');
            logger.info('  - Security headers (Helmet)');
            logger.info('  - Input validation (Zod)');
            logger.info('  - Password policy enforcement');
        });
    })
    .catch((err) => {
        logger.error('Unable to sync database: %o', err);
    });
