-- 17_add_category_pools.sql

-- Create category_pools table
CREATE TABLE IF NOT EXISTS category_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial categories requested by the user
INSERT INTO category_pools (slug, name, description, image_url) VALUES 
('education', 'Education', 'Support primary and higher education for deserving students.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80'),
('disaster-relief', 'Disaster Relief', 'Immediate support for areas affected by natural disasters.', 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80'),
('health', 'Health', 'Medical assistance and healthcare facilities for those in need.', 'https://images.unsplash.com/photo-1505751172151-6fcc78eb8c47?auto=format&fit=crop&q=80'),
('animal', 'Animal Welfare', 'Protecting wildlife and rescuing street animals.', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Update donations table
ALTER TABLE donations 
    ALTER COLUMN campaign_id DROP NOT NULL,
    ADD COLUMN category_pool_id UUID REFERENCES category_pools(id) ON DELETE SET NULL;

-- Ensure either campaign_id or category_pool_id is present
ALTER TABLE donations
    ADD CONSTRAINT check_donation_target 
    CHECK ((campaign_id IS NOT NULL AND category_pool_id IS NULL) OR 
           (campaign_id IS NULL AND category_pool_id IS NOT NULL));

-- Create function to update category pool total
CREATE OR REPLACE FUNCTION update_category_pool_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'SUCCEEDED' AND NEW.category_pool_id IS NOT NULL) THEN
        UPDATE category_pools
        SET total_amount = total_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.category_pool_id;
        
    -- Handle status change to SUCCEEDED
    ELSIF (TG_OP = 'UPDATE' AND COALESCE(OLD.payment_status, '') <> 'SUCCEEDED' AND NEW.payment_status = 'SUCCEEDED' AND NEW.category_pool_id IS NOT NULL) THEN
        UPDATE category_pools
        SET total_amount = total_amount + COALESCE(NEW.amount, 0)
        WHERE id = NEW.category_pool_id;
        
    -- Handle status change from SUCCEEDED
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCEEDED' AND NEW.payment_status <> 'SUCCEEDED' AND OLD.category_pool_id IS NOT NULL) THEN
        UPDATE category_pools
        SET total_amount = total_amount - COALESCE(OLD.amount, 0)
        WHERE id = OLD.category_pool_id;
        
    -- Handle amount change
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'SUCCEEDED' AND NEW.payment_status = 'SUCCEEDED' AND OLD.amount <> NEW.amount AND NEW.category_pool_id IS NOT NULL) THEN
        UPDATE category_pools
        SET total_amount = total_amount - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0)
        WHERE id = NEW.category_pool_id;
        
    -- Handle DELETE
    ELSIF (TG_OP = 'DELETE' AND OLD.payment_status = 'SUCCEEDED' AND OLD.category_pool_id IS NOT NULL) THEN
        UPDATE category_pools
        SET total_amount = total_amount - COALESCE(OLD.amount, 0)
        WHERE id = OLD.category_pool_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to donations table for category pools
DROP TRIGGER IF EXISTS trg_update_category_pool_total ON donations;
CREATE TRIGGER trg_update_category_pool_total
AFTER INSERT OR UPDATE OR DELETE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_category_pool_total();
