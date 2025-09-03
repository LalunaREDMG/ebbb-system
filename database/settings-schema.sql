-- Settings and User Preferences Database Schema
-- Run this in your Supabase SQL Editor

-- Application Settings table
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

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Insert default application settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
-- General Settings
('restaurant_name', '"EBBB Restaurant"', 'string', 'Restaurant name displayed throughout the application', 'general', true),
('timezone', '"UTC+8"', 'string', 'Default timezone for the application', 'general', true),
('language', '"en"', 'string', 'Default language for the application', 'general', true),

-- Security Settings
('session_timeout_hours', '24', 'number', 'Session timeout in hours', 'security', false),
('require_password_change_days', '90', 'number', 'Days before requiring password change', 'security', false),
('enable_2fa', 'true', 'boolean', 'Enable two-factor authentication', 'security', false),

-- Notification Settings
('notify_new_reservations', 'true', 'boolean', 'Send notifications for new reservations', 'notifications', false),
('notify_order_updates', 'true', 'boolean', 'Send notifications for order status updates', 'notifications', false),
('notify_system_alerts', 'false', 'boolean', 'Send system maintenance alerts', 'notifications', false),

-- Appearance Settings
('theme', '"light"', 'string', 'Application theme (light/dark/auto)', 'appearance', true),
('primary_color', '"orange"', 'string', 'Primary color theme', 'appearance', true),

-- System Settings
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'system', false),
('debug_mode', 'false', 'boolean', 'Enable debug mode', 'system', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_public ON app_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public can view public settings" ON app_settings;
DROP POLICY IF EXISTS "Admin can manage all settings" ON app_settings;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- Public settings can be read by anyone
CREATE POLICY "Public can view public settings" ON app_settings
  FOR SELECT USING (is_public = true);

-- Admins can manage all settings
CREATE POLICY "Admin can manage all settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_token = current_setting('app.current_session_token', true)::text
      AND expires_at > NOW()
    )
  );

-- Users can manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (
    user_id IN (
      SELECT user_id FROM admin_sessions 
      WHERE session_token = current_setting('app.current_session_token', true)::text
      AND expires_at > NOW()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

-- Helper function to get setting value
CREATE OR REPLACE FUNCTION get_setting(setting_key_param VARCHAR)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT setting_value INTO result
  FROM app_settings
  WHERE setting_key = setting_key_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Helper function to set setting value
CREATE OR REPLACE FUNCTION set_setting(setting_key_param VARCHAR, setting_value_param JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO app_settings (setting_key, setting_value)
  VALUES (setting_key_param, setting_value_param)
  ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = setting_value_param,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 