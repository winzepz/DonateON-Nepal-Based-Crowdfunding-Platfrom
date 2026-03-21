-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('DONOR', 'CAMPAIGN_CREATOR', 'ADMIN');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE kyc_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
    END IF;
END$$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    role user_role NOT NULL DEFAULT 'DONOR',
    kyc_status kyc_status NOT NULL DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT,
    image_url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    status kyc_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC(14,2) NOT NULL,
    current_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    deadline TIMESTAMPTZ,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer_id ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(14,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
