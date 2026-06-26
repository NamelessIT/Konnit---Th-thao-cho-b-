import slugify from 'slugify';
import * as repo from './tickets.repository';
import { AppError } from '../../middleware/errorHandler';
import { enrichTicket } from '../commerce/pricing';

export async function listPublic() {
  const rows = await repo.findPublicList();
  return rows.map((t) => enrichTicket(t));
}

export async function getPublicById(id: number) {
  const t = await repo.findPublicById(id);
  if (!t) throw new AppError(404, 'NOT_FOUND', 'Vé không tồn tại');
  return enrichTicket(t);
}

export async function listAdmin(eventId?: number) {
  return repo.findAllAdmin(eventId);
}

export async function getById(id: number) {
  const t = await repo.findById(id);
  if (!t) throw new AppError(404, 'NOT_FOUND', 'Vé không tồn tại');
  return t;
}

export async function create(input: Record<string, unknown>, userId: number) {
  const slug =
    (input.slug as string) ||
    slugify(input.name as string, { lower: true, strict: true });
  return repo.create({ ...input, slug }, userId);
}

export async function update(id: number, input: Record<string, unknown>, userId: number) {
  const updated = await repo.update(id, input, userId);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Vé không tồn tại');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Vé không tồn tại');
  return deleted;
}
