-- Database Migrations for E-Commerce Platform
-- Run this in your Supabase SQL Editor

-- 1. Add payment tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 2. Create shop_settings table
CREATE TABLE IF NOT EXISTS shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS for shop_settings
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view opening hours" ON shop_settings;
DROP POLICY IF EXISTS "Admin can manage settings" ON shop_settings;

-- 5. Create RLS policies for shop_settings
CREATE POLICY "Anyone can view opening hours" ON shop_settings
  FOR SELECT USING (key = 'opening_hours' OR key = 'holidays');

CREATE POLICY "Admin can manage settings" ON shop_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Insert default opening hours (only if not exists)
INSERT INTO shop_settings (key, value)
SELECT 'opening_hours', '{
  "monday": {"open": "11:00", "close": "20:00", "closed": false},
  "tuesday": {"open": "11:00", "close": "20:00", "closed": false},
  "wednesday": {"open": "11:00", "close": "20:00", "closed": false},
  "thursday": {"open": "11:00", "close": "20:00", "closed": false},
  "friday": {"open": "11:00", "close": "22:00", "closed": false},
  "saturday": {"open": "11:00", "close": "22:00", "closed": false},
  "sunday": {"open": "12:00", "close": "20:00", "closed": false}
}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM shop_settings WHERE key = 'opening_hours'
);

-- 7. Insert empty holidays array (only if not exists)
INSERT INTO shop_settings (key, value)
SELECT 'holidays', '[]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM shop_settings WHERE key = 'holidays'
);

-- Migration complete!
-- You can now verify by running:
-- SELECT * FROM shop_settings;
