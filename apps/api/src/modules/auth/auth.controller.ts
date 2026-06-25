import { Request, Response } from 'express';
import { authenticateUser } from './auth.service';

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
  res.json({ success: true, data: req.session.user });
}
