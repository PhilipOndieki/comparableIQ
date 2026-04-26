import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { comparableRepo } from '../repository/comparable.repo';
import { userRepo } from '../repository/user.repo';
import { auditRepo } from '../repository/audit.repo';
import { comparableService } from '../service/comparable.service';
import { userService } from '../service/user.service';
import { ValidationError } from '../domain/errors';
import { UserRole, AuditAction } from '../domain/types';
import { prisma } from '../config/db';

const comparableCreateSchema = z.object({
  parcelNumber: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  areaHa: z.number().positive(),
  salePrice: z.number().positive().optional(),
  saleDate: z.coerce.date(),
  locality: z.string().min(1),
  county: z.string().min(1),
  notes: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminHandler = {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [
        totalComparables,
        searchesToday,
        searchesYesterday,
        newSigninsToday,
        limitHitsToday,
      ] = await Promise.all([
        comparableRepo.totalCount(),
        auditRepo.countTodayByAction(AuditAction.SEARCH, today),
        auditRepo.countTodayByAction(AuditAction.SEARCH, yesterday),
        userRepo.countNewToday(today),
        auditRepo.countTodayByAction(AuditAction.SEARCH, today),
      ]);

      const tookMs = Date.now() - req.startTime;
      res.json({
        success: true,
        data: {
          totalComparables,
          searchesToday,
          searchesYesterday: Math.max(0, searchesYesterday - searchesToday),
          newSigninsToday,
          limitHitsToday,
        },
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async listComparables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const county = req.query['county'] as string | undefined;
      const search = req.query['search'] as string | undefined;

      const { comparables, total } = await comparableRepo.list({ page, limit, county, search });
      const tookMs = Date.now() - req.startTime;

      res.json({
        success: true,
        data: { comparables, total, page, limit },
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async createComparable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = comparableCreateSchema.parse(req.body);
      if (!req.jwtUser) throw new ValidationError('Auth required');

      const comp = await comparableService.create(
        { ...input, addedById: req.jwtUser.sub },
        req.ip ?? 'unknown',
      );

      const tookMs = Date.now() - req.startTime;
      res.status(201).json({
        success: true,
        data: comp,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateComparable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id) throw new ValidationError('ID required');

      const input = comparableCreateSchema.partial().parse(req.body);
      if (!req.jwtUser) throw new ValidationError('Auth required');

      const comp = await comparableService.update(id, input, req.jwtUser.sub, req.ip ?? 'unknown');
      const tookMs = Date.now() - req.startTime;

      res.json({
        success: true,
        data: comp,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteComparable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id) throw new ValidationError('ID required');
      if (!req.jwtUser) throw new ValidationError('Auth required');

      await comparableService.softDelete(id, req.jwtUser.sub, req.ip ?? 'unknown');
      const tookMs = Date.now() - req.startTime;

      res.json({
        success: true,
        data: null,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async bulkUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new ValidationError('CSV file required');
      if (!req.jwtUser) throw new ValidationError('Auth required');

      const csvContent = req.file.buffer.toString('utf-8');
      const result = await comparableService.bulkCreate(csvContent, req.jwtUser.sub, req.ip ?? 'unknown');
      const tookMs = Date.now() - req.startTime;

      res.json({
        success: true,
        data: result,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const role = req.query['role'] as UserRole | undefined;
      const search = req.query['search'] as string | undefined;
      const isActiveStr = req.query['is_active'] as string | undefined;
      const isActive = isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;

      const { users, total } = await userRepo.list({ page, limit, role, search, isActive });
      const tookMs = Date.now() - req.startTime;

      res.json({
        success: true,
        data: { users, total, page, limit },
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async upgradeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id || !req.jwtUser) throw new ValidationError('Invalid request');

      const user = await userService.upgradeToVerified(id, req.jwtUser.sub, req.ip ?? 'unknown');
      const tookMs = Date.now() - req.startTime;

      res.json({ success: true, data: user, error: null, meta: { requestId: req.requestId, tookMs } });
    } catch (err) {
      next(err);
    }
  },

  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id || !req.jwtUser) throw new ValidationError('Invalid request');

      const user = await userService.deactivate(id, req.jwtUser.sub, req.ip ?? 'unknown');
      const tookMs = Date.now() - req.startTime;

      res.json({ success: true, data: user, error: null, meta: { requestId: req.requestId, tookMs } });
    } catch (err) {
      next(err);
    }
  },

  async toggleMapAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'];
      if (!id || !req.jwtUser) throw new ValidationError('Invalid request');

      const user = await userService.toggleMapAccess(id, req.jwtUser.sub, req.ip ?? 'unknown');
      const tookMs = Date.now() - req.startTime;

      res.json({ success: true, data: user, error: null, meta: { requestId: req.requestId, tookMs } });
    } catch (err) {
      next(err);
    }
  },

  async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const action = req.query['action'] as AuditAction | undefined;
      const userId = req.query['user_id'] as string | undefined;
      const dateFrom = req.query['date_from'] ? new Date(req.query['date_from'] as string) : undefined;
      const dateTo = req.query['date_to'] ? new Date(req.query['date_to'] as string) : undefined;

      const { logs, total } = await auditRepo.list({ page, limit, action, userId, dateFrom, dateTo });
      const tookMs = Date.now() - req.startTime;

      res.json({
        success: true,
        data: { logs, total, page, limit },
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },

  async getRecentSearches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recentSearches = await prisma.auditLog.findMany({
        where: { action: 'SEARCH' },
        include: { user: { select: { email: true, displayName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const tookMs = Date.now() - req.startTime;
      res.json({
        success: true,
        data: recentSearches,
        error: null,
        meta: { requestId: req.requestId, tookMs },
      });
    } catch (err) {
      next(err);
    }
  },
};
