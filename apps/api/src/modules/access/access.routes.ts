import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAdminAuth, requirePermission } from '../auth/access.middleware';
import * as v from './access.validation';
import * as ctrl from './access.controller';

export const accessRoutes = Router();

// Chỉ super_admin (có access.manage)
accessRoutes.use(requireAdminAuth, requirePermission('access.manage'));

// Users
accessRoutes.get('/users', asyncHandler(ctrl.listUsers));
accessRoutes.post('/users', validate(v.createUserSchema), asyncHandler(ctrl.createUser));
accessRoutes.patch('/users/:id', validate(v.updateUserSchema), asyncHandler(ctrl.updateUser));
accessRoutes.post('/users/:id/ban', asyncHandler(ctrl.banUser));
accessRoutes.post('/users/:id/unlock', asyncHandler(ctrl.unlockUser));
accessRoutes.delete('/users/:id', asyncHandler(ctrl.deleteUser));

// Roles
accessRoutes.get('/roles', asyncHandler(ctrl.listRoles));
accessRoutes.post('/roles', validate(v.createRoleSchema), asyncHandler(ctrl.createRole));
accessRoutes.patch('/roles/:id', validate(v.updateRoleSchema), asyncHandler(ctrl.updateRole));
accessRoutes.put('/roles/:id/permissions', validate(v.setRolePermsSchema), asyncHandler(ctrl.setRolePermissions));
accessRoutes.delete('/roles/:id', asyncHandler(ctrl.deleteRole));

// Permissions (catalog)
accessRoutes.get('/permissions', asyncHandler(ctrl.listPermissions));