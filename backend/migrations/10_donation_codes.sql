-- 10_donation_codes.sql
-- Donation codes for public verification
CREATE TABLE IF NOT EXISTS donation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    donation_id UUID NOT NULL UNIQUE REFERENCES donations(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_display_name TEXT NOT NULL DEFAULT 'Anonymous',
    amount NUMERIC(14,2) NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'UNKNOWN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donation_codes_code ON donation_codes(code);
CREATE INDEX IF NOT EXISTS idx_donation_codes_donation_id ON donation_codes(donation_id);

-- Add donor_name to donations for display in history
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_name TEXT;

-- Backfill donation_codes for existing donations that have tracking_code
INSERT INTO donation_codes (code, donation_id, campaign_id, donor_display_name, amount, gateway)
SELECT 
    d.tracking_code,
    d.id,
    d.campaign_id,
    COALESCE(u.name, 'Anonymous'),
    d.amount,
    CASE WHEN d.gateway_transaction_id IS NOT NULL THEN 'ESEWA/KHALTI' ELSE 'UNKNOWN' END
FROM donations d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.tracking_code IS NOT NULL
ON CONFLICT (code) DO NOTHING;
