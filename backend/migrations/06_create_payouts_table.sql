-- 06_create_payouts_table.sql
CREATE TYPE payout_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'PENDING',
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder_name TEXT NOT NULL,
    remarks TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payouts_campaign_id ON payouts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payouts_organizer_id ON payouts(organizer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
