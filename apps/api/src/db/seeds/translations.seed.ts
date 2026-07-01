import { PoolClient } from 'pg';
import { logger } from '../../utils/logger';
import translations from '../translation_en.json';

export async function seedTranslations(client: PoolClient) {
  const query = `
    INSERT INTO translations (module, entity_id, field, locale, value, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (module, entity_id, field, locale) DO UPDATE SET
      value = $5,
      updated_at = NOW();
  `;

  for (const translation of translations) {
    await client.query(query, [
      translation.module,
      translation.entity_id,
      translation.field,
      translation.locale,
      translation.value,
    ]);
  }

  logger.info(`Seeded ${translations.length} translations`);
}
