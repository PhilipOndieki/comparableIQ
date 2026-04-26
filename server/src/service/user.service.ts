import { userRepo } from '../repository/user.repo';
import { auditRepo } from '../repository/audit.repo';
import { NotFoundError } from '../domain/errors';
import { User, UserRole, AuditAction } from '../domain/types';

export const userService = {
  async upgradeToVerified(id: string, adminId: string, ipAddress: string): Promise<User> {
    const user = await userRepo.findById(id);
    if (!user) throw new NotFoundError('User');

    const updated = await userRepo.upgradeToVerified(id);
    await auditRepo.log({
      userId: adminId,
      action: AuditAction.USER_UPGRADED,
      metadata: { targetUserId: id, targetEmail: user.email, newRole: UserRole.VERIFIED_VALUER },
      ipAddress,
    });
    return updated;
  },

  async deactivate(id: string, adminId: string, ipAddress: string): Promise<User> {
    const user = await userRepo.findById(id);
    if (!user) throw new NotFoundError('User');

    const updated = await userRepo.deactivate(id);
    await auditRepo.log({
      userId: adminId,
      action: AuditAction.USER_DEACTIVATED,
      metadata: { targetUserId: id, targetEmail: user.email },
      ipAddress,
    });
    return updated;
  },

  async toggleMapAccess(id: string, adminId: string, ipAddress: string): Promise<User> {
    const user = await userRepo.findById(id);
    if (!user) throw new NotFoundError('User');

    const updated = await userRepo.toggleMapAccess(id);
    await auditRepo.log({
      userId: adminId,
      action: AuditAction.MAP_ACCESS_TOGGLED,
      metadata: { targetUserId: id, newValue: updated.hasMapAccess },
      ipAddress,
    });
    return updated;
  },
};
