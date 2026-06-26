import slugify from 'slugify';
import * as repo from './events.repository';
import { AppError } from '../../middleware/errorHandler';
import { enrichTicket } from '../commerce/pricing';

export async function listAdmin() {
  return repo.findAllAdmin();
}

export async function getById(id: number) {
  const ev = await repo.findById(id);
  if (!ev) throw new AppError(404, 'NOT_FOUND', 'Sự kiện không tồn tại');
  return ev;
}

/** Public event detail with enriched ticket types. */
export async function getPublicBySlug(slug: string) {
  const ev = await repo.findPublishedBySlug(slug);
  if (!ev) throw new AppError(404, 'NOT_FOUND', 'Sự kiện không tồn tại');
  const ticketTypes = await repo.findPublishedTicketTypes(ev.id);
  return { ...ev, ticket_types: ticketTypes.map((t) => enrichTicket(t)) };
}

export async function create(input: Record<string, unknown>, userId: number) {
  const slug =
    (input.slug as string) ||
    slugify(input.name as string, { lower: true, strict: true });
  const existing = await repo.findBySlug(slug);
  if (existing) throw new AppError(409, 'SLUG_EXISTS', `Slug "${slug}" đã tồn tại`);
  return repo.create({ ...input, slug }, userId);
}

export async function update(id: number, input: Record<string, unknown>, userId: number) {
  if (input.slug) {
    const existing = await repo.findBySlug(input.slug as string);
    if (existing && existing.id !== id)
      throw new AppError(409, 'SLUG_EXISTS', `Slug "${input.slug}" đã tồn tại`);
  }
  const updated = await repo.update(id, input, userId);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Sự kiện không tồn tại');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Sự kiện không tồn tại');
  return deleted;
}

export async function publishEvent(id: number, userId: number) {
  const published = await repo.publish(id, userId);
  if (!published) throw new AppError(404, 'NOT_FOUND', 'Sự kiện không tồn tại');
  return published;
}
