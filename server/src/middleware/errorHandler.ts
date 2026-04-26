import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../domain/errors';
import { logger } from '../domain/logger';
import { ApiResponse } from '../domain/types';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const tookMs = Date.now() - (req.startTime ?? Date.now());

  if (err instanceof AppError) {
    const body: ApiResponse<null> = {
      success: false,
      data: null,
      error: { code: err.code, message: err.message },
      meta: { requestId: req.requestId, tookMs },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    const body: ApiResponse<null> = {
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message },
      meta: { requestId: req.requestId, tookMs },
    };
    res.status(400).json(body);
    return;
  }

  logger.error('Unhandled error', { error: err, requestId: req.requestId, path: req.path });

  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
    meta: { requestId: req.requestId, tookMs },
  };
  res.status(500).json(body);
}
