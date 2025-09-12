-- ============================================
-- LANDING PAGES - DATABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Tabela de Landing Pages
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    subtitle VARCHAR(500),
    description TEXT,
    
    -- Template e Design
    template VARCHAR(50) DEFAULT 'default' CHECK (template IN ('default', 'business', 'minimal', 'bold', 'modern')),
    primary_color VARCHAR(20) DEFAULT '#1E3A8A',
    secondary_color VARCHAR(20) DEFAULT '#3B82F6',
    
    -- Conteúdo da página
    hero_title VARCHAR(300) NOT NULL,
    hero_subtitle VARCHAR(500),
    hero_description TEXT,
    hero_image TEXT,
    hero_cta_text VARCHAR(100) DEFAULT 'Entre em Contato',
    
    -- Seções
    about_title VARCHAR(200),
    about_content TEXT,
    about_image TEXT,
    
    services_title VARCHAR(200) DEFAULT 'Nossos Serviços',
    services JSONB DEFAULT '[]'::jsonb, -- Array de objetos com título, descrição, ícone
    
    testimonials_title VARCHAR(200) DEFAULT 'Depoimentos',
    testimonials JSONB DEFAULT '[]'::jsonb, -- Array de objetos com nome, depoimento, cargo, foto
    
    contact_title VARCHAR(200) DEFAULT 'Entre em Contato',
    contact_description TEXT,
    
    -- Informações de contato
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    contact_address TEXT,
    contact_whatsapp VARCHAR(50),
    
    -- Redes sociais
    social_facebook VARCHAR(255),
    social_instagram VARCHAR(255),
    social_linkedin VARCHAR(255),
    social_twitter VARCHAR(255),
    
    -- SEO
    meta_title VARCHAR(300),
    meta_description VARCHAR(500),
    meta_keywords TEXT,
    og_image TEXT,
    
    -- Configurações
    is_active BOOLEAN DEFAULT true,
    show_header BOOLEAN DEFAULT true,
    show_footer BOOLEAN DEFAULT true,
    custom_css TEXT,
    custom_js TEXT,
    
    -- Analytics
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para leads específicos de landing pages
CREATE TABLE IF NOT EXISTS landing_page_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    message TEXT,
    source VARCHAR(100) DEFAULT 'landing_page',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    is_contacted BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_active ON landing_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_landing_pages_created_at ON landing_pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_landing_page_leads_landing_page ON landing_page_leads(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_leads_created_at ON landing_page_leads(created_at DESC);

-- ============================================
-- TRIGGERS PARA AUTO-UPDATE
-- ============================================

CREATE TRIGGER update_landing_pages_updated_at 
    BEFORE UPDATE ON landing_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_page_leads_updated_at 
    BEFORE UPDATE ON landing_page_leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (EXEMPLO)
-- ============================================

-- Exemplo de landing page
INSERT INTO landing_pages (
    title, 
    slug, 
    hero_title, 
    hero_subtitle,
    hero_description,
    contact_phone,
    contact_email,
    about_title,
    about_content
) VALUES (
    'Exemplo - Serviços Profissionais',
    'exemplo-servicos',
    'Transforme Seu Negócio Hoje',
    'Soluções profissionais para impulsionar seus resultados',
    'Oferecemos serviços especializados que vão levar sua empresa ao próximo nível. Entre em contato e descubra como podemos ajudar você.',
    '(11) 99999-9999',
    'contato@exemplo.com',
    'Sobre Nós',
    'Somos especialistas em soluções empresariais com mais de 10 anos de experiência no mercado. Nossa missão é ajudar empresas a crescerem e se destacarem em seus segmentos.'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE landing_pages IS 'Landing pages personalizáveis para campanhas e negócios';
COMMENT ON TABLE landing_page_leads IS 'Leads capturados especificamente de landing pages';
COMMENT ON COLUMN landing_pages.services IS 'Array JSON com serviços: [{"title":"","description":"","icon":""}]';
COMMENT ON COLUMN landing_pages.testimonials IS 'Array JSON com depoimentos: [{"name":"","testimonial":"","role":"","image":""}]';
