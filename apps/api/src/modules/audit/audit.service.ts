import { Request } from 'express';
import { query } from '../../config/db';

export async function log(opts: {
  actorId: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  before?: unknown;
  after?: unknown;
  req?: Request;
}) {
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      opts.actorId,
      opts.action,
      opts.entityType,
      opts.entityId ?? null,
      opts.before ? JSON.stringify(opts.before) : null,
      opts.after ? JSON.stringify(opts.after) : null,
      opts.req?.ip ?? null,
      opts.req?.get('user-agent') ?? null,
    ],
  );
}
