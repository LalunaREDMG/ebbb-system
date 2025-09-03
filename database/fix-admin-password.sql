-- Fix admin user password with correct hash
-- Run this in your Supabase SQL Editor

-- First, make sure the admin user exists
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@ebbb.com', '$2b$12$P5sKIm2i6beZgQnN15ywuua1ldHX078pMtXwuj.s.heeEhwuZyAFq', 'EBBB Administrator', 'super_admin')
ON CONFLICT (username) DO UPDATE SET
  password_hash = '$2b$12$P5sKIm2i6beZgQnN15ywuua1ldHX078pMtXwuj.s.heeEhwuZyAFq',
  email = 'admin@ebbb.com',
  full_name = 'EBBB Administrator',
  role = 'super_admin',
  is_active = true;

-- Verify the admin user exists
SELECT username, email, full_name, role, is_active FROM admin_users WHERE username = 'admin'; 