import { cleanEnv, str, port, url, num } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 3001 }),
  FRONTEND_URL: url({ default: 'http://localhost:5173' }),

  DATABASE_URL: url(),
  REDIS_URL: url({ default: 'redis://localhost:6379' }),

  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: url(),

  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_ACCESS_EXPIRES_IN: str({ default: '15m' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),

  MAX_DAILY_SEARCHES: num({ default: 3 }),
  SEARCH_CACHE_TTL_SECONDS: num({ default: 600 }),
  PARCEL_CACHE_TTL_SECONDS: num({ default: 3600 }),
});
