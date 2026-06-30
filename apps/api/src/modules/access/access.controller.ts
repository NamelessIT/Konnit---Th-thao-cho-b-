import { Request, Response } from 'express';
import * as service from './access.service';

export async function listUsers(_req: Request, res: Response) {
  res.json({ success: true, data: await service.listUsers() });
}
export async function createUser(req: Request, res: Response) {
  res
    .status(201)
    .json({ success: true, data: await service.createUser(req.session.user!.id, req.body) });
}
export async function updateUser(req: Request, res: Response) {
  res.json({
    success: true,
    data: await service.updateUser(Number(req.params.id), req.session.user!.id, req.body),
  });
}
export async function banUser(req: Request, res: Response) {
  await service.setStatus(Number(req.params.id), req.session.user!.id, 'disabled');
  res.json({ success: true, data: null });
}
export async function unlockUser(req: Request, res: Response) {
  await service.setStatus(Number(req.params.id), req.session.user!.id, 'active');
  res.json({ success: true, data: null });
}
export async function deleteUser(req: Request, res: Response) {
  await service.deleteUser(Number(req.params.id), req.session.user!.id);
  res.json({ success: true, data: null });
}
export async function listRoles(_req: Request, res: Response) {
  res.json({ success: true, data: await service.listRoles() });
}
export async function createRole(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await service.createRole(req.body) });
}
export async function updateRole(req: Request, res: Response) {
  res.json({ success: true, data: await service.updateRole(Number(req.params.id), req.body) });
}
export async function setRolePermissions(req: Request, res: Response) {
  await service.setRolePermissions(Number(req.params.id), req.body.permissionKeys);
  res.json({ success: true, data: null });
}
export async function deleteRole(req: Request, res: Response) {
  await service.deleteRole(Number(req.params.id));
  res.json({ success: true, data: null });
}
export async function listPermissions(_req: Request, res: Response) {
  res.json({ success: true, data: await service.listPermissions() });
}