import type { Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import * as service from './service';

function regenerateSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

export async function google(req: Request, res: Response): Promise<void> {
  const result = await service.verifyGoogleAndLogin(req.body.credential);
  const adminUser = req.session.user;

  await regenerateSession(req);
  req.session.user = adminUser;
  req.session.publicUser = result.sessionUser;
  await saveSession(req);

  res.json({
    success: true,
    data: {
      user: result.sessionUser,
      roles: result.access.roles,
      permissions: result.access.permissions,
      claimedOrders: result.claimedOrders,
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.session.publicUser) {
    throw new AppError(401, 'UNAUTHORIZED', 'Vui lòng đăng nhập');
  }

  const result = await service.getPublicSessionData(req.session.publicUser.id);
  req.session.publicUser = result.user;

  res.json({
    success: true,
    data: {
      user: result.user,
      roles: result.access.roles,
      permissions: result.access.permissions,
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  delete req.session.publicUser;
  await saveSession(req);
  res.json({ success: true, data: null });
}
