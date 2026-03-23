-- 15_fix_legacy_audit_triggers.sql

-- 1. Update log_status_change to match the new audit_logs schema
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO audit_logs (
            action, 
            entity_type, 
            entity_id, 
            details,
            created_at
        )
        VALUES (
            'STATUS_CHANGE', 
            UPPER(TG_TABLE_NAME), 
            NEW.id, 
            jsonb_build_object('old', OLD.status, 'new', NEW.status),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Update log_kyc_status_change to match the new audit_logs schema
CREATE OR REPLACE FUNCTION log_kyc_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.kyc_status IS DISTINCT FROM NEW.kyc_status) THEN
        INSERT INTO audit_logs (
            action, 
            entity_type, 
            entity_id, 
            details,
            created_at
        )
        VALUES (
            'KYC_STATUS_CHANGE', 
            'USER', 
            NEW.id, 
            jsonb_build_object('old', OLD.kyc_status, 'new', NEW.kyc_status),
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Just in case there are other triggers, we should make sure audit_logs has all columns 
-- but we already checked that.
