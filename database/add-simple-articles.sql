-- ============================================
-- SCRIPT SIMPLES PARA ADICIONAR ARTIGOS
-- ============================================

-- 1. Primeiro vamos verificar a estrutura da tabela
\d articles

-- 2. Verificar quais categorias existem
SELECT id, name, slug FROM categories ORDER BY name;

-- 3. Verificar usuários admin
SELECT id, email, name, role FROM users WHERE role = 'admin';

-- 4. Script para adicionar artigos (versão básica)
DO $$
DECLARE
    admin_id UUID;
    primeira_categoria UUID;
BEGIN
    -- Buscar qualquer usuário admin
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Se não houver admin, usar qualquer usuário
    IF admin_id IS NULL THEN
        SELECT id INTO admin_id FROM users LIMIT 1;
    END IF;
    
    -- Buscar primeira categoria disponível
    SELECT id INTO primeira_categoria FROM categories LIMIT 1;
    
    -- Verificar se temos o necessário
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum usuário encontrado. Crie um usuário primeiro.';
    END IF;
    
    IF primeira_categoria IS NULL THEN
        RAISE EXCEPTION 'Nenhuma categoria encontrada. Crie categorias primeiro.';
    END IF;
    
    RAISE NOTICE 'Usando usuário ID: %', admin_id;
    RAISE NOTICE 'Usando categoria ID: %', primeira_categoria;
    
    -- Inserir artigos básicos (apenas campos obrigatórios)
    INSERT INTO articles (
        title, 
        slug, 
        content, 
        category_id, 
        author_id, 
        status,
        created_at,
        updated_at
    ) VALUES
    (
        'Inteligência Artificial Transforma Mercado de Trabalho',
        'ia-transforma-mercado-trabalho',
        '<h2>A Revolução da IA</h2><p>A inteligência artificial está transformando rapidamente o mercado de trabalho brasileiro, criando novas oportunidades e desafios.</p><p>Profissionais de diversas áreas precisam se adaptar às novas tecnologias para se manterem competitivos.</p>',
        primeira_categoria,
        admin_id,
        'published',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'Nova Regulamentação para Plataformas Digitais',
        'nova-regulamentacao-plataformas-digitais',
        '<h2>Marco Legal</h2><p>O Congresso Nacional avança na discussão de uma nova regulamentação para plataformas digitais no Brasil.</p><p>A proposta visa proteger dados pessoais e estabelecer regras mais claras para big techs.</p>',
        primeira_categoria,
        admin_id,
        'published',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        'Economia Brasileira Mostra Sinais de Recuperação',
        'economia-brasileira-recuperacao',
        '<h2>Crescimento Econômico</h2><p>Indicadores econômicos apontam para uma recuperação consistente da economia brasileira no último trimestre.</p><p>PIB supera expectativas e gera otimismo para o próximo ano.</p>',
        primeira_categoria,
        admin_id,
        'published',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    (
        'Startups Brasileiras Atraem Investimentos Recordes',
        'startups-brasileiras-investimentos-recordes',
        '<h2>Ecossistema de Inovação</h2><p>O ecossistema de startups brasileiras continua em crescimento, atraindo investimentos significativos mesmo em cenário desafiador.</p><p>Fintechs e healthtechs lideram captação de recursos.</p>',
        primeira_categoria,
        admin_id,
        'published',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        'Seleção Brasileira Prepara Estratégia para Copa América',
        'selecao-brasileira-copa-america',
        '<h2>Futebol Nacional</h2><p>A Seleção Brasileira finaliza preparativos para a próxima Copa América com foco em renovação e performance.</p><p>Técnico aposta em mescla entre experiência e juventude.</p>',
        primeira_categoria,
        admin_id,
        'published',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    );
    
    RAISE NOTICE '5 artigos básicos criados com sucesso!';
    
END $$;

-- 5. Adicionar algumas leads básicas
INSERT INTO leads (name, phone, city, email, source) VALUES
    ('João Silva', '(11) 99999-1111', 'São Paulo', 'joao.silva.teste@email.com', 'website'),
    ('Maria Santos', '(21) 88888-2222', 'Rio de Janeiro', 'maria.santos.teste@email.com', 'website'),
    ('Pedro Costa', '(31) 77777-3333', 'Belo Horizonte', 'pedro.costa.teste@email.com', 'website')
ON CONFLICT DO NOTHING;

-- 6. Relatório final
SELECT 
    'ARTIGOS' as tipo,
    COUNT(*) as quantidade
FROM articles 
WHERE status = 'published'
UNION ALL
SELECT 
    'LEADS' as tipo,
    COUNT(*) as quantidade
FROM leads;

RAISE NOTICE 'Dados básicos criados! Agora você pode adicionar views_count depois.';
