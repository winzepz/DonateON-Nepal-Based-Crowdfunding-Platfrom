-- 1. Ensure current_amount is not NULL and has a default of 0
UPDATE campaigns SET current_amount = 0 WHERE current_amount IS NULL;
ALTER TABLE campaigns ALTER COLUMN current_amount SET DEFAULT 0;
ALTER TABLE campaigns ALTER COLUMN current_amount SET NOT NULL;

-- 2. Create or Update the trigger function
CREATE OR REPLACE FUNCTION update_campaign_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle new completed donation
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
        UPDATE campaigns 
        SET current_amount = current_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
    
    -- Handle status change to completed
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
        UPDATE campaigns 
        SET current_amount = current_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
        
    -- Handle status change from completed to something else (refund/failed)
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
        UPDATE campaigns 
        SET current_amount = current_amount - COALESCE(OLD.amount, 0)
        WHERE id = NEW.campaign_id;
        
    -- Handle case where amount changes on a completed donation
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status = 'completed' AND OLD.amount != NEW.amount) THEN
        UPDATE campaigns 
        SET current_amount = current_amount - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0)
        WHERE id = NEW.campaign_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Ensure trigger is attached
DROP TRIGGER IF EXISTS trg_update_campaign_total ON donations;
CREATE TRIGGER trg_update_campaign_total
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_total();

-- 4. Reconcile data: Sync all campaign totals with the sum of completed donations
UPDATE campaigns c
SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM donations d
    WHERE d.campaign_id = c.id AND d.status = 'completed'
);
