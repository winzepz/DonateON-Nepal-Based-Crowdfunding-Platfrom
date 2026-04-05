-- 19_enhance_category_pools.sql

-- Add UI/UX and Impact tracking columns to category_pools
ALTER TABLE category_pools
    ADD COLUMN accent_color TEXT,
    ADD COLUMN icon_name TEXT,
    ADD COLUMN impact_label TEXT,
    ADD COLUMN impact_count INTEGER DEFAULT 0;

-- Update existing categories with visual identity and metaphors
UPDATE category_pools SET 
    accent_color = '#6366f1', -- Indigo
    icon_name = 'graduation-cap',
    impact_label = 'Students Empowered',
    description = 'Invest in the future by providing scholarships, school supplies, and educational resources to those in need.'
WHERE slug = 'education';

UPDATE category_pools SET 
    accent_color = '#10b981', -- Emerald
    icon_name = 'activity',
    impact_label = 'Treatments Funded',
    description = 'Provide critical medical care, fund surgeries, and support healthcare infrastructure in underserved regions.'
WHERE slug = 'health';

UPDATE category_pools SET 
    accent_color = '#f59e0b', -- Amber
    icon_name = 'shield-alert',
    impact_label = 'Families Supported',
    description = 'Deliver immediate relief kits, food, and shelter to communities hit by natural disasters.'
WHERE slug = 'disaster-relief';

UPDATE category_pools SET 
    accent_color = '#ec4899', -- Rose
    icon_name = 'paw-print',
    impact_label = 'Animals Rescued',
    description = 'Fund rescue missions, veterinary care, and shelter operations for street animals and wildlife.'
WHERE slug = 'animal';

-- Add Nature Category
INSERT INTO category_pools (slug, name, description, image_url, accent_color, icon_name, impact_label)
VALUES (
    'nature', 
    'Nature & Environment', 
    'Support reforestation, clean water initiatives, and environmental conservation projects across Nepal.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80',
    '#22c55e', -- Green
    'leaf',
    'Trees Planted'
) ON CONFLICT (slug) DO NOTHING;
