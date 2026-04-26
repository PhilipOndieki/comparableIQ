import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../domain/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { error: err }));

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (err) {
    logger.error('Redis connection failed', { error: err });
    // Redis failure is non-fatal — app degrades gracefully
  }
}
