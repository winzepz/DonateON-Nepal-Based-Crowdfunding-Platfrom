-- Add is_anonymous column to donations table
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_donations_is_anonymous ON donations(is_anonymous);
