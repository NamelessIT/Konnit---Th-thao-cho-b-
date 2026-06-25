import sanitizeHtml from 'sanitize-html';
import * as repo from './sections.repository';
import { AppError } from '../../../middleware/errorHandler';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'iframe']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
  },
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
};

function sanitizeContentJson(json: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(json)) {
    if (typeof val === 'string') {
      result[key] = sanitizeHtml(val, SANITIZE_OPTIONS);
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeContentJson(item as Record<string, unknown>)
          : item,
      );
    } else if (typeof val === 'object' && val !== null) {
      result[key] = sanitizeContentJson(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export async function listByPage(pageId: number) {
  return repo.findByPageId(pageId);
}

export async function getById(id: number) {
  const section = await repo.findById(id);
  if (!section) throw new AppError(404, 'NOT_FOUND', 'Section không tồn tại');
  return section;
}

export async function create(
  pageId: number,
  input: {
    templateId: number;
    styleId: number;
    componentType: string;
    styleVariant: string;
    title?: string;
    description?: string;
    contentJson?: Record<string, unknown>;
  },
  userId: number,
) {
  const maxOrder = await repo.getMaxSortOrder(pageId);
  const contentJson = input.contentJson ? sanitizeContentJson(input.contentJson) : {};

  return repo.create({
    pageId,
    ...input,
    contentJson,
    sortOrder: maxOrder + 1,
    createdBy: userId,
  });
}

export async function update(
  id: number,
  input: Record<string, unknown>,
  userId: number,
) {
  if (input.contentJson) {
    input.contentJson = sanitizeContentJson(input.contentJson as Record<string, unknown>);
  }
  const updated = await repo.update(id, input, userId);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Section không tồn tại');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.softDelete(id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Section không tồn tại');
  return deleted;
}

export async function duplicate(id: number, userId: number) {
  const original = await repo.findById(id);
  if (!original) throw new AppError(404, 'NOT_FOUND', 'Section không tồn tại');

  const maxOrder = await repo.getMaxSortOrder(original.page_id);

  return repo.create({
    pageId: original.page_id,
    templateId: original.template_id,
    styleId: original.style_id,
    componentType: original.component_type,
    styleVariant: original.style_variant,
    title: original.title ? `${original.title} (copy)` : undefined,
    description: original.description ?? undefined,
    contentJson: original.content_json ?? {},
    sortOrder: maxOrder + 1,
    createdBy: userId,
  });
}

export async function toggleVisible(id: number, userId: number) {
  const section = await repo.findById(id);
  if (!section) throw new AppError(404, 'NOT_FOUND', 'Section không tồn tại');

  return repo.update(id, { isVisible: !section.is_visible }, userId);
}

export async function reorderSections(items: { id: number; sortOrder: number }[]) {
  return repo.reorder(items);
}
