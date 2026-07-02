import { PoolClient } from 'pg';
import { logger } from '../../utils/logger';
import translations from '../translation_en.json';

interface SeedTranslation {
  module: string;
  entity_id: number;
  field: string;
  locale: string;
  source_value: string;
  value: string;
}

const SOURCE_MODULES: Record<string, { table: string; fields: string[]; where?: string }> = {
  events: {
    table: 'events',
    fields: ['name', 'description', 'location'],
    where: 'is_deleted = false',
  },
  ticket_types: {
    table: 'ticket_types',
    fields: ['name', 'description', 'age_group'],
    where: 'is_deleted = false',
  },
  cms_pages: {
    table: 'cms_pages',
    fields: ['title', 'description', 'seo_title', 'seo_description'],
    where: 'is_deleted = false',
  },
  cms_sections: {
    table: 'cms_sections',
    fields: ['title', 'description', 'content_json'],
    where: 'is_deleted = false',
  },
  vouchers: {
    table: 'vouchers',
    fields: ['description'],
    where: 'is_deleted = false',
  },
};

function canonicalize(value: unknown): string {
  if (value == null) return '';
  let parsed = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  if (Array.isArray(parsed)) return `[${parsed.map(canonicalize).join(',')}]`;
  if (typeof parsed === 'object') {
    return `{${Object.entries(parsed as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(parsed);
}

async function resolveEntityIds(client: PoolClient, seedRows: SeedTranslation[]) {
  const resolved = new Map<string, number>();

  for (const [module, config] of Object.entries(SOURCE_MODULES)) {
    const moduleRows = seedRows.filter((row) => row.module === module);
    if (moduleRows.length === 0) continue;

    await client.query(
      `DELETE FROM translations translation
       WHERE translation.module = $1
         AND NOT EXISTS (
           SELECT 1 FROM ${config.table} source WHERE source.id = translation.entity_id
         )`,
      [module],
    );

    const sourceRows = await client.query(
      `SELECT id, ${config.fields.join(', ')} FROM ${config.table}${config.where ? ` WHERE ${config.where}` : ''}`,
    );
    const groups = new Map<number, SeedTranslation[]>();
    for (const row of moduleRows) {
      const group = groups.get(row.entity_id) ?? [];
      group.push(row);
      groups.set(row.entity_id, group);
    }

    for (const [seedEntityId, group] of groups) {
      const ranked = sourceRows.rows
        .map((candidate) => ({
          id: Number(candidate.id),
          score: group.filter(
            (translation) =>
              canonicalize(candidate[translation.field]) === canonicalize(translation.source_value),
          ).length,
        }))
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score);

      if (ranked.length === 0 || (ranked[1] && ranked[1].score === ranked[0].score)) {
        logger.warn({ module, seedEntityId }, 'Skipped translation seed with no unique source match');
        continue;
      }
      resolved.set(`${module}:${seedEntityId}`, ranked[0].id);
    }
  }

  return resolved;
}

export async function seedTranslations(client: PoolClient) {
  const seedRows = translations as SeedTranslation[];
  const resolvedEntityIds = await resolveEntityIds(client, seedRows);
  const query = `
    INSERT INTO translations (module, entity_id, field, locale, value, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (module, entity_id, field, locale) DO UPDATE SET
      value = $5,
      updated_at = NOW();
  `;

  let seeded = 0;
  for (const translation of seedRows) {
    const entityId =
      translation.module === 'ui'
        ? translation.entity_id
        : resolvedEntityIds.get(`${translation.module}:${translation.entity_id}`);
    if (entityId == null) continue;

    await client.query(query, [
      translation.module,
      entityId,
      translation.field,
      translation.locale,
      translation.value,
    ]);
    seeded++;
  }

  logger.info(`Seeded ${seeded}/${seedRows.length} translations`);
}
