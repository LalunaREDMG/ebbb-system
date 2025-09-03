-- Fix for infinite recursion in RLS policies
-- This script should be run in your Supabase SQL editor

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Admin can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Admin can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin can manage admin_sessions" ON admin_sessions;

-- Create simplified storage policies (no session check for now)
CREATE POLICY "Admin can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload announcement images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'announcement-images');

CREATE POLICY "Admin can update announcement images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'announcement-images');

CREATE POLICY "Admin can delete announcement images" ON storage.objects
  FOR DELETE USING (bucket_id = 'announcement-images');

-- Create simplified table policies (allow all operations for now)
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (true);

CREATE POLICY "Admin can manage announcements" ON announcements
  FOR ALL USING (true);

CREATE POLICY "Admin can manage reservations" ON reservations
  FOR ALL USING (true);

CREATE POLICY "Admin can manage admin_users" ON admin_users
  FOR ALL USING (true);

CREATE POLICY "Admin can manage admin_sessions" ON admin_sessions
  FOR ALL USING (true); 