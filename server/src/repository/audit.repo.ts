import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AuditAction, AuditLog } from '../domain/types';

interface LogParams {
  userId?: string;
  action: AuditAction;
  metadata: Record<string, unknown>;
  ipAddress: string;
}

interface ListParams {
  page: number;
  limit: number;
  action?: AuditAction;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const auditRepo = {
  async log(params: LogParams): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        metadata: params.metadata as Prisma.InputJsonValue,
        ipAddress: params.ipAddress,
      },
    });
  },

  async list(params: ListParams): Promise<{ logs: AuditLog[]; total: number }> {
    const { page, limit, action, userId, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
    };

    const [raw, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { email: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const logs: AuditLog[] = raw.map((l) => ({
      id: l.id,
      userId: l.userId,
      userEmail: l.user?.email ?? null,
      userDisplayName: l.user?.displayName ?? null,
      action: l.action as AuditAction,
      metadata: l.metadata as Record<string, unknown>,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    }));

    return { logs, total };
  },

  async countTodayByAction(action: AuditAction, since: Date): Promise<number> {
    return prisma.auditLog.count({
      where: { action, createdAt: { gte: since } },
    });
  },
};
