-- Clean up duplicate settings
-- Run this in your Supabase SQL Editor

-- First, let's see what duplicates we have
SELECT 'Current settings before cleanup:' as info;
SELECT setting_key, setting_value, category FROM app_settings ORDER BY setting_key;

-- Remove duplicate settings (keep the ones with category prefixes)
DELETE FROM app_settings WHERE setting_key IN (
  'restaurant_name',
  'timezone', 
  'language',
  'theme',
  'primary_color',
  'session_timeout_hours',
  'require_password_change_days',
  'enable_2fa',
  'notify_new_reservations',
  'notify_order_updates',
  'notify_system_alerts'
);

-- Verify the cleanup
SELECT 'Settings after cleanup:' as info;
SELECT setting_key, setting_value, category FROM app_settings ORDER BY setting_key;

-- Ensure we have all the correct settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
-- General Settings
('general_restaurant_name', '"EBBB Restaurant"', 'string', 'Restaurant name displayed throughout the application', 'general', true),
('general_timezone', '"UTC+8"', 'string', 'Default timezone for the application', 'general', true),
('general_language', '"en"', 'string', 'Default language for the application', 'general', true),

-- Security Settings
('security_session_timeout_hours', '24', 'number', 'Session timeout in hours', 'security', false),
('security_require_password_change_days', '90', 'number', 'Days before requiring password change', 'security', false),
('security_enable_2fa', 'true', 'boolean', 'Enable two-factor authentication', 'security', false),

-- Notification Settings
('notifications_notify_new_reservations', 'true', 'boolean', 'Send notifications for new reservations', 'notifications', false),
('notifications_notify_order_updates', 'true', 'boolean', 'Send notifications for order status updates', 'notifications', false),
('notifications_notify_system_alerts', 'false', 'boolean', 'Send system maintenance alerts', 'notifications', false),

-- Appearance Settings
('appearance_theme', '"light"', 'string', 'Application theme (light/dark/auto)', 'appearance', true),
('appearance_primary_color', '"orange"', 'string', 'Primary color theme', 'appearance', true)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Final verification
SELECT 'Final settings count:' as info;
SELECT COUNT(*) as total_settings FROM app_settings;

SELECT 'Settings by category:' as info;
SELECT category, COUNT(*) as count FROM app_settings GROUP BY category ORDER BY category;

SELECT 'All settings:' as info;
SELECT setting_key, setting_value, category FROM app_settings ORDER BY category, setting_key; 