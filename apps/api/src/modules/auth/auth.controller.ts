import { Request, Response } from 'express';
import { authenticateUser } from './auth.service';
import { loadPrincipalAccess } from './access.middleware';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);

  req.session.user = user;

  res.json({ success: true, data: { user } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true, data: null });
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.session.user;
  if (!user) {
    res.json({ success: true, data: null });
    return;
  }
  // Bổ sung roles/permissions tươi (RBAC) để FE phân quyền chính xác (vd nút Huỷ đơn super-admin-only).
  const access = await loadPrincipalAccess('admin', user.id);
  res.json({
    success: true,
    data: { ...user, roles: access.roles, permissions: access.permissions },
  });
}
