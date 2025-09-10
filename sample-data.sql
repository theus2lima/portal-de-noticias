-- Sample data to test the dashboard percentage changes
-- This script adds some articles and leads with different creation dates to demonstrate the functionality

-- Insert sample articles from different periods
INSERT INTO articles (
  id,
  title,
  content,
  excerpt,
  category_id,
  status,
  views_count,
  created_at
) VALUES 
-- Current month articles
(gen_random_uuid(), 'Artigo de Tecnologia 2024', 'Conteúdo sobre tecnologia...', 'Excerpt sobre tecnologia', (SELECT id FROM categories LIMIT 1), 'published', 150, NOW()),
(gen_random_uuid(), 'Notícias de Negócios', 'Conteúdo sobre negócios...', 'Excerpt sobre negócios', (SELECT id FROM categories LIMIT 1), 'published', 89, NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'Rascunho Atual', 'Rascunho em progresso...', 'Excerpt do rascunho', (SELECT id FROM categories LIMIT 1), 'draft', 0, NOW() - INTERVAL '2 days'),

-- Last month articles (for comparison)
(gen_random_uuid(), 'Artigo Antigo 1', 'Conteúdo antigo...', 'Excerpt antigo', (SELECT id FROM categories LIMIT 1), 'published', 200, NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'Artigo Antigo 2', 'Mais conteúdo antigo...', 'Outro excerpt', (SELECT id FROM categories LIMIT 1), 'published', 120, NOW() - INTERVAL '40 days'),
(gen_random_uuid(), 'Rascunho Antigo', 'Rascunho antigo...', 'Excerpt rascunho antigo', (SELECT id FROM categories LIMIT 1), 'draft', 0, NOW() - INTERVAL '45 days');

-- Insert sample leads from different periods
INSERT INTO leads (
  id,
  name,
  email,
  phone,
  message,
  city,
  created_at
) VALUES 
-- Current period leads (last 30 days)
(gen_random_uuid(), 'João Silva', 'joao@email.com', '11999999999', 'Interessado nos serviços', 'São Paulo', NOW()),
(gen_random_uuid(), 'Maria Santos', 'maria@email.com', '11888888888', 'Gostaria de mais informações', 'Rio de Janeiro', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'Pedro Costa', 'pedro@email.com', '11777777777', 'Preciso de suporte', 'Belo Horizonte', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'Ana Lima', 'ana@email.com', '11666666666', 'Solicito orçamento', 'Porto Alegre', NOW() - INTERVAL '25 days'),

-- Previous period leads (30-60 days ago)
(gen_random_uuid(), 'Carlos Oliveira', 'carlos@email.com', '11555555555', 'Lead antigo', 'Salvador', NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'Lucia Ferreira', 'lucia@email.com', '11444444444', 'Outro lead antigo', 'Brasília', NOW() - INTERVAL '50 days');

-- Update some leads as contacted
UPDATE leads SET is_contacted = true WHERE name IN ('João Silva', 'Carlos Oliveira');
