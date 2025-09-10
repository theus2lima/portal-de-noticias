-- ============================================
-- ADICIONAR ARTIGOS DE EXEMPLO COM DADOS REAIS
-- ============================================
-- Este script adiciona artigos de exemplo para testar o analytics

DO $$
DECLARE
    admin_id UUID;
    categoria_politica UUID := '11111111-1111-1111-1111-111111111111';
    categoria_economia UUID := '22222222-2222-2222-2222-222222222222';
    categoria_esportes UUID := '33333333-3333-3333-3333-333333333333';
    categoria_tecnologia UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
    -- Buscar ID do usuário admin
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Usuário admin não encontrado. Execute primeiro o script de configuração.';
    END IF;
    
    -- Inserir artigos de exemplo com visualizações variadas
    INSERT INTO articles (
        id, title, subtitle, slug, content, excerpt, 
        category_id, author_id, status, is_featured, 
        views_count, reading_time, published_at, created_at
    ) VALUES
    -- Artigo de Tecnologia (mais visualizado)
    (
        gen_random_uuid(),
        'Inteligência Artificial Revoluciona o Mercado de Trabalho em 2024',
        'Estudo mostra como IA está transformando profissões tradicionais e criando novas oportunidades',
        'ia-revoluciona-mercado-trabalho-2024',
        '<h2>A Era da Transformação Digital</h2><p>A inteligência artificial não é mais ficção científica. Em 2024, ela está reshaping completamente o mercado de trabalho brasileiro...</p><h3>Impactos Positivos</h3><p>Contrário ao que muitos temem, a IA está criando mais oportunidades do que eliminando empregos...</p><h3>Preparação para o Futuro</h3><p>Profissionais que se adaptarem às novas tecnologias terão vantagem competitiva...</p>',
        'A inteligência artificial está transformando o mercado de trabalho brasileiro de forma acelerada, criando novas profissões e redefinindo carreiras tradicionais.',
        categoria_tecnologia,
        admin_id,
        'published',
        true,
        15642,
        8,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    -- Artigo de Política
    (
        gen_random_uuid(),
        'Nova Lei de Marco Civil da Internet Entra em Discussão no Congresso',
        'Projeto visa regular big techs e proteger dados pessoais dos brasileiros',
        'nova-lei-marco-civil-internet-congresso',
        '<h2>Proteção de Dados em Foco</h2><p>O novo projeto de lei apresentado no Congresso Nacional promete revolucionar a forma como empresas de tecnologia operam no Brasil...</p><h3>Principais Mudanças</h3><p>Entre as principais propostas estão a criação de regras mais rígidas para coleta de dados...</p>',
        'Congresso discute nova regulamentação para plataformas digitais e proteção de dados pessoais dos usuários brasileiros.',
        categoria_politica,
        admin_id,
        'published',
        true,
        9,
        6,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    -- Artigo de Economia
    (
        gen_random_uuid(),
        'PIB Brasileiro Cresce 3,2% no Terceiro Trimestre de 2024',
        'Resultado supera expectativas de analistas e indica recuperação da economia',
        'pib-brasileiro-cresce-terceiro-trimestre-2024',
        '<h2>Crescimento Acima do Esperado</h2><p>O Produto Interno Bruto (PIB) brasileiro registrou crescimento de 3,2% no terceiro trimestre...</p>',
        'Economia brasileira surpreende positivamente com crescimento que supera projeções de mercado.',
        categoria_economia,
        admin_id,
        'published',
        false,
        847,
        5,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    -- Artigo de Esportes
    (
        gen_random_uuid(),
        'Seleção Brasileira Convoca Novos Talentos para Próxima Copa América',
        'Técnico aposta em renovação e inclui jovens promessas na lista',
        'selecao-brasileira-convoca-talentos-copa-america',
        '<h2>Nova Geração do Futebol Brasileiro</h2><p>A convocação da Seleção Brasileira para a próxima Copa América trouxe surpresas...</p>',
        'Renovação na Seleção Brasileira traz esperanças de um futebol mais ofensivo e criativo.',
        categoria_esportes,
        admin_id,
        'published',
        false,
        1205,
        4,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    -- Artigo de Política (mais antigo)
    (
        gen_random_uuid(),
        'Reforma Tributária: Entenda as Principais Mudanças Aprovadas',
        'Novo sistema promete simplificar impostos e reduzir burocracia',
        'reforma-tributaria-principais-mudancas',
        '<h2>Simplificação do Sistema</h2><p>A reforma tributária aprovada pelo Congresso representa uma das maiores mudanças...</p>',
        'Reforma tributária promete modernizar sistema de impostos brasileiro e reduzir complexidade fiscal.',
        categoria_politica,
        admin_id,
        'published',
        false,
        2156,
        7,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    -- Artigo de Tecnologia
    (
        gen_random_uuid(),
        'Startups Brasileiras Recebem R$ 2,3 Bilhões em Investimentos',
        'Setor de tecnologia mantém crescimento apesar de cenário global desafiador',
        'startups-brasileiras-recebem-investimentos',
        '<h2>Investimentos em Alta</h2><p>O ecossistema de startups brasileiro continua atraindo investimentos significativos...</p>',
        'Empresas de tecnologia brasileiras captam recursos recordes e consolidam posição no mercado latino-americano.',
        categoria_tecnologia,
        admin_id,
        'published',
        false,
        743,
        6,
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),
    -- Artigo de Economia
    (
        gen_random_uuid(),
        'Inflação Fecha o Mês Dentro da Meta Estabelecida pelo Banco Central',
        'IPCA registra 0,38% em outubro, sinalizando controle dos preços',
        'inflacao-fecha-mes-dentro-meta-banco-central',
        '<h2>Controle Inflacionário</h2><p>O Índice de Preços ao Consumidor Amplo (IPCA) de outubro...</p>',
        'IPCA de outubro confirma tendência de controle inflacionário e fortalece expectativas positivas para economia.',
        categoria_economia,
        admin_id,
        'published',
        false,
        492,
        3,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    );
    
    RAISE NOTICE 'Foram criados 7 artigos de exemplo com diferentes visualizações!';
    RAISE NOTICE 'Artigo mais visualizado: "IA Revoluciona Mercado" - 15.642 views';
    RAISE NOTICE 'Total de visualizações criadas: ~21.000 views';
    
END $$;

-- Inserir algumas leads de exemplo para testar o analytics
INSERT INTO leads (name, phone, city, email, source, created_at) VALUES
    ('João Silva', '(11) 99999-1111', 'São Paulo', 'joao@email.com', 'website', NOW() - INTERVAL '1 day'),
    ('Maria Santos', '(21) 88888-2222', 'Rio de Janeiro', 'maria@email.com', 'website', NOW() - INTERVAL '2 days'),
    ('Pedro Oliveira', '(31) 77777-3333', 'Belo Horizonte', 'pedro@email.com', 'website', NOW() - INTERVAL '5 days'),
    ('Ana Costa', '(47) 66666-4444', 'Florianópolis', 'ana@email.com', 'website', NOW() - INTERVAL '10 days'),
    ('Carlos Ferreira', '(85) 55555-5555', 'Fortaleza', 'carlos@email.com', 'website', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- Verificar resultados
SELECT 
    'ARTIGOS CRIADOS' as info,
    COUNT(*) as quantidade,
    SUM(views_count) as total_views
FROM articles 
WHERE status = 'published'
UNION ALL
SELECT 
    'LEADS CRIADAS' as info,
    COUNT(*) as quantidade,
    0 as total_views
FROM leads
ORDER BY info;
