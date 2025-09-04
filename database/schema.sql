-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Storage buckets for images
-- Note: Buckets are created automatically by Supabase, but we can ensure they exist
DO $$
BEGIN
  -- Create product-images bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;
  
  -- Create announcement-images bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('announcement-images', 'announcement-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Admin Users table for authentication
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Sessions table for session management
CREATE TABLE admin_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up storage policies for public read access
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view announcement images" ON storage.objects;

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public can view announcement images" ON storage.objects
  FOR SELECT USING (bucket_id = 'announcement-images');

-- Drop existing storage policies if they exist (to handle re-runs)
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update announcement images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete announcement images" ON storage.objects;

-- Set up storage policies for admin access (simplified - no session check for now)
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

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_path TEXT, -- Store the path in the bucket for easier management
  category VARCHAR(100) NOT NULL,
  menu_type VARCHAR(50) CHECK (menu_type IN ('Morning Menu', 'Night Menu', 'All Day Coffee')),
  size_variants JSONB,
  is_signature BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_path TEXT, -- Store the path in the bucket for easier management
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_menu_type ON products(menu_type);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_announcements_published ON announcements(published);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to handle re-runs)
DROP POLICY IF EXISTS "Public can view published products" ON products;
DROP POLICY IF EXISTS "Public can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Admin can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Admin can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
DROP POLICY IF EXISTS "Admin can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin can manage admin_sessions" ON admin_sessions;

-- Create policies for public read access
CREATE POLICY "Public can view published products" ON products
  FOR SELECT USING (available = true);

CREATE POLICY "Public can view published announcements" ON announcements
  FOR SELECT USING (published = true);

-- Create policies for admin access (simplified - allow all operations for now)
-- In production, you would implement proper session-based authentication
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (true);

CREATE POLICY "Admin can manage announcements" ON announcements
  FOR ALL USING (true);

CREATE POLICY "Admin can manage reservations" ON reservations
  FOR ALL USING (true);

-- Allow public to create reservations
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Admin user management policies (simplified)
CREATE POLICY "Admin can manage admin_users" ON admin_users
  FOR ALL USING (true);

-- For admin_sessions, allow all operations to avoid infinite recursion
CREATE POLICY "Admin can manage admin_sessions" ON admin_sessions
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- In production, use a proper password hashing function
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@ebbb.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'EBBB Administrator', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample data with placeholder image paths and menu types
INSERT INTO products (name, description, price, image_path, category, menu_type, available) VALUES
('Signature Burger', 'Our famous beef burger with special sauce, lettuce, tomato, and cheese', 18.50, 'burger.jpg', 'Mains', 'Night Menu', true),
('Fish & Chips', 'Fresh local fish with crispy chips and house-made tartar sauce', 22.00, 'fish-chips.jpg', 'Mains', 'Night Menu', true),
('Caesar Salad', 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing', 16.00, 'caesar.jpg', 'Salads', 'Morning Menu', true),
('Craft Beer', 'Local Perth brewery selection', 8.50, 'beer.jpg', 'Drinks', 'All Day Coffee', true),
('Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream', 12.00, 'brownie.jpg', 'Desserts', 'Night Menu', true);

INSERT INTO announcements (title, content, published) VALUES
('Grand Opening!', 'We are excited to announce our grand opening! Join us for special opening week deals and live music every evening.', true),
('New Menu Items', 'Check out our new seasonal menu featuring fresh local ingredients and innovative dishes.', true),
('Weekend Special', 'This weekend only - 20% off all mains when you book a table for 4 or more people.', false);