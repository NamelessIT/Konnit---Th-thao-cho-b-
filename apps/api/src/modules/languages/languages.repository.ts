import { query, withTransaction } from '../../config/db';

export interface LanguageRow {
  id: number;
  code: string;
  name: string;
  native_name: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function findAll(): Promise<LanguageRow[]> {
  const { rows } = await query(
    `SELECT * FROM languages ORDER BY sort_order, id`,
  );
  return rows as LanguageRow[];
}

export async function findActive(): Promise<LanguageRow[]> {
  const { rows } = await query(
    `SELECT * FROM languages WHERE is_active = true ORDER BY sort_order, id`,
  );
  return rows as LanguageRow[];
}

export async function findById(id: number): Promise<LanguageRow | null> {
  const { rows } = await query(`SELECT * FROM languages WHERE id = $1`, [id]);
  return (rows[0] as LanguageRow) ?? null;
}

export async function findByCode(code: string): Promise<LanguageRow | null> {
  const { rows } = await query(`SELECT * FROM languages WHERE code = $1`, [code]);
  return (rows[0] as LanguageRow) ?? null;
}

export async function create(data: Record<string, unknown>): Promise<LanguageRow> {
  const { rows } = await query(
    `INSERT INTO languages (code, name, native_name, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      data.code,
      data.name,
      data.nativeName ?? null,
      data.isActive ?? true,
      data.sortOrder ?? 0,
    ],
  );
  return rows[0] as LanguageRow;
}

const UPDATABLE: Record<string, string> = {
  name: 'name',
  nativeName: 'native_name',
  isActive: 'is_active',
  sortOrder: 'sort_order',
};

export async function update(
  id: number,
  data: Record<string, unknown>,
): Promise<LanguageRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    const col = UPDATABLE[key];
    if (!col) continue;
    fields.push(`${col} = $${idx}`);
    values.push(val);
    idx++;
  }
  if (fields.length === 0) return findById(id);
  fields.push(`updated_at = now()`);
  values.push(id);
  const { rows } = await query(
    `UPDATE languages SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return (rows[0] as LanguageRow) ?? null;
}

export async function remove(id: number): Promise<LanguageRow | null> {
  const { rows } = await query(`DELETE FROM languages WHERE id = $1 RETURNING *`, [id]);
  return (rows[0] as LanguageRow) ?? null;
}

/** Đặt ngôn ngữ mặc định: clear default cũ + set mới trong 1 transaction. */
export async function setDefault(id: number): Promise<LanguageRow | null> {
  return withTransaction(async (client) => {
    await client.query(`UPDATE languages SET is_default = false WHERE is_default = true`);
    const { rows } = await client.query(
      `UPDATE languages
       SET is_default = true, is_active = true, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id],
    );
    return (rows[0] as LanguageRow) ?? null;
  });
}
