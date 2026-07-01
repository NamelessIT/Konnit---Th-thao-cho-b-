/**
 * Dump toàn bộ database (mọi bảng public) ra 1 file JSON.
 * Usage: pnpm --filter @konnit/api db:snap [outputPath]
 * Default output: <repo>/docs/db-snapshot.json
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../config/db';
import { logger } from '../utils/logger';

async function snap() {
  const outArg = process.argv[2];
  const outPath = outArg
    ? path.resolve(process.cwd(), outArg)
    : path.resolve(__dirname, '../../../../docs/db-snapshot.json');

  const client = await pool.connect();
  try {
    // Danh sách bảng public (trừ bảng session — dữ liệu phiên, không cần).
    const { rows: tables } = await client.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    );

    const snapshot: Record<string, { count: number; rows: unknown[] }> = {};
    for (const { table_name } of tables) {
      if (table_name === 'session') continue;
      const { rows } = await client.query(`SELECT * FROM "${table_name}"`);
      snapshot[table_name] = { count: rows.length, rows };
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');

    const summary = Object.entries(snapshot)
      .map(([t, v]) => `${t}=${v.count}`)
      .join(', ');
    logger.info(`DB snapshot đã ghi: ${outPath}`);
    logger.info(`Bảng: ${summary}`);
  } finally {
    client.release();
    await pool.end();
  }
}

snap().catch((error) => {
  logger.error(error, 'DB snapshot failed');
  process.exit(1);
});
