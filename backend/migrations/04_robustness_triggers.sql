-- 1. Add gateway_transaction_id to donations for uniqueness
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255) UNIQUE;

-- 2. Function to update campaign total automatically
CREATE OR REPLACE FUNCTION update_campaign_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle new completed donation
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
        UPDATE campaigns 
        SET current_amount = current_amount + NEW.amount 
        WHERE id = NEW.campaign_id;
    
    -- Handle status change to completed
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
        UPDATE campaigns 
        SET current_amount = current_amount + NEW.amount 
        WHERE id = NEW.campaign_id;
        
    -- Handle status change from completed to something else (refund/failed) - Optional but good for robustness
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
        UPDATE campaigns 
        SET current_amount = current_amount - OLD.amount 
        WHERE id = NEW.campaign_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger for campaign total
DROP TRIGGER IF EXISTS trg_update_campaign_total ON donations;
CREATE TRIGGER trg_update_campaign_total
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_total();

-- 4. Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changed_by UUID, -- Admin ID if available, usually handled in app logic, but DB trigger doesn't know who did it unless we set a config variable or stored procedure. 
    -- For now, we will just log the change details.
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Function for Audit Logging (Generic for status changes)
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status != NEW.status) THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'STATUS_CHANGE', to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach Audit Trigger to Campaigns (for Approval/Rejection)
DROP TRIGGER IF EXISTS trg_audit_campaign_status ON campaigns;
CREATE TRIGGER trg_audit_campaign_status
AFTER UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION log_status_change();

-- 7. Need a slightly different one for Users KYC status (kyc_status column)
CREATE OR REPLACE FUNCTION log_kyc_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.kyc_status != NEW.kyc_status) THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'KYC_STATUS_CHANGE', to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Attach Audit Trigger to Users
DROP TRIGGER IF EXISTS trg_audit_user_kyc ON users;
CREATE TRIGGER trg_audit_user_kyc
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION log_kyc_status_change();
