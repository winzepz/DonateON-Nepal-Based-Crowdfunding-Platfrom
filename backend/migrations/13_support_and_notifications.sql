-- 13_support_and_notifications.sql

-- 1. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- 2. Ticket Messages (Replies)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- 3. Notifications System
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('DONATION_SUCCESS', 'DONATION_RECEIVED', 'CAMPAIGN_APPROVED', 'CAMPAIGN_REJECTED', 'KYC_APPROVED', 'KYC_REJECTED', 'SYSTEM_ALERT', 'BADGE_EARNED')),
    message TEXT NOT NULL,
    link TEXT, -- Optional URL to redirect when clicked
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_status = FALSE;

-- 4. Triggers to auto-update ticket updated_at
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ticket ON support_tickets;
CREATE TRIGGER trg_update_ticket
BEFORE UPDATE ON support_tickets
FOR EACH ROW EXECUTE FUNCTION update_ticket_timestamp();

-- 5. Extend Audit Logs trigger mapping
-- Add tracking for KYC and Users to the existing audit function from 12_
DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_kyc ON kyc_documents;
CREATE TRIGGER trg_audit_kyc
AFTER INSERT OR UPDATE OR DELETE ON kyc_documents
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
