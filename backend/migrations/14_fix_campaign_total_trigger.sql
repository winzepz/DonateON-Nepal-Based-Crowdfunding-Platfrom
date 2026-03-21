-- 14_fix_campaign_total_trigger.sql
-- Ensures the campaign current_amount is always in sync with successful donations.

CREATE OR REPLACE FUNCTION update_campaign_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle new donation inserted as SUCCEEDED (e.g. manual entry or legacy)
    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
        
    -- Handle donation status change to SUCCEEDED
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status <> 'SUCCEEDED' AND NEW.payment_status = 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
        
    -- Handle donation status change FROM SUCCEEDED TO something else (Refund/Failure)
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCEEDED' AND NEW.payment_status <> 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount - COALESCE(OLD.amount, 0)
        WHERE id = NEW.campaign_id;
        
    -- Handle donation amount change while remaining SUCCEEDED
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCEEDED' AND NEW.payment_status = 'SUCCEEDED' AND OLD.amount <> NEW.amount) THEN
        UPDATE campaigns
        SET current_amount = current_amount - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
        
    -- Handle donation deletion
    ELSIF (TG_OP = 'DELETE' AND OLD.payment_status = 'SUCCEEDED') THEN
        UPDATE campaigns
        SET current_amount = current_amount - COALESCE(OLD.amount, 0)
        WHERE id = OLD.campaign_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger
DROP TRIGGER IF EXISTS trg_update_campaign_total ON donations;
CREATE TRIGGER trg_update_campaign_total
AFTER INSERT OR UPDATE OR DELETE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_total();

-- Final one-time sync to ensure everything is perfect
UPDATE campaigns c
SET current_amount = COALESCE((
    SELECT SUM(amount)
    FROM donations d
    WHERE d.campaign_id = c.id
      AND d.payment_status = 'SUCCEEDED'
), 0);
