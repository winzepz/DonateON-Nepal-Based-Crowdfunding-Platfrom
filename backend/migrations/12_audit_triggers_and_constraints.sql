-- 12_audit_triggers_and_constraints.sql

-- 1. Add Numeric Constraints to avoid negative values
ALTER TABLE campaigns ADD CONSTRAINT chk_campaign_target_positive CHECK (target_amount >= 0);
ALTER TABLE campaigns ADD CONSTRAINT chk_campaign_current_positive CHECK (current_amount >= 0);
ALTER TABLE donations ADD CONSTRAINT chk_donation_amount_positive CHECK (amount > 0);

-- 2. Audit Trigger Function
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB := NULL;
    new_data JSONB := NULL;
    entity_id_val UUID := NULL;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        entity_id_val := OLD.id;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        entity_id_val := NEW.id;
    ELSIF (TG_OP = 'INSERT') THEN
        new_data := to_jsonb(NEW);
        entity_id_val := NEW.id;
    END IF;

    INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        created_at
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        entity_id_val,
        jsonb_build_object('old', old_data, 'new', new_data),
        NULL, -- Can be updated by backend service if needed
        NOW()
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Audit Triggers to critical tables
DROP TRIGGER IF EXISTS trg_audit_donations ON donations;
CREATE TRIGGER trg_audit_donations
AFTER INSERT OR UPDATE OR DELETE ON donations
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_campaigns ON campaigns;
CREATE TRIGGER trg_audit_campaigns
AFTER INSERT OR UPDATE OR DELETE ON campaigns
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_payouts ON payouts;
CREATE TRIGGER trg_audit_payouts
AFTER INSERT OR UPDATE OR DELETE ON payouts
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
