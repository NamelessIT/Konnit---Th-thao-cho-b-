UPDATE cms_sections
SET content_json = jsonb_set(
  COALESCE(content_json, '{}'::jsonb),
  '{photos}',
  jsonb_build_array(content_json ->> 'image'),
  true
)
WHERE component_type = 'image_text'
  AND style_variant = 'style_5'
  AND NULLIF(BTRIM(content_json ->> 'image'), '') IS NOT NULL
  AND CASE
    WHEN jsonb_typeof(content_json -> 'photos') = 'array'
      THEN jsonb_array_length(content_json -> 'photos') = 0
    ELSE true
  END;
