-- Migration: Add is_signature flag to products
-- Description: Marks products to feature as Signature Dishes

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_signature BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.is_signature IS 'If true, product is featured as a Signature Dish';


