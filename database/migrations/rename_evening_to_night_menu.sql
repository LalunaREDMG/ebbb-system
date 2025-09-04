-- Migration: Rename 'Evening Menu' to 'Night Menu' in products.menu_type

-- 1) Update existing rows
UPDATE products
SET menu_type = 'Night Menu'
WHERE menu_type = 'Evening Menu';

-- 2) Recreate CHECK constraint to allow 'Night Menu' instead of 'Evening Menu'
-- Drop existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage ccu
    WHERE ccu.table_name = 'products' AND ccu.column_name = 'menu_type'
  ) THEN
    -- Try to find and drop any check constraint on products.menu_type
    EXECUTE (
      SELECT 'ALTER TABLE products DROP CONSTRAINT ' || quote_ident(tc.constraint_name)
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'products'
        AND tc.constraint_type = 'CHECK'
        AND ccu.column_name = 'menu_type'
      LIMIT 1
    );
  END IF;
END$$;

-- 3) Add new constraint
ALTER TABLE products
  ADD CONSTRAINT products_menu_type_check
  CHECK (menu_type IN ('Morning Menu', 'Night Menu', 'All Day Coffee'));

-- 4) Ensure index matches expected values (optional)
DROP INDEX IF EXISTS idx_products_menu_type;
CREATE INDEX idx_products_menu_type ON products(menu_type);


