
-- Create table for Premium Access Configuration
CREATE TABLE IF NOT EXISTS mz_premium_access_config (
    id TEXT PRIMARY KEY DEFAULT 'global-config',
    is_enabled BOOLEAN DEFAULT true,
    reopening_date TEXT DEFAULT 'Dimanche 17 mars',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config if not exists
INSERT INTO mz_premium_access_config (id, is_enabled, reopening_date)
VALUES ('global-config', true, 'Dimanche 17 mars')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE mz_premium_access_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on mz_premium_access_config"
ON mz_premium_access_config FOR SELECT
TO public
USING (true);

-- Allow authenticated users to update (admin check should be done via logic or more specific RLS)
CREATE POLICY "Allow authenticated users to update mz_premium_access_config"
ON mz_premium_access_config FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
