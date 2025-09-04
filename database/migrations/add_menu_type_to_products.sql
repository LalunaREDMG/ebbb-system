-- Migration: Add menu_type column to products table
-- Date: 2024-12-19
-- Description: Add menu_type column to support Morning Menu, Night Menu, and All Day Coffee categorization

-- Add menu_type column to products table
ALTER TABLE products 
ADD COLUMN menu_type VARCHAR(50) CHECK (menu_type IN ('Morning Menu', 'Night Menu', 'All Day Coffee'));

-- Add index for better performance on menu_type queries
CREATE INDEX idx_products_menu_type ON products(menu_type);

-- Update existing products with default menu types based on category
-- This is a one-time data migration for existing records
UPDATE products 
SET menu_type = CASE 
  WHEN category IN ('Panini', 'Sandwiches', 'Breakfast') THEN 'Morning Menu'
  WHEN category IN ('Burgers', 'Mains', 'Entrees') THEN 'Night Menu'
  WHEN category IN ('Coffee', 'Drinks', 'Beverages', 'Smoothies') THEN 'All Day Coffee'
  ELSE 'All Day Coffee' -- Default fallback
END
WHERE menu_type IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN products.menu_type IS 'Menu type categorization: Morning Menu (6AM-2PM), Night Menu (4PM-9PM), All Day Coffee (anytime)';

-- Verify the migration
SELECT 
  menu_type,
  COUNT(*) as product_count,
  STRING_AGG(DISTINCT category, ', ') as categories
FROM products 
GROUP BY menu_type
ORDER BY menu_type;