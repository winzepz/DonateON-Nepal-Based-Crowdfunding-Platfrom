-- 21_fix_category_images.sql

UPDATE category_pools SET image_url = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200' WHERE slug = 'education';
UPDATE category_pools SET image_url = 'https://images.unsplash.com/photo-1584515159903-393645c99ce3?auto=format&fit=crop&q=80&w=1200' WHERE slug = 'health';
UPDATE category_pools SET image_url = 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1200' WHERE slug = 'disaster-relief';
UPDATE category_pools SET image_url = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=1200' WHERE slug = 'animal';
UPDATE category_pools SET image_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200' WHERE slug = 'nature';
