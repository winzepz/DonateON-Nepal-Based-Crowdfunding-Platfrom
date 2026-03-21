import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/authRoutes';
import paymentRoutes from './routes/paymentRoutes';
import campaignRoutes from './routes/campaignRoutes';
import kycRoutes from './routes/kycRoutes';
import adminRoutes from './routes/adminRoutes';
import storyRoutes from './routes/storyRoutes';
import statsRoutes from './routes/statsRoutes';
import payoutRoutes from './routes/payoutRoutes';
import donationRoutes from './routes/donationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import supportRoutes from './routes/supportRoutes';

import { errorHandler } from './middleware/errorHandler';
import { attachRequestContext } from './middleware/requestContext';
import { apiLimiter, authLimiter, paymentLimiter } from './middleware/rateLimiter';
import { swaggerSpec } from './utils/swagger';
import pool from './db';
import { logger } from './utils/logger';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set. Server cannot start.');
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Server cannot start.');
    process.exit(1);
}

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
}));

app.use(attachRequestContext);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/payment/', paymentLimiter);

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
app.use(errorHandler);

const testDatabaseConnection = async () => {
    try {
        await pool.query('SELECT 1');
        logger.info('database.connected');
    } catch (error) {
        logger.error('database.connection_failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
    }
};

const PORT = Number(process.env.PORT || 3001);
testDatabaseConnection().then(() => {
    app.listen(PORT, () => {
        logger.info('server.started', { port: PORT });
    });
});

process.on('SIGINT', async () => {
    logger.info('server.shutdown');
    await pool.end();
    process.exit();
});
