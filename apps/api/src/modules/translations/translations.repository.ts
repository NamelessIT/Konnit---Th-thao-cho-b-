import { query, withTransaction } from '../../config/db';
import { TRANSLATABLE_MODULES } from './translations.constants';

export interface TranslationRow {
  id: number;
  module: string;
  entity_id: number;
  field: string;
  locale: string;
  value: string | null;
  updated_by: number | null;
  updated_at: string;
}

export interface TranslationInput {
  module: string;
  entity_id: number;
  field: string;
  locale: string;
  value: string | null;
}

export async function find(
  module: string,
  entityId?: number,
  locale?: string,
): Promise<TranslationRow[]> {
  const conditions = ['module = $1'];
  const params: unknown[] = [module];
  let idx = 2;
  if (entityId != null) {
    conditions.push(`entity_id = $${idx++}`);
    params.push(entityId);
  }
  if (locale) {
    conditions.push(`locale = $${idx++}`);
    params.push(locale);
  }
  const { rows } = await query(
    `SELECT * FROM translations WHERE ${conditions.join(' AND ')} ORDER BY entity_id, field`,
    params,
  );
  return rows as TranslationRow[];
}

/** Upsert nhiều bản dịch trong 1 transaction. Trả về số dòng thêm mới / cập nhật. */
export async function upsertMany(
  entries: TranslationInput[],
  adminId: number,
): Promise<{ inserted: number; updated: number }> {
  if (entries.length === 0) return { inserted: 0, updated: 0 };
  return withTransaction(async (client) => {
    let inserted = 0;
    let updated = 0;
    for (const e of entries) {
      const { rows } = await client.query(
        `INSERT INTO translations (module, entity_id, field, locale, value, updated_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())
         ON CONFLICT (module, entity_id, field, locale) DO UPDATE
         SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()
         RETURNING (xmax = 0) AS is_insert`,
        [e.module, e.entity_id, e.field, e.locale, e.value, adminId],
      );
      if (rows[0]?.is_insert) inserted++;
      else updated++;
    }
    return { inserted, updated };
  });
}

/** Lấy các row nguồn (id + field gốc) của một module để xuất template dịch. */
export async function fetchSourceRows(
  module: string,
): Promise<Array<Record<string, unknown> & { id: number }>> {
  const meta = TRANSLATABLE_MODULES[module];
  const cols = ['id', ...meta.fields].join(', ');
  const where = meta.where ? `WHERE ${meta.where}` : '';
  const { rows } = await query(`SELECT ${cols} FROM ${meta.table} ${where} ORDER BY id`);
  return rows as Array<Record<string, unknown> & { id: number }>;
}
