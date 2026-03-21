-- 11_production_payment_hardening.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE donations ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_gateway TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE donations
SET currency = COALESCE(currency, 'NPR'),
    payment_gateway = COALESCE(
        payment_gateway,
        CASE
            WHEN gateway_transaction_id IS NOT NULL THEN 'ESEWA'
            ELSE 'UNKNOWN'
        END
    ),
    payment_status = COALESCE(payment_status, 'SUCCEEDED'),
    updated_at = COALESCE(updated_at, created_at, NOW());

ALTER TABLE donations ALTER COLUMN currency SET DEFAULT 'NPR';
ALTER TABLE donations ALTER COLUMN currency SET NOT NULL;
ALTER TABLE donations ALTER COLUMN payment_gateway SET DEFAULT 'UNKNOWN';
ALTER TABLE donations ALTER COLUMN payment_gateway SET NOT NULL;
ALTER TABLE donations ALTER COLUMN payment_status SET DEFAULT 'SUCCEEDED';
ALTER TABLE donations ALTER COLUMN payment_status SET NOT NULL;
ALTER TABLE donations ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE donations ALTER COLUMN updated_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_idempotency_key
ON donations(idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_successful_campaign_created
ON donations(campaign_id, created_at DESC)
WHERE payment_status = 'SUCCEEDED';

CREATE INDEX IF NOT EXISTS idx_donations_successful_user_created
ON donations(user_id, created_at DESC)
WHERE payment_status = 'SUCCEEDED';

CREATE OR REPLACE FUNCTION set_row_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_donations_set_updated_at ON donations;
CREATE TRIGGER trg_donations_set_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION set_row_updated_at();

ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'LEGACY';
ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'LEGACY';
ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL UNIQUE REFERENCES donations(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL,
    gateway_reference TEXT,
    gateway_transaction_id TEXT,
    gateway_redirect_url TEXT,
    gateway_status TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    amount NUMERIC(14,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NPR',
    request_payload JSONB,
    response_payload JSONB,
    verified_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_gateway_reference
ON payment_transactions(gateway, gateway_reference)
WHERE gateway_reference IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_gateway_txn
ON payment_transactions(gateway, gateway_transaction_id)
WHERE gateway_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
ON payment_transactions(verification_status, created_at DESC);

DROP TRIGGER IF EXISTS trg_payment_transactions_set_updated_at ON payment_transactions;
CREATE TRIGGER trg_payment_transactions_set_updated_at
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION set_row_updated_at();

CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    request_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_transaction
ON payment_logs(payment_transaction_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_logs_donation
ON payment_logs(donation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL,
    dedupe_key TEXT NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    headers JSONB,
    verification_status TEXT NOT NULL DEFAULT 'RECEIVED',
    processing_status TEXT NOT NULL DEFAULT 'RECEIVED',
    error_message TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway_received
ON webhook_events(gateway, received_at DESC);

CREATE TABLE IF NOT EXISTS payout_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(14,2) NOT NULL CHECK (allocated_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_allocations_payout
ON payout_allocations(payout_id);

CREATE INDEX IF NOT EXISTS idx_payout_allocations_donation
ON payout_allocations(donation_id);

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS table_name VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS record_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB;

UPDATE audit_logs
SET action = COALESCE(action, 'LEGACY_EVENT'),
    entity_type = COALESCE(entity_type, table_name, 'LEGACY'),
    entity_id = COALESCE(entity_id, record_id),
    created_at = COALESCE(created_at, NOW());

ALTER TABLE audit_logs ALTER COLUMN action SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN entity_type SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION update_campaign_total()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status <> 'SUCCEEDED' AND NEW.payment_status = 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCEEDED' AND NEW.payment_status <> 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount - COALESCE(OLD.amount, 0)
        WHERE id = NEW.campaign_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCEEDED' AND NEW.payment_status = 'SUCCEEDED' AND OLD.amount <> NEW.amount) THEN
        UPDATE campaigns
        SET current_amount = current_amount - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_campaign_total ON donations;
CREATE TRIGGER trg_update_campaign_total
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_total();

UPDATE campaigns c
SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM donations d
    WHERE d.campaign_id = c.id
      AND d.payment_status = 'SUCCEEDED'
);
