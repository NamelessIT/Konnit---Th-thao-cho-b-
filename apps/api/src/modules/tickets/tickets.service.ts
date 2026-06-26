import slugify from 'slugify';
import * as repo from './tickets.repository';
import { AppError } from '../../middleware/errorHandler';
import { enrichTicket } from '../commerce/pricing';
import { env } from '../../config/env';
import { deleteCachedKeys, getCachedJson, setCachedJson } from '../../config/redisCache';

const PUBLIC_TICKETS_CACHE_KEY = 'public:ticket-types:v1';

export async function invalidatePublicTicketCache() {
  await deleteCachedKeys([PUBLIC_TICKETS_CACHE_KEY]);
}

export async function listPublic() {
  const cached = await getCachedJson<unknown[]>(PUBLIC_TICKETS_CACHE_KEY);
  if (cached) return cached;

  const rows = await repo.findPublicList();
  const tickets = rows.map((t) => enrichTicket(t));
  await setCachedJson(
    PUBLIC_TICKETS_CACHE_KEY,
    tickets,
    env.PUBLIC_TICKETS_CACHE_TTL_SECONDS,
  );
  return tickets;
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
  const created = await repo.create({ ...input, slug }, userId);
  await invalidatePublicTicketCache();
  return created;
}

export async function update(id: number, input: Record<string, unknown>, userId: number) {
  const updated = await repo.update(id, input, userId);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Vé không tồn tại');
  await invalidatePublicTicketCache();
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Vé không tồn tại');
  await invalidatePublicTicketCache();
  return deleted;
}
