import { query } from '../../config/db';

export async function findAll() {
  const { rows } = await query(
    `SELECT * FROM vouchers WHERE is_deleted = false ORDER BY created_at DESC`,
  );
  return rows;
}

export async function findById(id: number) {
  const { rows } = await query(
    `SELECT * FROM vouchers WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findByCode(code: string) {
  const { rows } = await query(
    `SELECT * FROM vouchers WHERE upper(code) = upper($1) AND is_deleted = false`,
    [code],
  );
  return rows[0] ?? null;
}

export async function create(data: Record<string, unknown>, createdBy: number) {
  const { rows } = await query(
    `INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount,
                           max_uses, starts_at, expires_at, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      String(data.code).toUpperCase(), data.description ?? null, data.discountType, data.discountValue,
      data.minOrderAmount ?? 0, data.maxUses ?? null, data.startsAt ?? null, data.expiresAt ?? null,
      data.status ?? 'active', createdBy,
    ],
  );
  return rows[0];
}

export async function update(id: number, data: Record<string, unknown>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    fields.push(`${col} = $${idx}`);
    values.push(key === 'code' ? String(val).toUpperCase() : val);
    idx++;
  }
  fields.push(`updated_at = now()`);
  values.push(id);
  const { rows } = await query(
    `UPDATE vouchers SET ${fields.join(', ')} WHERE id = $${idx} AND is_deleted = false RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE vouchers SET is_deleted = true, updated_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0] ?? null;
}
