import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';

function makeRedisStore(prefix: string): RedisStore {
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (command: string, ...args: string[]) => (redis as any).call(command, ...args),
    prefix,
  });
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore('rl:general:'),
  message: { success: false, data: null, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  skip: () => false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore('rl:auth:'),
  message: { success: false, data: null, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts' } },
  skip: () => false,
});
