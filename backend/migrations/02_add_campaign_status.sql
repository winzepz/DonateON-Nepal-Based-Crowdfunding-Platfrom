-- Campaign Status Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE campaign_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END$$;

-- Add status column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS status campaign_status NOT NULL DEFAULT 'PENDING';

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
