-- 20_campaign_category_and_ledger.sql

-- Add category column to campaigns
ALTER TABLE campaigns
    ADD COLUMN category TEXT;

-- Migration: Backfill campaign categories from stories if possible
UPDATE campaigns c
SET category = s.category
FROM stories s
WHERE s.campaign_id = c.id;

-- Create ledger for pool distributions
CREATE TABLE IF NOT EXISTS donation_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL,
    distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_dist_donation_id ON donation_distributions(donation_id);
CREATE INDEX IF NOT EXISTS idx_dist_campaign_id ON donation_distributions(campaign_id);
