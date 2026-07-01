-- Seed cấu hình SMTP mặc định (disabled) vào app_settings
INSERT INTO app_settings (key, value)
VALUES ('smtp', '{"enabled":false,"host":"","port":587,"secure":false,"user":"","pass":"","fromName":"Konnit","fromEmail":""}')
ON CONFLICT (key) DO NOTHING;
