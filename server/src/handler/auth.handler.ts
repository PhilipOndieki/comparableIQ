import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { prisma } from '../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/passport';
import { UnauthorizedError } from '../domain/errors';
import { UserRole, ApiResponse } from '../domain/types';
import { REFRESH_COOKIE_NAME } from '../domain/constants';
import { auditRepo } from '../repository/audit.repo';
import { AuditAction } from '../domain/types';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const authHandler = {
  googleCallback(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('google', { session: false }, async (err: Error | null, user: Record<string, unknown> | false) => {
      if (err || !user) {
        return res.redirect(`${process.env['FRONTEND_URL']}/?auth_error=true`);
      }

      try {
        const dbUser = user as { id: string; email: string; role: UserRole };
        const payload = { sub: dbUser.id, email: dbUser.email, role: dbUser.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

        await auditRepo.log({
          userId: dbUser.id,
          action: AuditAction.LOGIN,
          metadata: { email: dbUser.email },
          ipAddress: req.ip ?? 'unknown',
        });

        const redirectUrl = new URL(`${process.env['FRONTEND_URL']}/auth/callback`);
        redirectUrl.searchParams.set('token', accessToken);
        res.redirect(redirectUrl.toString());
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
      if (!token) throw new UnauthorizedError('No refresh token');

      const payload = verifyRefreshToken(token);
      if (!payload) throw new UnauthorizedError('Invalid refresh token');

      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');

      const newPayload = { sub: user.id, email: user.email, role: user.role as UserRole };
      const accessToken = generateAccessToken(newPayload);
      const refreshToken = generateRefreshToken(newPayload);

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

      const tookMs = Date.now() - req.startTime;
      const response: ApiResponse<{ accessToken: string; user: typeof user }> = {
        success: true,
        data: { accessToken, user },
        error: null,
        meta: { requestId: req.requestId, tookMs },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.jwtUser) {
        await auditRepo.log({
          userId: req.jwtUser.sub,
          action: AuditAction.LOGOUT,
          metadata: {},
          ipAddress: req.ip ?? 'unknown',
        });
      }

      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
      const tookMs = Date.now() - req.startTime;
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.jwtUser) throw new UnauthorizedError();

      const user = await prisma.user.findUnique({ where: { id: req.jwtUser.sub } });
      if (!user) throw new UnauthorizedError('User not found');

      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      });

      const tookMs = Date.now() - req.startTime;
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },
};
