import { query } from '../../config/db';

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: string;
  status: string;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await query(
    `SELECT id, email, password_hash, full_name, role, status
     FROM admin_users
     WHERE email = $1 AND is_deleted = false`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: number): Promise<UserRow | null> {
  const { rows } = await query(
    `SELECT id, email, password_hash, full_name, role, status
     FROM admin_users
     WHERE id = $1 AND is_deleted = false`,
    [id],
  );
  return rows[0] ?? null;
}
