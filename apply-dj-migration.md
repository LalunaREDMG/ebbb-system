# Apply DJ Events Migration

To enable DJ events functionality, you need to run the database migration to add the new fields to your announcements table.

## Steps:

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the **SQL Editor**

### 2. Run the Migration
Copy and paste the following SQL into the SQL Editor and execute it:

```sql
-- Add DJ-specific fields to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS announcement_type VARCHAR(20) DEFAULT 'general' CHECK (announcement_type IN ('general', 'dj_event')),
ADD COLUMN IF NOT EXISTS dj_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS event_start_time TIME,
ADD COLUMN IF NOT EXISTS event_end_time TIME,
ADD COLUMN IF NOT EXISTS venue_details TEXT,
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);
CREATE INDEX IF NOT EXISTS idx_announcements_event_date ON announcements(event_date);
CREATE INDEX IF NOT EXISTS idx_announcements_featured ON announcements(is_featured);

-- Update existing announcements to have general type
UPDATE announcements SET announcement_type = 'general' WHERE announcement_type IS NULL;
```

### 3. Verify Migration
After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'announcements' 
ORDER BY ordinal_position;
```

### 4. Test DJ Events
1. Go to your admin panel: `/ebbb-admin/announcements`
2. Click "Add Announcement"
3. Select "DJ Event" from the dropdown
4. Fill in the DJ details and publish
5. Check your homepage - the DJ event should now appear!

## What This Migration Adds:
- `announcement_type`: 'general' or 'dj_event'
- `dj_name`: Name of the DJ
- `event_date`: Date of the event
- `event_start_time`: Start time
- `event_end_time`: End time
- `venue_details`: Additional venue information
- `ticket_price`: Entry price (optional)
- `is_featured`: Whether to feature prominently

Once this migration is applied, DJ events will appear on your homepage with special purple styling and all the event details!