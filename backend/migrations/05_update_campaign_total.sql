-- Migration to ensure campaign total updates correctly
-- Set default for current_amount and recreate trigger

ALTER TABLE campaigns
    ALTER COLUMN current_amount SET DEFAULT 0;

-- Recreate trigger to update campaign total on donation status change
DROP TRIGGER IF EXISTS trg_update_campaign_total ON donations;
CREATE TRIGGER trg_update_campaign_total
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_total();
