import { prisma } from '../config/db';
import { User, UserRole } from '../domain/types';

function mapUser(u: {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  searchCountToday: number;
  searchCountResetAt: Date;
  hasMapAccess: boolean;
  isActive: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: u.id,
    googleId: u.googleId,
    email: u.email,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    role: u.role as UserRole,
    searchCountToday: u.searchCountToday,
    searchCountResetAt: u.searchCountResetAt,
    hasMapAccess: u.hasMapAccess,
    isActive: u.isActive,
    lastSeenAt: u.lastSeenAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export const userRepo = {
  async findById(id: string): Promise<User | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? mapUser(u) : null;
  },

  async list(params: { page: number; limit: number; role?: UserRole; search?: string; isActive?: boolean }): Promise<{ users: User[]; total: number }> {
    const { page, limit, role, search, isActive } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(role ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { displayName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.user.count({ where }),
    ]);

    return { users: rows.map(mapUser), total };
  },

  async upgradeToVerified(id: string): Promise<User> {
    const u = await prisma.user.update({
      where: { id },
      data: { role: UserRole.VERIFIED_VALUER },
    });
    return mapUser(u);
  },

  async deactivate(id: string): Promise<User> {
    const u = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return mapUser(u);
  },

  async toggleMapAccess(id: string): Promise<User> {
    const current = await prisma.user.findUnique({ where: { id }, select: { hasMapAccess: true } });
    const u = await prisma.user.update({
      where: { id },
      data: { hasMapAccess: !current?.hasMapAccess },
    });
    return mapUser(u);
  },

  async incrementSearchCount(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { searchCountToday: { increment: 1 } },
    });
  },

  async resetSearchCount(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { searchCountToday: 0, searchCountResetAt: new Date() },
    });
  },

  async countNewToday(since: Date): Promise<number> {
    return prisma.user.count({ where: { createdAt: { gte: since } } });
  },
};
