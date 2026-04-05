-- 18_update_donation_codes.sql

-- Allow campaign_id to be NULL in donation_codes
ALTER TABLE donation_codes 
    ALTER COLUMN campaign_id DROP NOT NULL,
    ADD COLUMN category_pool_id UUID REFERENCES category_pools(id) ON DELETE SET NULL;

-- Ensure either campaign_id or category_pool_id is present
ALTER TABLE donation_codes
    ADD CONSTRAINT check_donation_code_target 
    CHECK ((campaign_id IS NOT NULL AND category_pool_id IS NULL) OR 
           (campaign_id IS NULL AND category_pool_id IS NOT NULL));
