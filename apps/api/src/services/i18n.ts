/**
 * i18n resolution — overlay bản dịch (bảng `translations`) lên dữ liệu entity.
 *
 * Quy ước: ngôn ngữ mặc định lấy từ cột gốc của bảng entity; bảng `translations`
 * chỉ chứa các locale khác (và override tùy chọn). Với locale mặc định hoặc rỗng
 * → trả nguyên rows, không truy vấn.
 */
import { query } from '../config/db';

interface LangCacheEntry {
  codes: string[];
  defaultCode: string;
  expiresAt: number;
}

let cache: LangCacheEntry | null = null;
const TTL_MS = 60_000;

async function loadLanguages(): Promise<LangCacheEntry> {
  if (cache && cache.expiresAt > Date.now()) return cache;
  const { rows } = await query(
    `SELECT code, is_default FROM languages WHERE is_active = true ORDER BY sort_order, id`,
  );
  const codes = rows.map((r) => r.code as string);
  const defaultCode = (rows.find((r) => r.is_default)?.code as string) ?? codes[0] ?? 'vi';
  cache = { codes, defaultCode, expiresAt: Date.now() + TTL_MS };
  return cache;
}

/** Xoá cache — gọi sau khi CRUD ngôn ngữ. */
export function invalidateLanguageCache() {
  cache = null;
}

export async function getActiveLocales(): Promise<string[]> {
  return (await loadLanguages()).codes;
}

export async function getDefaultLocale(): Promise<string> {
  return (await loadLanguages()).defaultCode;
}

/**
 * Chuẩn hoá locale từ query/param: hợp lệ (đang bật) thì giữ, ngược lại fallback mặc định.
 */
export async function resolveLocale(raw: unknown): Promise<string> {
  const { codes, defaultCode } = await loadLanguages();
  const code = typeof raw === 'string' ? raw.toLowerCase() : '';
  return codes.includes(code) ? code : defaultCode;
}

type Row = Record<string, unknown> & { id: number };

/**
 * Overlay bản dịch lên một mảng rows.
 * @param module   khoá module ('events','ticket_types','cms_pages','cms_sections','vouchers')
 * @param locale   locale đã resolve
 * @param rows     danh sách entity (mỗi row cần có `id`)
 * @param fields   các field cần dịch (vd ['name','description'] hoặc ['content_json'])
 */
export async function applyTranslations<T extends Row>(
  module: string,
  locale: string,
  rows: T[],
  fields: string[],
): Promise<T[]> {
  if (rows.length === 0) return rows;
  const defaultCode = await getDefaultLocale();
  if (!locale || locale === defaultCode) return rows;

  const ids = rows.map((r) => r.id);
  const { rows: trans } = await query(
    `SELECT entity_id, field, value
     FROM translations
     WHERE module = $1 AND locale = $2 AND entity_id = ANY($3::int[])`,
    [module, locale, ids],
  );
  if (trans.length === 0) return rows;

  // map: entity_id -> field -> value
  const byId = new Map<number, Map<string, string>>();
  for (const t of trans) {
    const eid = t.entity_id as number;
    if (!byId.has(eid)) byId.set(eid, new Map());
    byId.get(eid)!.set(t.field as string, t.value as string);
  }

  return rows.map((row) => {
    const fieldMap = byId.get(row.id);
    if (!fieldMap) return row;
    const next: Row = { ...row };
    for (const field of fields) {
      const val = fieldMap.get(field);
      if (val == null || val === '') continue;
      if (field === 'content_json') {
        try {
          next[field] = JSON.parse(val);
        } catch {
          // giữ nguyên gốc nếu bản dịch không parse được
        }
      } else {
        next[field] = val;
      }
    }
    return next as T;
  });
}

/** Overlay cho 1 entity đơn lẻ. */
export async function applyTranslationsOne<T extends Row>(
  module: string,
  locale: string,
  row: T | null,
  fields: string[],
): Promise<T | null> {
  if (!row) return row;
  const [translated] = await applyTranslations(module, locale, [row], fields);
  return translated ?? row;
}
