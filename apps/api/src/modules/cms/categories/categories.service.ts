import slugify from 'slugify';
import * as repo from './categories.repository';
import { AppError } from '../../../middleware/errorHandler';

export async function list() {
  return repo.findAll();
}

export async function getById(id: number) {
  const cat = await repo.findById(id);
  if (!cat) throw new AppError(404, 'NOT_FOUND', 'Danh mục không tồn tại');
  return cat;
}

export async function create(
  input: { name: string; slug?: string; description?: string; parentId?: number | null },
  userId: number,
) {
  const slug = input.slug || slugify(input.name, { lower: true, strict: true });

  const existing = await repo.findBySlug(slug);
  if (existing) throw new AppError(409, 'SLUG_EXISTS', `Slug "${slug}" đã tồn tại`);

  return repo.create({ ...input, slug, createdBy: userId });
}

export async function update(
  id: number,
  input: Record<string, unknown>,
  userId: number,
) {
  if (input.slug) {
    const existing = await repo.findBySlug(input.slug as string);
    if (existing && existing.id !== id) {
      throw new AppError(409, 'SLUG_EXISTS', `Slug "${input.slug}" đã tồn tại`);
    }
  }
  if (input.name && !input.slug) {
    input.slug = slugify(input.name as string, { lower: true, strict: true });
  }
  const updated = await repo.update(id, input, userId);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Danh mục không tồn tại');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Danh mục không tồn tại');
  return deleted;
}

export async function publishCategory(id: number, userId: number) {
  const published = await repo.publish(id, userId);
  if (!published) throw new AppError(404, 'NOT_FOUND', 'Danh mục không tồn tại');
  return published;
}

export async function reorderCategories(items: { id: number; sortOrder: number }[]) {
  return repo.reorder(items);
}
