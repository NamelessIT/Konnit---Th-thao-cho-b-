import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';
import type { SessionUser } from '@konnit/types';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
  }
  next();
}

export function requireRole(...roles: SessionUser['role'][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session?.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
    }
    if (!roles.includes(req.session.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện hành động này');
    }
    next();
  };
}
