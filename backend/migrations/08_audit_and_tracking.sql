-- 08_audit_and_tracking.sql

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'CAMPAIGN', 'DONATION', 'KYC', 'PAYOUT', 'USER'
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add tracking fields to donations
ALTER TABLE donations ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS is_released BOOLEAN DEFAULT false;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payout_id UUID REFERENCES payouts(id) ON DELETE SET NULL;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_donations_tracking_code ON donations(tracking_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
