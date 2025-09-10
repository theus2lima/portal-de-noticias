-- ============================================
-- POPULAR BANCO COM ARTIGOS DE TESTE 
-- ============================================
-- Script para adicionar 4 artigos reais em cada categoria

-- Primeiro, vamos verificar as categorias existentes
SELECT 
    id, name, slug,
    'Categoria: ' || name || ' (ID: ' || id || ')' as info
FROM categories 
WHERE is_active = true
ORDER BY name;

-- Verificar se temos usuário admin
DO $$
DECLARE
    admin_id UUID;
    cat_politica UUID;
    cat_economia UUID;
    cat_esportes UUID;
    cat_cultura UUID;
    cat_cidades UUID;
    cat_tecnologia UUID;
BEGIN
    -- Buscar admin
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Usuário admin não encontrado!';
    END IF;
    
    -- Buscar categorias por slug
    SELECT id INTO cat_politica FROM categories WHERE slug = 'politica' LIMIT 1;
    SELECT id INTO cat_economia FROM categories WHERE slug = 'economia' LIMIT 1;
    SELECT id INTO cat_esportes FROM categories WHERE slug = 'esportes' LIMIT 1;
    SELECT id INTO cat_cultura FROM categories WHERE slug = 'cultura' LIMIT 1;
    SELECT id INTO cat_cidades FROM categories WHERE slug = 'cidades' LIMIT 1;
    SELECT id INTO cat_tecnologia FROM categories WHERE slug = 'tecnologia' LIMIT 1;

    RAISE NOTICE 'Admin ID: %', admin_id;
    RAISE NOTICE 'Categorias encontradas:';
    RAISE NOTICE '- Política: %', cat_politica;
    RAISE NOTICE '- Economia: %', cat_economia;
    RAISE NOTICE '- Esportes: %', cat_esportes;
    RAISE NOTICE '- Cultura: %', cat_cultura;
    RAISE NOTICE '- Cidades: %', cat_cidades;
    RAISE NOTICE '- Tecnologia: %', cat_tecnologia;

    -- INSERIR ARTIGOS - CATEGORIA POLÍTICA (4 artigos)
    IF cat_politica IS NOT NULL THEN
        INSERT INTO articles (
            title, subtitle, slug, content, excerpt,
            category_id, author_id, status, is_featured,
            views_count, reading_time, published_at, created_at
        ) VALUES
        (
            'Congresso Aprova Nova Lei de Transparência Pública',
            'Projeto estabelece regras mais rígidas para divulgação de gastos governamentais',
            'congresso-aprova-lei-transparencia-publica',
            '<h2>Marco da Transparência</h2><p>O Congresso Nacional aprovou por ampla maioria a Nova Lei de Transparência Pública, que estabelece regras mais rígidas para a divulgação de gastos governamentais em todos os níveis da administração pública.</p><h3>Principais Mudanças</h3><p>A lei determina que todos os órgãos públicos devem publicar seus gastos em tempo real, com detalhamento por categoria e fornecedor. Além disso, cria o Portal Nacional da Transparência, unificando informações de municípios, estados e União.</p><h3>Fiscalização Cidadã</h3><p>Cidadãos terão acesso facilitado a informações sobre licitações, contratos e execução orçamentária, fortalecendo o controle social sobre o uso dos recursos públicos.</p>',
            'Congresso aprova lei que torna obrigatória a divulgação em tempo real de todos os gastos públicos, fortalecendo a transparência governamental.',
            cat_politica, admin_id, 'published', true,
            3420, 4,
            NOW() - INTERVAL '2 hours',
            NOW() - INTERVAL '2 hours'
        ),
        (
            'STF Julga Constitucionalidade do Marco Temporal',
            'Supremo analisa demarcação de terras indígenas em sessão histórica',
            'stf-julga-constitucionalidade-marco-temporal',
            '<h2>Julgamento Histórico</h2><p>O Supremo Tribunal Federal iniciou nesta quarta-feira o julgamento sobre a constitucionalidade do marco temporal para demarcação de terras indígenas, em uma das decisões mais aguardadas do ano.</p><h3>O que está em Discussão</h3><p>O marco temporal estabelece que povos indígenas só podem reivindicar terras que ocupavam na data da promulgação da Constituição de 1988. A tese é contestada por movimentos indígenas e organizações de direitos humanos.</p><h3>Repercussão Nacional</h3><p>A decisão pode afetar centenas de processos de demarcação em todo o país e tem gerado intensa mobilização tanto de grupos indígenas quanto do agronegócio.</p>',
            'STF inicia julgamento sobre marco temporal para terras indígenas em sessão que pode redefinir a política indigenista brasileira.',
            cat_politica, admin_id, 'published', false,
            2180, 3,
            NOW() - INTERVAL '8 hours',
            NOW() - INTERVAL '8 hours'
        ),
        (
            'Eleições 2026: TSE Define Calendário e Novas Regras',
            'Tribunal Superior Eleitoral estabelece cronograma para próximo pleito presidencial',
            'eleicoes-2026-tse-define-calendario-regras',
            '<h2>Preparação para 2026</h2><p>O Tribunal Superior Eleitoral (TSE) divulgou o calendário oficial das eleições de 2026 e apresentou as principais mudanças nas regras eleitorais, incluindo novas medidas de combate à desinformação.</p><h3>Principais Datas</h3><p>As convenções partidárias acontecerão entre 20 de julho e 5 de agosto de 2026, enquanto a campanha eleitoral será de 16 de agosto a 2 de outubro. O primeiro turno está marcado para 4 de outubro.</p><h3>Combate às Fake News</h3><p>Nova resolução cria sistema de identificação rápida de desinformação e estabelece procedimentos ágeis para remoção de conteúdo falso das plataformas digitais durante o período eleitoral.</p>',
            'TSE define calendário das eleições 2026 e implementa novas regras de combate à desinformação no processo eleitoral.',
            cat_politica, admin_id, 'published', false,
            1560, 3,
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '1 day'
        ),
        (
            'Reforma Ministerial Movimenta Cenário Político em Brasília',
            'Presidente promove mudanças em quatro ministérios estratégicos',
            'reforma-ministerial-movimenta-cenario-politico',
            '<h2>Mudanças no Primeiro Escalão</h2><p>O presidente da República anunciou uma reforma ministerial que afeta quatro pastas estratégicas, em movimento que visa fortalecer a governabilidade e melhorar a articulação política no Congresso.</p><h3>Novos Ministros</h3><p>Os ministérios da Fazenda, Saúde, Educação e Infraestrutura recebem novos comandos, todos com perfil técnico e experiência na administração pública. As nomeações foram bem recebidas pelo mercado financeiro.</p><h3>Reação do Congresso</h3><p>Lideranças partidárias elogiaram as escolhas, destacando o diálogo que antecedeu as nomeações. A medida é vista como tentativa de oxigenar o governo e fortalecer sua base de apoio.</p>',
            'Reforma ministerial em quatro pastas estratégicas busca fortalecer governabilidade e melhorar articulação política.',
            cat_politica, admin_id, 'published', false,
            2890, 3,
            NOW() - INTERVAL '3 days',
            NOW() - INTERVAL '3 days'
        );

        RAISE NOTICE '✅ Inseridos 4 artigos de POLÍTICA';
    END IF;

    -- INSERIR ARTIGOS - CATEGORIA ECONOMIA (4 artigos)
    IF cat_economia IS NOT NULL THEN
        INSERT INTO articles (
            title, subtitle, slug, content, excerpt,
            category_id, author_id, status, is_featured,
            views_count, reading_time, published_at, created_at
        ) VALUES
        (
            'Banco Central Mantém Taxa Selic em 12,75% ao Ano',
            'Copom decide por unanimidade manter juros em patamar atual',
            'banco-central-mantem-taxa-selic-copom',
            '<h2>Decisão Unânime</h2><p>O Comitê de Política Monetária (Copom) do Banco Central decidiu por unanimidade manter a taxa básica de juros (Selic) em 12,75% ao ano, conforme esperado pelo mercado financeiro.</p><h3>Cenário Inflacionário</h3><p>A decisão considera o cenário de inflação controlada e as expectativas dos agentes econômicos. O IPCA acumula alta de 3,8% em 12 meses, dentro da meta estabelecida pelo Conselho Monetário Nacional.</p><h3>Perspectivas Futuras</h3><p>O comunicado do Copom indica que o ciclo de alta dos juros pode estar chegando ao fim, mas ressalta que futuras decisões dependerão da evolução dos dados econômicos.</p>',
            'Banco Central mantém Selic em 12,75% por unanimidade, sinalizando possível fim do ciclo de alta dos juros básicos.',
            cat_economia, admin_id, 'published', true,
            4120, 3,
            NOW() - INTERVAL '4 hours',
            NOW() - INTERVAL '4 hours'
        ),
        (
            'PIB do Terceiro Trimestre Cresce 1,2% e Surpreende Mercado',
            'Resultado supera expectativas e indica recuperação da economia brasileira',
            'pib-terceiro-trimestre-cresce-supera-expectativas',
            '<h2>Crescimento Acima do Esperado</h2><p>O Produto Interno Bruto (PIB) brasileiro registrou crescimento de 1,2% no terceiro trimestre de 2024, superando as expectativas do mercado, que previa alta de 0,8%.</p><h3>Setores que Mais Cresceram</h3><p>O setor de serviços liderou o crescimento com alta de 1,5%, seguido pela indústria (0,9%) e agropecuária (0,6%). O consumo das famílias foi o principal impulsionador da economia.</p><h3>Projeções para 2024</h3><p>Com o resultado, a projeção do PIB para o ano todo foi revisada para cima, passando de 2,1% para 2,4%, indicando recuperação mais robusta que o previsto.</p>',
            'PIB cresce 1,2% no terceiro trimestre, superando expectativas e impulsionando projeções para crescimento anual.',
            cat_economia, admin_id, 'published', false,
            2750, 3,
            NOW() - INTERVAL '12 hours',
            NOW() - INTERVAL '12 hours'
        ),
        (
            'Dólar Recua para R$ 5,20 com Aprovação de Reformas',
            'Moeda americana cai após aprovação de medidas estruturais no Congresso',
            'dolar-recua-aprovacao-reformas-congresso',
            '<h2>Alívio no Câmbio</h2><p>O dólar americano fechou em queda de 2,1%, cotado a R$ 5,20, menor valor em três meses. A baixa está relacionada à aprovação de importantes reformas estruturais pelo Congresso Nacional.</p><h3>Confiança do Mercado</h3><p>Investidores estrangeiros demonstraram otimismo com as aprovações, resultando em fluxo positivo de entrada de capital no país. O Ibovespa também registrou alta de 1,8% na sessão.</p><h3>Reformas Aprovadas</h3><p>Entre as medidas aprovadas estão a modernização do marco regulatório de infraestrutura e mudanças na legislação tributária que simplificam o ambiente de negócios.</p>',
            'Dólar recua para R$ 5,20 após Congresso aprovar reformas estruturais, sinalizando maior confiança dos investidores.',
            cat_economia, admin_id, 'published', false,
            1890, 3,
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '1 day'
        ),
        (
            'Inflação de Alimentos Desacelera pelo Terceiro Mês Consecutivo',
            'IPCA de alimentos registra menor alta desde início de 2023',
            'inflacao-alimentos-desacelera-terceiro-mes',
            '<h2>Tendência de Arrefecimento</h2><p>A inflação de alimentos registrou alta de apenas 0,12% em dezembro, a menor variação mensal desde janeiro de 2023, indicando arrefecimento das pressões nos preços dos produtos básicos.</p><h3>Principais Quedas</h3><p>Carnes bovinas (-2,1%), frango (-1,8%) e ovos (-3,2%) puxaram a desaceleração, compensando altas pontuais em verduras e legumes devido à sazonalidade.</p><h3>Impacto Social</h3><p>A estabilização dos preços dos alimentos beneficia principalmente as famílias de menor renda, que comprometem maior parcela do orçamento com alimentação.</p>',
            'Inflação de alimentos desacelera pelo terceiro mês, com queda nos preços de carnes e proteínas básicas.',
            cat_economia, admin_id, 'published', false,
            2340, 3,
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '2 days'
        );

        RAISE NOTICE '✅ Inseridos 4 artigos de ECONOMIA';
    END IF;

    -- INSERIR ARTIGOS - CATEGORIA ESPORTES (4 artigos)
    IF cat_esportes IS NOT NULL THEN
        INSERT INTO articles (
            title, subtitle, slug, content, excerpt,
            category_id, author_id, status, is_featured,
            views_count, reading_time, published_at, created_at
        ) VALUES
        (
            'Palmeiras Vence Clássico e Assume Liderança do Brasileirão',
            'Verdão derrota rival por 2 a 1 e chega aos 45 pontos na competição',
            'palmeiras-vence-classico-lidera-brasileirao',
            '<h2>Clássico Decisivo</h2><p>O Palmeiras venceu o clássico paulista por 2 a 1 no Allianz Parque e assumiu a liderança isolada do Campeonato Brasileiro, chegando aos 45 pontos em 20 jogos disputados.</p><h3>Gols da Vitória</h3><p>Rony abriu o placar no primeiro tempo, após bela jogada de Raphael Veiga. O rival empatou no início do segundo tempo, mas Endrick garantiu a vitória alviverde aos 38 minutos da etapa final.</p><h3>Próximos Jogos</h3><p>O Palmeiras volta a campo na próxima quarta-feira, enfrentando o Atletico-MG no Mineirão, em jogo que pode ampliar ainda mais a vantagem na liderança do campeonato.</p>',
            'Palmeiras vence clássico paulista por 2 a 1 e assume liderança isolada do Campeonato Brasileiro com 45 pontos.',
            cat_esportes, admin_id, 'published', true,
            5240, 3,
            NOW() - INTERVAL '3 hours',
            NOW() - INTERVAL '3 hours'
        ),
        (
            'Vôlei Feminino: Brasil Garante Vaga na Final do Mundial',
            'Seleção derrota Sérvia por 3 sets a 1 e vai à decisão',
            'volei-feminino-brasil-final-mundial',
            '<h2>Classificação Histórica</h2><p>A seleção brasileira feminina de vôlei derrotou a Sérvia por 3 sets a 1 (25-22, 23-25, 25-18, 25-20) e garantiu vaga na final do Campeonato Mundial, que acontece no próximo domingo.</p><h3>Grandes Atuações</h3><p>Gabi foi o destaque da partida com 22 pontos, seguida por Rosamaria com 18. O Brasil controlou os momentos decisivos e mostrou superioridade técnica contra as atuais vice-campeãs mundiais.</p><h3>Final Aguardada</h3><p>Na decisão, o Brasil enfrentará a Itália, atual campeã mundial, em busca do terceiro título mundial da história do vôlei feminino brasileiro.</p>',
            'Seleção brasileira feminina de vôlei derrota Sérvia e garante vaga na final do Mundial contra a Itália.',
            cat_esportes, admin_id, 'published', false,
            3680, 3,
            NOW() - INTERVAL '6 hours',
            NOW() - INTERVAL '6 hours'
        ),
        (
            'Fórmula 1: Verstappen Vence GP do Brasil em Interlagos',
            'Piloto holandês conquista sua décima vitória na temporada',
            'formula1-verstappen-vence-gp-brasil-interlagos',
            '<h2>Domínio Absoluto</h2><p>Max Verstappen venceu o Grande Prêmio do Brasil de Fórmula 1, em Interlagos, conquistando sua décima vitória na temporada e praticamente garantindo o tetracampeonato mundial.</p><h3>Corrida Emocionante</h3><p>Largando em segundo lugar, Verstappen ultrapassou Hamilton na primeira curva e controlou a corrida. O piloto brasileiro Fernando Alonso terminou em terceiro, para alegria da torcida presente.</p><h3>Campeonato Decidido</h3><p>Com mais uma vitória, Verstappen amplia sua vantagem no campeonato para 140 pontos sobre o segundo colocado, faltando apenas três corridas para o fim da temporada.</p>',
            'Max Verstappen vence GP do Brasil em Interlagos e está a um passo do tetracampeonato mundial de Fórmula 1.',
            cat_esportes, admin_id, 'published', false,
            4150, 4,
            NOW() - INTERVAL '18 hours',
            NOW() - INTERVAL '18 hours'
        ),
        (
            'NBA: Lakers Vencem Celtics em Jogo Épico no TD Garden',
            'LeBron James marca 35 pontos e comanda virada histórica',
            'nba-lakers-vencem-celtics-lebron-35-pontos',
            '<h2>Clássico da NBA</h2><p>Os Los Angeles Lakers derrotaram o Boston Celtics por 128-126 em partida épica no TD Garden, com atuação brilhante de LeBron James, que marcou 35 pontos e liderou a virada no último quarto.</p><h3>Virada Espetacular</h3><p>Perdendo por 15 pontos no início do quarto período, os Lakers reagiram com uma sequência de 22-7 nos minutos finais. Anthony Davis contribuiu com 28 pontos e 12 rebotes na vitória californiana.</p><h3>Rivalidade Renovada</h3><p>O confronto renovou uma das maiores rivalidades da NBA, com o TD Garden lotado testemunhando mais um capítulo memorável entre as duas franquias mais vitoriosas da liga.</p>',
            'Lakers vencem Celtics por 128-126 com show de LeBron James, que marcou 35 pontos em virada épica no TD Garden.',
            cat_esportes, admin_id, 'published', false,
            2970, 3,
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '2 days'
        );

        RAISE NOTICE '✅ Inseridos 4 artigos de ESPORTES';
    END IF;

    -- INSERIR ARTIGOS - CATEGORIA CULTURA (4 artigos)
    IF cat_cultura IS NOT NULL THEN
        INSERT INTO articles (
            title, subtitle, slug, content, excerpt,
            category_id, author_id, status, is_featured,
            views_count, reading_time, published_at, created_at
        ) VALUES
        (
            'Museu da Língua Portuguesa Reabre com Nova Exposição Interativa',
            'Instituição paulista inaugura mostra sobre evolução digital da comunicação',
            'museu-lingua-portuguesa-reabre-exposicao-digital',
            '<h2>Reabertura Aguardada</h2><p>O Museu da Língua Portuguesa, na Estação da Luz, em São Paulo, reabriu suas portas com uma nova exposição permanente que explora a evolução digital da comunicação em português.</p><h3>Tecnologia e Interação</h3><p>A nova mostra conta com recursos de realidade aumentada, instalações interativas e um laboratório de linguagem digital onde visitantes podem experimentar tradutores automáticos e assistentes virtuais.</p><h3>Preservação Cultural</h3><p>O museu também lançou um projeto de digitalização de documentos históricos, tornando acessível online um acervo de mais de 50 mil peças sobre a história da língua portuguesa no Brasil.</p>',
            'Museu da Língua Portuguesa reabre com exposição interativa sobre evolução digital da comunicação em português.',
            cat_cultura, admin_id, 'published', true,
            2840, 4,
            NOW() - INTERVAL '5 hours',
            NOW() - INTERVAL '5 hours'
        ),
        (
            'Festival de Inverno de Campos do Jordão Anuncia Programação 2025',
            'Evento traz 120 concertos com artistas nacionais e internacionais',
            'festival-inverno-campos-jordao-programacao-2025',
            '<h2>50ª Edição Especial</h2><p>O Festival de Inverno de Campos do Jordão anunciou a programação de sua 50ª edição, que acontecerá de 15 de junho a 31 de julho de 2025, com 120 concertos e shows em diversos espaços da cidade.</p><h3>Atrações Confirmadas</h3><p>Entre os destaques estão a Orquestra Sinfônica do Estado de São Paulo, o pianista Nelson Freire, a cantora Maria Bethânia e apresentações especiais da Orquestra Filarmônica de Berlim.</p><h3>Democratização Cultural</h3><p>30% dos concertos terão entrada gratuita, mantendo a tradição de democratizar o acesso à música erudita. Os ingressos para os demais eventos começam a ser vendidos em março.</p>',
            'Festival de Inverno de Campos do Jordão celebra 50 anos com programação especial de 120 concertos e shows.',
            cat_cultura, admin_id, 'published', false,
            1920, 3,
            NOW() - INTERVAL '10 hours',
            NOW() - INTERVAL '10 hours'
        ),
        (
            'Cinema Nacional Bate Recorde de Público em 2024',
            'Filmes brasileiros atraem 45 milhões de espectadores aos cinemas',
            'cinema-nacional-recorde-publico-2024',
            '<h2>Ano Histórico</h2><p>O cinema brasileiro bateu recorde de público em 2024, atraindo mais de 45 milhões de espectadores às salas de cinema, um crescimento de 35% em relação ao ano anterior.</p><h3>Sucessos de Bilheteria</h3><p>Os filmes "Minha Vida em Marte", "Cidade Invisível" e "O Auto da Compadecida 2" lideraram as bilheterias, provando a força da produção nacional junto ao público brasileiro.</p><h3>Investimentos Crescentes</h3><p>O setor recebeu R$ 850 milhões em investimentos públicos e privados, permitindo a produção de 160 longas-metragens nacionais, o maior número da última década.</p>',
            'Cinema brasileiro bate recorde histórico com 45 milhões de espectadores em 2024, crescimento de 35%.',
            cat_cultura, admin_id, 'published', false,
            3210, 3,
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '1 day'
        ),
        (
            'Bienal de Arte de São Paulo Revela Lista de Curadores para 2026',
            'Edição será a primeira com curadoria 100% brasileira e indígena',
            'bienal-arte-sao-paulo-curadores-2026',
            '<h2>Marco Histórico</h2><p>A Fundação Bienal de São Paulo anunciou que a 36ª edição do evento, marcada para 2026, será a primeira da história a contar com curadoria 100% brasileira e com representação indígena na coordenação artística.</p><h3>Nova Abordagem Curatorial</h3><p>O time curatorial é formado por cinco profissionais de diferentes regiões do país, incluindo dois curadores indígenas, marcando uma mudança paradigmática na concepção da maior mostra de arte contemporânea da América Latina.</p><h3>Tema Central</h3><p>A mostra terá como tema "Raízes e Resistências: Artes Originárias na Contemporaneidade", explorando conexões entre tradições ancestrais e expressões artísticas contemporâneas.</p>',
            'Bienal de São Paulo 2026 será a primeira com curadoria 100% brasileira e indígena, focando em artes originárias.',
            cat_cultura, admin_id, 'published', false,
            2650, 4,
            NOW() - INTERVAL '3 days',
            NOW() - INTERVAL '3 days'
        );

        RAISE NOTICE '✅ Inseridos 4 artigos de CULTURA';
    END IF;

    -- INSERIR ARTIGOS - CATEGORIA CIDADES (4 artigos)
    IF cat_cidades IS NOT NULL THEN
        INSERT INTO articles (
            title, subtitle, slug, content, excerpt,
            category_id, author_id, status, is_featured,
            views_count, reading_time, published_at, created_at
        ) VALUES
        (
            'São Paulo Inaugura Maior Parque Linear da América Latina',
            'Parque do Tietê conecta 42 km ao longo do rio principal da cidade',
            'sao-paulo-inaugura-maior-parque-linear-tiete',
            '<h2>Transformação Urbana</h2><p>A Prefeitura de São Paulo inaugurou oficialmente o Parque Linear do Tietê, que se estende por 42 quilômetros ao longo do rio, tornando-se o maior parque linear da América Latina.</p><h3>Benefícios Ambientais</h3><p>O projeto inclui 2.500 hectares de área verde, ciclovia, pistas de caminhada, equipamentos de ginástica e áreas de contemplação. A iniciativa deve reduzir a temperatura da cidade em até 2°C nas regiões próximas.</p><h3>Revitalização do Rio</h3><p>Além do parque, o projeto incluiu tratamento das águas do Tietê e criação de habitat para fauna urbana, marcando uma nova fase na relação da cidade com seus recursos hídricos.</p>',
            'São Paulo inaugura Parque Linear do Tietê de 42 km, maior da América Latina, transformando paisagem urbana.',
            cat_cidades, admin_id, 'published', true,
            4680, 4,
            NOW() - INTERVAL '1 hour',
            NOW() - INTERVAL '1 hour'
        ),
        (
            'Rio de Janeiro Implementa Sistema de Bike Sharing Elétrico',
            'Cidade ganha 5 mil bicicletas elétricas em 200 estações espalhadas',
            'rio-janeiro-implementa-bike-sharing-eletrico',
            '<h2>Mobilidade Sustentável</h2><p>O Rio de Janeiro lançou seu novo sistema de bike sharing elétrico, com 5 mil bicicletas distribuídas em 200 estações estrategicamente posicionadas pela cidade.</p><h3>Cobertura Abrangente</h3><p>O sistema conecta as zonas Sul, Norte e Centro da cidade, incluindo pontos turísticos como Copacabana, Ipanema, Centro Histórico e Maracanã, facilitando tanto o deslocamento de moradores quanto de turistas.</p><h3>Tecnologia Integrada</h3><p>As bicicletas contam com GPS, sistema antifurto e aplicativo integrado com outros modais de transporte público, permitindo planejamento multimodal de viagens pela cidade.</p>',
            'Rio de Janeiro lança sistema de bike sharing com 5 mil bicicletas elétricas conectando principais regiões da cidade.',
            cat_cidades, admin_id, 'published', false,
            3240, 3,
            NOW() - INTERVAL '7 hours',
            NOW() - INTERVAL '7 hours'
        ),
        (
            'Curitiba Recebe Prêmio de Cidade Mais Sustentável das Américas',
            'Capital paranaense é reconhecida por políticas ambientais inovadoras',
            'curitiba-premio-cidade-sustentavel-americas',
            '<h2>Reconhecimento Internacional</h2><p>Curitiba foi eleita a Cidade Mais Sustentável das Américas pelo Conselho Mundial de Cidades Sustentáveis, em reconhecimento às suas políticas ambientais e de qualidade de vida urbana.</p><h3>Políticas Premiadas</h3><p>O prêmio destaca iniciativas como o sistema integrado de transporte público, programas de reciclagem inovadores, criação de parques urbanos e políticas de construção verde que servem de modelo para outras cidades.</p><h3>Impacto Regional</h3><p>Curitiba compete agora ao título mundial, representando a América Latina na categoria de cidades médias. O resultado será anunciado na Conferência Mundial do Clima de 2025.</p>',
            'Curitiba é eleita Cidade Mais Sustentável das Américas por políticas ambientais e qualidade de vida inovadoras.',
            cat_cidades, admin_id, 'published', false,
            2780, 3,
            NOW() - INTERVAL '15 hours',
            NOW() - INTERVAL '15 hours'
        ),
        (
            'Salvador Inicia Revitalização do Centro Histórico com Tecnologia 5G',
            'Projeto piloto traz internet ultrarrápida para região do Pelourinho',
            'salvador-revitalizacao-centro-historico-5g',
            '<h2>Patrimônio Digital</h2><p>Salvador iniciou um projeto pioneiro de revitalização do Centro Histórico que combina restauração arquitetônica com implementação de tecnologia 5G, tornando o Pelourinho a primeira área histórica do Brasil com internet ultrarrápida.</p><h3>Turismo Inteligente</h3><p>O projeto inclui QR codes em pontos históricos, tours virtuais em realidade aumentada e aplicativo interativo que conta a história de cada local através de inteligência artificial.</p><h3>Desenvolvimento Econômico</h3><p>A iniciativa busca atrair empreendedores de tecnologia para a região, criando um hub de inovação que respeita e valoriza o patrimônio histórico-cultural da primeira capital do Brasil.</p>',
            'Salvador revitaliza Centro Histórico com tecnologia 5G, criando primeira área histórica brasileira com internet ultrarrápida.',
            cat_cidades, admin_id, 'published', false,
            2450, 4,
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '2 days'
        );

        RAISE NOTICE '✅ Inseridos 4 artigos de CIDADES';
    END IF;

    -- INSERIR ARTIGOS - CATEGORIA TECNOLOGIA (4 artigos)
    IF cat_tecnologia IS NOT NULL THEN
        INSERT INTO articles (
            title, subtitle, slug, content, excerpt,
            category_id, author_id, status, is_featured,
            views_count, reading_time, published_at, created_at
        ) VALUES
        (
            'IA Generativa Revoluciona Educação Brasileira em 2025',
            'Escolas públicas implementam assistentes virtuais personalizados',
            'ia-generativa-revoluciona-educacao-brasileira',
            '<h2>Transformação Educacional</h2><p>O Ministério da Educação lançou programa nacional que implementa assistentes de IA generativa em 15 mil escolas públicas, personalizando o aprendizado para cada estudante brasileiro.</p><h3>Personalização do Ensino</h3><p>Os sistemas de IA adaptam conteúdo, ritmo e metodologia de acordo com o perfil de cada aluno, identificando dificuldades e potencializando habilidades individuais através de análise contínua de desempenho.</p><h3>Resultados Iniciais</h3><p>Escolas piloto registraram melhoria de 40% no desempenho em matemática e 35% em português, além de redução significativa na evasão escolar entre estudantes do ensino médio.</p>',
            'Programa nacional implementa IA generativa em 15 mil escolas públicas, personalizando educação para cada estudante.',
            cat_tecnologia, admin_id, 'published', true,
            6420, 4,
            NOW() - INTERVAL '30 minutes',
            NOW() - INTERVAL '30 minutes'
        ),
        (
            'Startup Brasileira Desenvolve Chip Quântico Nacional',
            'Tecnologia promete revolucionar computação e segurança cibernética',
            'startup-brasileira-chip-quantico-nacional',
            '<h2>Inovação Nacional</h2><p>A startup paulista QuantumBR desenvolveu o primeiro chip quântico totalmente nacional, capaz de processar 128 qubits e prometendo revolucionar a computação e segurança cibernética no país.</p><h3>Aplicações Estratégicas</h3><p>O chip será usado inicialmente em sistemas bancários para criptografia ultra-segura e em centros de pesquisa para simulações complexas. O governo já sinalizou interesse em aplicações para defesa nacional.</p><h3>Mercado Bilionário</h3><p>A empresa recebeu aporte de R$ 500 milhões de fundos de venture capital e planeja produção em massa até 2026, positioning o Brasil entre os poucos países com tecnologia quântica própria.</p>',
            'Startup brasileira cria primeiro chip quântico nacional de 128 qubits, revolucionando computação e segurança.',
            cat_tecnologia, admin_id, 'published', false,
            4580, 4,
            NOW() - INTERVAL '4 hours',
            NOW() - INTERVAL '4 hours'
        ),
        (
            'Meta Anuncia Datacenter Sustentável no Brasil com Energia Solar',
            'Investimento de US$ 2 bilhões criará maior centro de dados da América Latina',
            'meta-datacenter-sustentavel-brasil-energia-solar',
            '<h2>Investimento Bilionário</h2><p>A Meta anunciou investimento de US$ 2 bilhões na construção do maior datacenter sustentável da América Latina, localizado no interior de São Paulo e totalmente alimentado por energia solar.</p><h3>Sustentabilidade Total</h3><p>O complexo contará com fazenda solar de 500 MW, sistema de resfriamento natural e tecnologias de reutilização de água, estabelecendo novo padrão mundial de eficiência energética em datacenters.</p><h3>Impacto Econômico</h3><p>O projeto gerará 5 mil empregos diretos durante a construção e 800 permanentes na operação, além de impulsionar o ecossistema tecnológico regional e atrair outras big techs para o país.</p>',
            'Meta investe US$ 2 bilhões em datacenter sustentável no Brasil, maior da América Latina com energia 100% solar.',
            cat_tecnologia, admin_id, 'published', false,
            3890, 4,
            NOW() - INTERVAL '14 hours',
            NOW() - INTERVAL '14 hours'
        ),
        (
            'Robôs Médicos Brasileiros Realizam Primeira Cirurgia Autônoma',
            'Sistema desenvolvido pela USP opera com precisão 300% superior',
            'robos-medicos-brasileiros-primeira-cirurgia-autonoma',
            '<h2>Marco da Medicina</h2><p>Robôs cirúrgicos desenvolvidos pela USP em parceria com o Hospital das Clínicas realizaram a primeira cirurgia totalmente autônoma do Brasil, removendo tumor cerebral com precisão 300% superior à humana.</p><h3>Tecnologia Avançada</h3><p>O sistema combina IA, visão computacional 8K e braços robóticos com precisão submilimétrica, permitindo cirurgias minimamente invasivas em áreas críticas do cérebro anteriormente inacessíveis.</p><h3>Futuro da Medicina</h3><p>A tecnologia será expandida para cirurgias cardíacas e neurológicas complexas, posicionando o Brasil como líder mundial em robótica médica e atraindo pacientes internacionais.</p>',
            'Robôs médicos brasileiros realizam primeira cirurgia autônoma do país com precisão 300% superior à humana.',
            cat_tecnologia, admin_id, 'published', false,
            5720, 5,
            NOW() - INTERVAL '1 day 5 hours',
            NOW() - INTERVAL '1 day 5 hours'
        );

        RAISE NOTICE '✅ Inseridos 4 artigos de TECNOLOGIA';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ================================';
    RAISE NOTICE '🎉 TODOS OS ARTIGOS INSERIDOS!';
    RAISE NOTICE '🎉 ================================';
    RAISE NOTICE 'Total: 24 artigos em 6 categorias';
    RAISE NOTICE '4 artigos por categoria criados com sucesso!';
    
END $$;

-- Inserir alguns leads de exemplo também
INSERT INTO leads (name, email, phone, source, created_at) VALUES
    ('Ana Silva', 'ana.silva@email.com', '(11) 99999-1111', 'newsletter', NOW() - INTERVAL '3 hours'),
    ('Carlos Santos', 'carlos.santos@gmail.com', '(21) 88888-2222', 'newsletter', NOW() - INTERVAL '1 day'),
    ('Mariana Costa', 'mariana.costa@yahoo.com', '(31) 77777-3333', 'contato', NOW() - INTERVAL '2 days'),
    ('Roberto Lima', 'roberto.lima@hotmail.com', '(85) 66666-4444', 'newsletter', NOW() - INTERVAL '5 days'),
    ('Julia Ferreira', 'julia.ferreira@outlook.com', '(47) 55555-5555', 'contato', NOW() - INTERVAL '1 week')
ON CONFLICT (email) DO NOTHING;

-- Relatório final de verificação
SELECT 
    '📊 RESUMO FINAL - DADOS CRIADOS' as categoria,
    '' as quantidade
UNION ALL
SELECT 
    '📰 Artigos publicados por categoria:',
    ''
UNION ALL
SELECT 
    '   - ' || c.name || ':',
    COUNT(a.id)::text || ' artigos'
FROM categories c
LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
WHERE c.is_active = true
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order
UNION ALL
SELECT 
    '👁️  Total de visualizações geradas:',
    TO_CHAR(COALESCE(SUM(a.views_count), 0), '999,999') || ' views'
FROM articles a
WHERE a.status = 'published'
UNION ALL
SELECT 
    '👥 Total de leads cadastradas:',
    COUNT(*)::text || ' leads'
FROM leads
UNION ALL
SELECT 
    '🏆 Artigo mais visualizado:',
    a.title || ' (' || a.views_count || ' views)'
FROM articles a
WHERE a.status = 'published' 
ORDER BY a.views_count DESC 
LIMIT 1;
