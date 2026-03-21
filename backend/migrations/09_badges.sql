-- 09_badges.sql
-- Badge definitions table
CREATE TABLE IF NOT EXISTS badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'FIRST_DONATION', 'DONATION_COUNT', 'TOTAL_AMOUNT', 'STREAK'
    threshold NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donor badges (earned)
CREATE TABLE IF NOT EXISTS donor_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_donor_badges_user_id ON donor_badges(user_id);

-- Seed badge definitions
INSERT INTO badge_definitions (slug, title, description, icon, rule_type, threshold) VALUES
('first_donation', 'First Step', 'Made your very first donation on DonateOn!', '🌱', 'FIRST_DONATION', 1),
('supporter', 'Supporter', 'Completed 3 or more donations.', '🤝', 'DONATION_COUNT', 3),
('champion', 'Champion', 'Completed 10 or more donations.', '🏆', 'DONATION_COUNT', 10),
('bronze_donor', 'Bronze Donor', 'Total lifetime donations reached Rs 1,000.', '🥉', 'TOTAL_AMOUNT', 1000),
('silver_donor', 'Silver Donor', 'Total lifetime donations reached Rs 5,000.', '🥈', 'TOTAL_AMOUNT', 5000),
('gold_donor', 'Gold Donor', 'Total lifetime donations reached Rs 10,000.', '🥇', 'TOTAL_AMOUNT', 10000),
('platinum_donor', 'Platinum Donor', 'Total lifetime donations reached Rs 50,000.', '💎', 'TOTAL_AMOUNT', 50000)
ON CONFLICT (slug) DO NOTHING;
