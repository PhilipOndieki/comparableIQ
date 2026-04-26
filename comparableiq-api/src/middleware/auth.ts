import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/passport';
import { UnauthorizedError } from '../domain/errors';
import { UserRole } from '../domain/types';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError());
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }

  req.jwtUser = payload;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (payload) {
    req.jwtUser = payload;
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.jwtUser) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.jwtUser.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
}
