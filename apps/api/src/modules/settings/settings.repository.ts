import { query } from '../../config/db';

export interface AppSettingRow<T = Record<string, unknown>> {
  key: string;
  value: T;
  updated_by: number | null;
  updated_at: string;
}

export async function get<T = Record<string, unknown>>(
  key: string,
): Promise<AppSettingRow<T> | null> {
  const { rows } = await query(`SELECT * FROM app_settings WHERE key = $1`, [key]);
  return (rows[0] as AppSettingRow<T>) ?? null;
}

export async function upsert<T = Record<string, unknown>>(
  key: string,
  value: T,
  adminId: number,
): Promise<AppSettingRow<T>> {
  const { rows } = await query(
    `INSERT INTO app_settings (key, value, updated_by, updated_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value,
         updated_by = EXCLUDED.updated_by,
         updated_at = now()
     RETURNING *`,
    [key, JSON.stringify(value), adminId],
  );
  return rows[0] as AppSettingRow<T>;
}
