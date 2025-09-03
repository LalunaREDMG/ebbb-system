-- Fix admin_sessions table to allow null values for IP and user agent
-- Run this in your Supabase SQL Editor

-- Make sure the fields are nullable
ALTER TABLE admin_sessions 
ALTER COLUMN ip_address DROP NOT NULL,
ALTER COLUMN user_agent DROP NOT NULL;

-- Verify the table structure
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_sessions' 
AND column_name IN ('ip_address', 'user_agent'); 