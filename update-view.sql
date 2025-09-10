-- Atualizar a view articles_with_details para incluir o campo content
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Primeiro, remover a view existente se ela existir
DROP VIEW IF EXISTS articles_with_details;

-- Criar nova view incluindo o campo content
CREATE OR REPLACE VIEW articles_with_details AS
SELECT 
    a.id,
    a.title,
    a.subtitle,
    a.slug,
    a.content,  -- ← Campo que estava faltando!
    a.excerpt,
    a.featured_image,
    a.image_alt,
    a.category_id,
    a.status,
    a.is_featured,
    a.views_count,
    a.reading_time,
    a.meta_title,
    a.meta_description,
    a.keywords,
    a.published_at,
    a.created_at,
    a.updated_at,
    c.name AS category_name,
    c.slug AS category_slug,
    c.color AS category_color,
    u.name AS author_name,
    u.email AS author_email,
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
        '{}'::text[]
    ) AS tags
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON a.author_id = u.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
GROUP BY 
    a.id, a.title, a.subtitle, a.slug, a.content, a.excerpt, 
    a.featured_image, a.image_alt, a.category_id, a.status, 
    a.is_featured, a.views_count, a.reading_time, a.meta_title, 
    a.meta_description, a.keywords, a.published_at, a.created_at, 
    a.updated_at, c.name, c.slug, c.color, u.name, u.email;
