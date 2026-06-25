import { query } from '../../../config/db';

export async function findAllTemplates() {
  const { rows } = await query(
    `SELECT * FROM cms_component_templates WHERE is_deleted = false ORDER BY type_key`,
  );
  return rows;
}

export async function findAllStyles() {
  const { rows } = await query(
    `SELECT s.*, t.type_key
     FROM cms_component_styles s
     JOIN cms_component_templates t ON t.id = s.template_id
     WHERE s.is_deleted = false AND t.is_deleted = false
     ORDER BY t.type_key, s.style_key`,
  );
  return rows;
}

export async function findTemplatesWithStyles() {
  const templates = await findAllTemplates();
  const styles = await findAllStyles();

  return templates.map((t) => ({
    ...t,
    styles: styles.filter((s) => s.template_id === t.id),
  }));
}
