import type { PoolClient } from 'pg';
import type { PublicAccess, PublicSessionUser } from './middleware';

export interface PublicUserRow {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  status: 'active' | 'disabled';
}

export async function lockGoogleEmail(client: PoolClient, email: string) {
  await client.query(
    `SELECT pg_advisory_xact_lock(hashtext('konnit:google:' || lower($1)))`,
    [email],
  );
}

export async function findIdentity(
  client: PoolClient,
  providerSubject: string,
): Promise<PublicUserRow | null> {
  const { rows } = await client.query<PublicUserRow>(
    `SELECT u.id, u.email, u.full_name, u.avatar_url, u.email_verified, u.status
     FROM auth_identities ai
     JOIN users u ON u.id = ai.user_id
     WHERE ai.provider = 'google'
       AND ai.provider_subject = $1
       AND u.is_deleted = false`,
    [providerSubject],
  );
  return rows[0] ?? null;
}

export async function findUserByEmailForUpdate(
  client: PoolClient,
  email: string,
): Promise<PublicUserRow | null> {
  const { rows } = await client.query<PublicUserRow>(
    `SELECT id, email, full_name, avatar_url, email_verified, status
     FROM users
     WHERE lower(email) = lower($1) AND is_deleted = false
     FOR UPDATE`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(
  client: PoolClient,
  userId: number,
): Promise<PublicUserRow | null> {
  const { rows } = await client.query<PublicUserRow>(
    `SELECT id, email, full_name, avatar_url, email_verified, status
     FROM users
     WHERE id = $1 AND is_deleted = false`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function insertUser(
  client: PoolClient,
  input: { email: string; fullName?: string; avatarUrl?: string },
): Promise<PublicUserRow> {
  const { rows } = await client.query<PublicUserRow>(
    `INSERT INTO users (email, full_name, avatar_url, email_verified)
     VALUES ($1, $2, $3, true)
     RETURNING id, email, full_name, avatar_url, email_verified, status`,
    [input.email, input.fullName ?? null, input.avatarUrl ?? null],
  );
  return rows[0];
}

export async function insertIdentity(
  client: PoolClient,
  userId: number,
  providerSubject: string,
  email: string,
) {
  await client.query(
    `INSERT INTO auth_identities (user_id, provider, provider_subject, provider_email)
     VALUES ($1, 'google', $2, $3)
     ON CONFLICT (provider, provider_subject) DO NOTHING`,
    [userId, providerSubject, email],
  );
}

export async function assignCustomerRole(client: PoolClient, userId: number) {
  await client.query(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT $1, id FROM roles WHERE key = 'customer' AND realm = 'public'
     ON CONFLICT DO NOTHING`,
    [userId],
  );

  const role = await client.query(
    `SELECT 1 FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = $1 AND r.key = 'customer'`,
    [userId],
  );
  if (!role.rowCount) throw new Error('Customer role has not been seeded');
}

export async function claimGuestOrders(
  client: PoolClient,
  userId: number,
  email: string,
) {
  const result = await client.query(
    `UPDATE orders
     SET user_id = $1, updated_at = now()
     WHERE user_id IS NULL
       AND lower(contact_email) = lower($2)
       AND is_deleted = false`,
    [userId, email],
  );
  return result.rowCount ?? 0;
}

export async function touchLogin(
  client: PoolClient,
  userId: number,
  input: { fullName?: string; avatarUrl?: string },
) {
  await client.query(
    `UPDATE users
     SET last_login_at = now(),
         full_name = COALESCE($2, full_name),
         avatar_url = COALESCE($3, avatar_url),
         email_verified = true,
         updated_at = now()
     WHERE id = $1`,
    [userId, input.fullName ?? null, input.avatarUrl ?? null],
  );
}

export async function loadUserAccess(
  client: PoolClient,
  userId: number,
): Promise<PublicAccess> {
  const { rows } = await client.query<{
    role_key: string;
    permission_key: string | null;
  }>(
    `SELECT r.key AS role_key, p.key AS permission_key
     FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id AND r.realm = 'public'
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.user_id = $1
     ORDER BY r.key, p.key`,
    [userId],
  );

  return {
    roles: [...new Set(rows.map((row) => row.role_key))],
    permissions: [
      ...new Set(
        rows
          .map((row) => row.permission_key)
          .filter((key): key is string => Boolean(key)),
      ),
    ],
  };
}

export function toSessionUser(user: PublicUserRow): PublicSessionUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    emailVerified: user.email_verified,
  };
}
