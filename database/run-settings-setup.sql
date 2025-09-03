-- Run Settings Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor

-- First, run the settings schema
-- database/settings-schema.sql

-- Or if the above doesn't work, copy the content from settings-schema.sql directly
-- and paste it here, then run this script.

-- After running, you should see:
-- 1. app_settings table created with default values
-- 2. user_preferences table created
-- 3. RLS policies configured
-- 4. Helper functions created

-- You can verify the setup by running:
SELECT * FROM app_settings ORDER BY category, setting_key; 