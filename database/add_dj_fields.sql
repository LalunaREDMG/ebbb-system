-- Add DJ-specific fields to announcements table
ALTER TABLE announcements 
ADD COLUMN announcement_type VARCHAR(20) DEFAULT 'general' CHECK (announcement_type IN ('general', 'dj_event')),
ADD COLUMN dj_name VARCHAR(255),
ADD COLUMN event_date DATE,
ADD COLUMN event_start_time TIME,
ADD COLUMN event_end_time TIME,
ADD COLUMN venue_details TEXT,
ADD COLUMN ticket_price DECIMAL(10,2),
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_announcements_type ON announcements(announcement_type);
CREATE INDEX idx_announcements_event_date ON announcements(event_date);
CREATE INDEX idx_announcements_featured ON announcements(is_featured);

-- Update existing announcements to have general type
UPDATE announcements SET announcement_type = 'general' WHERE announcement_type IS NULL;