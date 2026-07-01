import * as repo from './languages.repository';
import { AppError } from '../../middleware/errorHandler';
import { invalidateLanguageCache } from '../../services/i18n';

export async function listAdmin() {
  return repo.findAll();
}

/** Ngôn ngữ đang bật — dùng cho public (switcher, proxy, sitemap, hreflang). */
export async function listActive() {
  return repo.findActive();
}

/** Ngôn ngữ mặc định (fallback về 'vi' nếu chưa cấu hình). */
export async function getDefaultCode(): Promise<string> {
  const all = await repo.findAll();
  return all.find((l) => l.is_default)?.code ?? 'vi';
}

export async function create(input: Record<string, unknown>) {
  const code = String(input.code).toLowerCase();
  const existing = await repo.findByCode(code);
  if (existing) throw new AppError(409, 'LANG_CODE_EXISTS', `Ngôn ngữ "${code}" đã tồn tại`);
  const created = await repo.create({ ...input, code });
  invalidateLanguageCache();
  return created;
}

export async function update(id: number, input: Record<string, unknown>) {
  const lang = await repo.findById(id);
  if (!lang) throw new AppError(404, 'NOT_FOUND', 'Ngôn ngữ không tồn tại');
  // Không cho tắt ngôn ngữ mặc định.
  if (lang.is_default && input.isActive === false) {
    throw new AppError(400, 'DEFAULT_LANG_ACTIVE', 'Không thể tắt ngôn ngữ mặc định');
  }
  const updated = await repo.update(id, input);
  if (!updated) throw new AppError(404, 'NOT_FOUND', 'Ngôn ngữ không tồn tại');
  invalidateLanguageCache();
  return updated;
}

export async function setDefault(id: number) {
  const lang = await repo.findById(id);
  if (!lang) throw new AppError(404, 'NOT_FOUND', 'Ngôn ngữ không tồn tại');
  const updated = await repo.setDefault(id);
  invalidateLanguageCache();
  return updated;
}

export async function remove(id: number) {
  const lang = await repo.findById(id);
  if (!lang) throw new AppError(404, 'NOT_FOUND', 'Ngôn ngữ không tồn tại');
  if (lang.is_default) {
    throw new AppError(400, 'DEFAULT_LANG_DELETE', 'Không thể xóa ngôn ngữ mặc định');
  }
  const removed = await repo.remove(id);
  invalidateLanguageCache();
  return removed;
}
