import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { prisma } from './db';
import { UserRole, JwtPayload } from '../domain/types';
import { logger } from '../domain/logger';

export function configurePassport(): void {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email from Google profile'));
          }

          const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: {
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value ?? null,
              lastSeenAt: new Date(),
            },
            create: {
              googleId: profile.id,
              email,
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value ?? null,
              role: UserRole.GOOGLE_USER,
              lastSeenAt: new Date(),
            },
          });

          if (!user.isActive) {
            return done(null, false, { message: 'Account deactivated' });
          }

          return done(null, user);
        } catch (err) {
          logger.error('Google OAuth error', { error: err });
          return done(err as Error);
        }
      },
    ),
  );
}

export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
