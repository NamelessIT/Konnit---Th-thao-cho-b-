import slugify from 'slugify';
import * as repo from './pages.repository';
import { AppError } from '../../../middleware/errorHandler';

export async function list(categoryId?: number) {
  return repo.findAll(categoryId);
}

export async function getById(id: number) {
  const page = await repo.findById(id);
  if (!page) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');
  return page;
}

export async function getWithSections(id: number) {
  const page = await repo.findWithSections(id);
  if (!page) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');
  return page;
}

export async function create(
  input: {
    categoryId: number;
    title: string;
    slug?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
  },
  userId: number,
) {
  const slug = input.slug || slugify(input.title, { lower: true, strict: true });

  const existing = await repo.findBySlugInCategory(input.categoryId, slug);
  if (existing) {
    throw new AppError(409, 'SLUG_EXISTS', `Slug "${slug}" đã tồn tại trong danh mục này`);
  }

  return repo.create({ ...input, slug, createdBy: userId });
}

export async function update(
  id: number,
  input: Record<string, unknown>,
  userId: number,
) {
  const page = await repo.findById(id);
  if (!page) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');

  const categoryId = (input.categoryId as number) ?? page.category_id;
  if (input.slug) {
    const existing = await repo.findBySlugInCategory(categoryId, input.slug as string);
    if (existing && existing.id !== id) {
      throw new AppError(409, 'SLUG_EXISTS', `Slug "${input.slug}" đã tồn tại trong danh mục này`);
    }
  }
  if (input.title && !input.slug) {
    input.slug = slugify(input.title as string, { lower: true, strict: true });
  }
  const updated = await repo.update(id, input, userId);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');
  return deleted;
}

export async function publishPage(id: number, userId: number) {
  const published = await repo.publish(id, userId);
  if (!published) throw new AppError(404, 'NOT_FOUND', 'Trang không tồn tại');
  return published;
}
