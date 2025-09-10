-- ============================================
-- ADICIONAR ARTIGOS DE EXEMPLO - VERSÃO CORRIGIDA
-- ============================================
-- Este script verifica as categorias existentes e usa os IDs corretos

-- Primeiro, vamos ver quais categorias existem
SELECT id, name, slug FROM categories ORDER BY name;

-- Script principal para adicionar artigos
DO $$
DECLARE
    admin_id UUID;
    categoria_politica UUID;
    categoria_economia UUID;
    categoria_esportes UUID;
    categoria_tecnologia UUID;
    categoria_cultura UUID;
    categoria_cidades UUID;
BEGIN
    -- Buscar ID do usuário admin
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Usuário admin não encontrado. Execute primeiro o script de configuração.';
    END IF;
    
    -- Buscar IDs reais das categorias
    SELECT id INTO categoria_politica FROM categories WHERE slug = 'politica' LIMIT 1;
    SELECT id INTO categoria_economia FROM categories WHERE slug = 'economia' LIMIT 1;
    SELECT id INTO categoria_esportes FROM categories WHERE slug = 'esportes' LIMIT 1;
    SELECT id INTO categoria_tecnologia FROM categories WHERE slug = 'tecnologia' LIMIT 1;
    SELECT id INTO categoria_cultura FROM categories WHERE slug = 'cultura' LIMIT 1;
    SELECT id INTO categoria_cidades FROM categories WHERE slug = 'cidades' LIMIT 1;
    
    -- Se alguma categoria não existir, usar a primeira disponível
    IF categoria_tecnologia IS NULL THEN
        SELECT id INTO categoria_tecnologia FROM categories LIMIT 1;
    END IF;
    IF categoria_politica IS NULL THEN
        SELECT id INTO categoria_politica FROM categories LIMIT 1;
    END IF;
    IF categoria_economia IS NULL THEN
        SELECT id INTO categoria_economia FROM categories LIMIT 1;
    END IF;
    IF categoria_esportes IS NULL THEN
        SELECT id INTO categoria_esportes FROM categories LIMIT 1;
    END IF;
    
    RAISE NOTICE 'IDs das categorias encontradas:';
    RAISE NOTICE 'Tecnologia: %', categoria_tecnologia;
    RAISE NOTICE 'Política: %', categoria_politica;
    RAISE NOTICE 'Economia: %', categoria_economia;
    RAISE NOTICE 'Esportes: %', categoria_esportes;
    
    -- Inserir artigos de exemplo com visualizações variadas
    INSERT INTO articles (
        title, subtitle, slug, content, excerpt, 
        category_id, author_id, status, is_featured, 
        views_count, reading_time, published_at, created_at
    ) VALUES
    -- Artigo de Tecnologia (mais visualizado)
    (
        'Inteligência Artificial Revoluciona o Mercado de Trabalho em 2024',
        'Estudo mostra como IA está transformando profissões tradicionais e criando novas oportunidades',
        'ia-revoluciona-mercado-trabalho-2024',
        '<h2>A Era da Transformação Digital</h2><p>A inteligência artificial não é mais ficção científica. Em 2024, ela está reshaping completamente o mercado de trabalho brasileiro, criando novas oportunidades enquanto transforma profissões tradicionais.</p><h3>Impactos Positivos</h3><p>Contrário ao que muitos temem, a IA está criando mais oportunidades do que eliminando empregos. Novas profissões como "prompt engineer" e "AI trainer" surgem diariamente.</p><h3>Preparação para o Futuro</h3><p>Profissionais que se adaptarem às novas tecnologias terão vantagem competitiva significativa no mercado de trabalho do futuro.</p>',
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
        'Nova Lei de Marco Civil da Internet Entra em Discussão no Congresso',
        'Projeto visa regular big techs e proteger dados pessoais dos brasileiros',
        'nova-lei-marco-civil-internet-congresso',
        '<h2>Proteção de Dados em Foco</h2><p>O novo projeto de lei apresentado no Congresso Nacional promete revolucionar a forma como empresas de tecnologia operam no Brasil, estabelecendo regras claras para proteção de dados pessoais.</p><h3>Principais Mudanças</h3><p>Entre as principais propostas estão a criação de regras mais rígidas para coleta de dados pessoais e maior transparência nas políticas de privacidade das plataformas digitais.</p>',
        'Congresso discute nova regulamentação para plataformas digitais e proteção de dados pessoais dos usuários brasileiros.',
        categoria_politica,
        admin_id,
        'published',
        true,
        2834,
        6,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    -- Artigo de Economia
    (
        'PIB Brasileiro Cresce 3,2% no Terceiro Trimestre de 2024',
        'Resultado supera expectativas de analistas e indica recuperação da economia',
        'pib-brasileiro-cresce-terceiro-trimestre-2024',
        '<h2>Crescimento Acima do Esperado</h2><p>O Produto Interno Bruto (PIB) brasileiro registrou crescimento de 3,2% no terceiro trimestre, superando as expectativas dos analistas econômicos e sinalizando uma recuperação consistente.</p><p>Este resultado positivo reflete o fortalecimento do consumo interno e a melhoria do cenário de investimentos empresariais.</p>',
        'Economia brasileira surpreende positivamente com crescimento que supera projeções de mercado.',
        categoria_economia,
        admin_id,
        'published',
        false,
        1847,
        5,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    -- Artigo de Esportes
    (
        'Seleção Brasileira Convoca Novos Talentos para Próxima Copa América',
        'Técnico aposta em renovação e inclui jovens promessas na lista',
        'selecao-brasileira-convoca-talentos-copa-america',
        '<h2>Nova Geração do Futebol Brasileiro</h2><p>A convocação da Seleção Brasileira para a próxima Copa América trouxe surpresas positivas, com a inclusão de jovens talentos que vêm se destacando no cenário nacional e internacional.</p><p>O técnico apostou em uma mescla entre experiência e juventude, buscando renovar o estilo de jogo da equipe nacional.</p>',
        'Renovação na Seleção Brasileira traz esperanças de um futebol mais ofensivo e criativo.',
        categoria_esportes,
        admin_id,
        'published',
        false,
        3205,
        4,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    -- Artigo de Política (mais antigo)
    (
        'Reforma Tributária: Entenda as Principais Mudanças Aprovadas',
        'Novo sistema promete simplificar impostos e reduzir burocracia',
        'reforma-tributaria-principais-mudancas',
        '<h2>Simplificação do Sistema</h2><p>A reforma tributária aprovada pelo Congresso representa uma das maiores mudanças estruturais do sistema fiscal brasileiro das últimas décadas.</p><p>A nova legislação promete reduzir significativamente a complexidade burocrática e unificar diversos impostos em um sistema mais eficiente.</p>',
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
        'Startups Brasileiras Recebem R$ 2,3 Bilhões em Investimentos',
        'Setor de tecnologia mantém crescimento apesar de cenário global desafiador',
        'startups-brasileiras-recebem-investimentos',
        '<h2>Investimentos em Alta</h2><p>O ecossistema de startups brasileiro continua atraindo investimentos significativos, mesmo em um cenário global de incertezas econômicas.</p><p>Os setores de fintech, healthtech e edtech lideram o ranking de captação de recursos, demonstrando a maturidade do mercado nacional.</p>',
        'Empresas de tecnologia brasileiras captam recursos recordes e consolidam posição no mercado latino-americano.',
        categoria_tecnologia,
        admin_id,
        'published',
        false,
        1743,
        6,
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),
    -- Artigo de Economia
    (
        'Inflação Fecha o Mês Dentro da Meta Estabelecida pelo Banco Central',
        'IPCA registra 0,38% em outubro, sinalizando controle dos preços',
        'inflacao-fecha-mes-dentro-meta-banco-central',
        '<h2>Controle Inflacionário</h2><p>O Índice de Preços ao Consumidor Amplo (IPCA) de outubro registrou alta de 0,38%, mantendo-se dentro da faixa de meta estabelecida pelo Banco Central.</p><p>Este resultado confirma a eficácia das medidas de política monetária adotadas nos últimos meses.</p>',
        'IPCA de outubro confirma tendência de controle inflacionário e fortalece expectativas positivas para economia.',
        categoria_economia,
        admin_id,
        'published',
        false,
        892,
        3,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    );
    
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'ARTIGOS CRIADOS COM SUCESSO!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Total de artigos: 7';
    RAISE NOTICE 'Artigo mais visualizado: "IA Revoluciona Mercado" - 15.642 views';
    RAISE NOTICE 'Total de visualizações: ~28.000 views';
    
END $$;

-- Inserir algumas leads de exemplo para testar o analytics
INSERT INTO leads (name, phone, city, email, source, created_at) VALUES
    ('João Silva', '(11) 99999-1111', 'São Paulo', 'joao.silva@email.com', 'website', NOW() - INTERVAL '1 day'),
    ('Maria Santos', '(21) 88888-2222', 'Rio de Janeiro', 'maria.santos@email.com', 'website', NOW() - INTERVAL '2 days'),
    ('Pedro Oliveira', '(31) 77777-3333', 'Belo Horizonte', 'pedro.oliveira@email.com', 'website', NOW() - INTERVAL '5 days'),
    ('Ana Costa', '(47) 66666-4444', 'Florianópolis', 'ana.costa@email.com', 'website', NOW() - INTERVAL '10 days'),
    ('Carlos Ferreira', '(85) 55555-5555', 'Fortaleza', 'carlos.ferreira@email.com', 'website', NOW() - INTERVAL '15 days'),
    ('Luciana Rocha', '(61) 44444-6666', 'Brasília', 'luciana.rocha@email.com', 'website', NOW() - INTERVAL '3 days'),
    ('Roberto Lima', '(81) 33333-7777', 'Recife', 'roberto.lima@email.com', 'website', NOW() - INTERVAL '8 days')
ON CONFLICT DO NOTHING;

-- Relatório final
SELECT 
    '📊 RESUMO DOS DADOS CRIADOS' as info,
    '' as detalhes
UNION ALL
SELECT 
    '📰 Artigos publicados:',
    CAST(COUNT(*) AS TEXT)
FROM articles 
WHERE status = 'published'
UNION ALL
SELECT 
    '👁️ Total de visualizações:',
    CAST(COALESCE(SUM(views_count), 0) AS TEXT)
FROM articles 
WHERE status = 'published'
UNION ALL
SELECT 
    '👥 Leads cadastradas:',
    CAST(COUNT(*) AS TEXT)
FROM leads
UNION ALL
SELECT 
    '🏆 Artigo mais visto:',
    title
FROM articles 
WHERE status = 'published'
ORDER BY views_count DESC 
LIMIT 1;
