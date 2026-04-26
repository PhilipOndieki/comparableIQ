import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import passport from 'passport';
import { env } from './config/env';
import { connectDb } from './config/db';
import { connectRedis } from './config/redis';
import { configurePassport } from './config/passport';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { authRoutes } from './routes/auth.routes';
import { searchRoutes } from './routes/search.routes';
import { adminRoutes } from './routes/admin.routes';
import { logger } from './domain/logger';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(requestId);
app.use(generalLimiter);
app.use(passport.initialize());
configurePassport();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function start(): Promise<void> {
  await connectDb();
  await connectRedis();

  app.listen(env.PORT, () => {
    logger.info(`ComparableIQ API running on port ${env.PORT}`, { env: env.NODE_ENV });
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});

export { app };
