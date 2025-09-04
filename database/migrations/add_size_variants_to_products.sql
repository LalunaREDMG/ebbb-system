-- Migration: Add size_variants column to products table
-- Description: Stores optional size-based pricing (e.g., Small/Large) mainly for All Day Coffee

ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_variants JSONB;

-- Optional: add a check to ensure the JSON structure keys are limited to Small/Large if provided
-- This is a soft check via comment, not enforced strictly to allow future flexibility
COMMENT ON COLUMN products.size_variants IS 'Optional JSON structure for size-based pricing, e.g. {"Small": 2.50, "Large": 3.00}';


