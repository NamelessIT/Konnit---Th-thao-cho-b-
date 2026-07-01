-- Logo thương hiệu: URL ảnh lưu trong app_settings
INSERT INTO app_settings (key, value)
VALUES ('logo', '{"url":null}')
ON CONFLICT (key) DO NOTHING;
