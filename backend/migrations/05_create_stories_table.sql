-- 05_create_stories_table.sql
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category VARCHAR(50), -- e.g., 'Health', 'Education'
    impact_amount VARCHAR(100), -- e.g., 'NRs 500,000'
    impact_people VARCHAR(100), -- e.g., '200 students'
    quote TEXT,
    author_name VARCHAR(255), -- Name of the person giving the quote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_stories_campaign_id ON stories(campaign_id);
