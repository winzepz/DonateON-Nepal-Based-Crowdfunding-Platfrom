-- 1. Create payment_attempts table to track pending payments
CREATE TABLE IF NOT EXISTS payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(14,2) NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Clean up existing pending donations
DELETE FROM donations WHERE status = 'pending';

-- 3. Modify donations table
-- Note: PostgreSQL doesn't support easy DROP column if it's part of a view/trigger, 
-- but we'll try to drop it after updating the trigger.
ALTER TABLE donations ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT;

-- 4. Update the trigger function to be simpler (unconditional add on insert)
CREATE OR REPLACE FUNCTION update_campaign_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Since we only insert COMPLETED donations now, we just add the amount
    UPDATE campaigns 
    SET current_amount = current_amount + COALESCE(NEW.amount, 0)
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Re-attach trigger ONLY for INSERT (no more status updates)
DROP TRIGGER IF EXISTS trg_update_campaign_total ON donations;
CREATE TRIGGER trg_update_campaign_total
AFTER INSERT ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_total();

-- 6. Now safely remove the status column
ALTER TABLE donations DROP COLUMN IF EXISTS status;

-- 7. Final data reconciliation for safety
UPDATE campaigns c
SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM donations d
    WHERE d.campaign_id = c.id
);
