# Database Migrations

This directory contains database migration scripts for the EBBB system.

## How to Apply Migrations

### For Existing Databases

If you already have a database set up, run the migration script to add the menu_type column:

1. **Connect to your Supabase database** using the SQL Editor in your Supabase dashboard
2. **Run the migration script**: Copy and paste the contents of `add_menu_type_to_products.sql` into the SQL Editor and execute it

### For New Installations

If you're setting up a fresh database, simply run the main schema file which already includes the menu_type column:

1. **Connect to your Supabase database**
2. **Run the main schema**: Copy and paste the contents of `../schema.sql` into the SQL Editor and execute it

## Migration Details

### add_menu_type_to_products.sql

This migration adds:
- `menu_type` column to the `products` table
- Check constraint to ensure only valid menu types: 'Morning Menu', 'Night Menu', 'All Day Coffee'
- Index on `menu_type` for better query performance
- Updates existing products with appropriate menu types based on their categories
- Documentation comment explaining the column purpose

### Menu Type Schedule

- **Morning Menu**: 6:00 AM - 2:00 PM
- **Night Menu**: 4:00 PM - 9:00 PM  
- **All Day Coffee**: Available Anytime

## Verification

After running the migration, you can verify it worked by running:

```sql
-- Check the new column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'menu_type';

-- Check the data was migrated correctly
SELECT 
  menu_type,
  COUNT(*) as product_count,
  STRING_AGG(DISTINCT category, ', ') as categories
FROM products 
GROUP BY menu_type
ORDER BY menu_type;
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the menu_type column
ALTER TABLE products DROP COLUMN menu_type;

-- Remove the index
DROP INDEX IF EXISTS idx_products_menu_type;
```

**Note**: This will permanently delete all menu_type data, so make sure you have a backup if needed.