import { Router } from 'express';
import multer from 'multer';
import { adminHandler } from '../handler/admin.handler';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../domain/types';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireRole(UserRole.ADMIN));

adminRoutes.get('/dashboard', adminHandler.getDashboard);
adminRoutes.get('/dashboard/recent-searches', adminHandler.getRecentSearches);

adminRoutes.get('/comparables', adminHandler.listComparables);
adminRoutes.post('/comparables', adminHandler.createComparable);
adminRoutes.put('/comparables/:id', adminHandler.updateComparable);
adminRoutes.delete('/comparables/:id', adminHandler.deleteComparable);
adminRoutes.post('/comparables/bulk', upload.single('file'), adminHandler.bulkUpload);

adminRoutes.get('/users', adminHandler.listUsers);
adminRoutes.put('/users/:id/upgrade', adminHandler.upgradeUser);
adminRoutes.put('/users/:id/deactivate', adminHandler.deactivateUser);
adminRoutes.put('/users/:id/map-access', adminHandler.toggleMapAccess);

adminRoutes.get('/audit-logs', adminHandler.listAuditLogs);
