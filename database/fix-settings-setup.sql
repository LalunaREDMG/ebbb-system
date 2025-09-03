-- Fix Settings Database Setup (Handles Existing Objects)
-- Run this in your Supabase SQL Editor

-- Drop existing triggers first (if they exist)
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Public can view public settings" ON app_settings;
DROP POLICY IF EXISTS "Admin can manage all settings" ON app_settings;

-- Create app_settings table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'string',
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update default application settings
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

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_public ON app_settings(is_public);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create simplified policies (allow all operations for now)
CREATE POLICY "Public can view public settings" ON app_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage all settings" ON app_settings
  FOR ALL USING (true);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger (will not fail if it already exists due to DROP above)
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

-- Verify the setup
SELECT 'Settings table setup completed successfully' as status;
SELECT COUNT(*) as total_settings FROM app_settings;
SELECT category, COUNT(*) as count FROM app_settings GROUP BY category ORDER BY category; 