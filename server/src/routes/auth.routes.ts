import { Router } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { authHandler } from '../handler/auth.handler';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

export const authRoutes = Router();

authRoutes.use(cookieParser());
authRoutes.use(authLimiter);

authRoutes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

authRoutes.get('/google/callback', authHandler.googleCallback);

authRoutes.post('/refresh', authHandler.refresh);

authRoutes.post('/logout', authenticate, authHandler.logout);

authRoutes.get('/me', authenticate, authHandler.me);
