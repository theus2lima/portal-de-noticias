const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configurações do Supabase não encontradas!');
  console.log('Certifique-se de ter o arquivo .env.local configurado com:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error.message);
    return false;
  }
}

async function checkExistingData() {
  console.log('🔄 Verificando dados existentes...');
  
  try {
    // Verificar categorias
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (catError) throw catError;

    console.log('📂 Categorias encontradas:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug}): ${cat.id}`);
    });

    // Verificar artigos existentes
    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select('id', { count: 'exact' });

    if (artError) throw artError;

    console.log(`📄 Artigos existentes: ${articles.length}`);
    
    return { categories, articleCount: articles.length };
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
    return null;
  }
}

async function populateArticles() {
  console.log('🔄 Populando banco de dados com artigos...');
  
  try {
    // Buscar admin e categorias
    const { data: admin } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (!admin) {
      throw new Error('Usuário admin não encontrado');
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug');

    const catMap = {};
    categories.forEach(cat => {
      catMap[cat.slug] = cat.id;
    });

    console.log('👤 Admin ID:', admin.id);
    console.log('📂 Mapeamento de categorias:', catMap);

    const articles = [
      // POLÍTICA
      {
        title: 'Congresso Aprova Nova Lei de Transparência Pública',
        subtitle: 'Projeto estabelece regras mais rígidas para divulgação de gastos governamentais',
        slug: 'congresso-aprova-lei-transparencia-publica',
        content: '<h2>Marco da Transparência</h2><p>O Congresso Nacional aprovou por ampla maioria a Nova Lei de Transparência Pública, que estabelece regras mais rígidas para a divulgação de gastos governamentais em todos os níveis da administração pública.</p><h3>Principais Mudanças</h3><p>A lei determina que todos os órgãos públicos devem publicar seus gastos em tempo real, com detalhamento por categoria e fornecedor. Além disso, cria o Portal Nacional da Transparência, unificando informações de municípios, estados e União.</p><h3>Fiscalização Cidadã</h3><p>Cidadãos terão acesso facilitado a informações sobre licitações, contratos e execução orçamentária, fortalecendo o controle social sobre o uso dos recursos públicos.</p>',
        excerpt: 'Congresso aprova lei que torna obrigatória a divulgação em tempo real de todos os gastos públicos, fortalecendo a transparência governamental.',
        category_id: catMap.politica,
        author_id: admin.id,
        status: 'published',
        is_featured: true,
        views_count: 3420,
        reading_time: 4,
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'STF Julga Constitucionalidade do Marco Temporal',
        subtitle: 'Supremo analisa demarcação de terras indígenas em sessão histórica',
        slug: 'stf-julga-constitucionalidade-marco-temporal',
        content: '<h2>Julgamento Histórico</h2><p>O Supremo Tribunal Federal iniciou nesta quarta-feira o julgamento sobre a constitucionalidade do marco temporal para demarcação de terras indígenas, em uma das decisões mais aguardadas do ano.</p><h3>O que está em Discussão</h3><p>O marco temporal estabelece que povos indígenas só podem reivindicar terras que ocupavam na data da promulgação da Constituição de 1988. A tese é contestada por movimentos indígenas e organizações de direitos humanos.</p><h3>Repercussão Nacional</h3><p>A decisão pode afetar centenas de processos de demarcação em todo o país e tem gerado intensa mobilização tanto de grupos indígenas quanto do agronegócio.</p>',
        excerpt: 'STF inicia julgamento sobre marco temporal para terras indígenas em sessão que pode redefinir a política indigenista brasileira.',
        category_id: catMap.politica,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2180,
        reading_time: 3,
        published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Eleições 2026: TSE Define Calendário e Novas Regras',
        subtitle: 'Tribunal Superior Eleitoral estabelece cronograma para próximo pleito presidencial',
        slug: 'eleicoes-2026-tse-define-calendario-regras',
        content: '<h2>Preparação para 2026</h2><p>O Tribunal Superior Eleitoral (TSE) divulgou o calendário oficial das eleições de 2026 e apresentou as principais mudanças nas regras eleitorais, incluindo novas medidas de combate à desinformação.</p><h3>Principais Datas</h3><p>As convenções partidárias acontecerão entre 20 de julho e 5 de agosto de 2026, enquanto a campanha eleitoral será de 16 de agosto a 2 de outubro. O primeiro turno está marcado para 4 de outubro.</p><h3>Combate às Fake News</h3><p>Nova resolução cria sistema de identificação rápida de desinformação e estabelece procedimentos ágeis para remoção de conteúdo falso das plataformas digitais durante o período eleitoral.</p>',
        excerpt: 'TSE define calendário das eleições 2026 e implementa novas regras de combate à desinformação no processo eleitoral.',
        category_id: catMap.politica,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 1560,
        reading_time: 3,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Reforma Ministerial Movimenta Cenário Político em Brasília',
        subtitle: 'Presidente promove mudanças em quatro ministérios estratégicos',
        slug: 'reforma-ministerial-movimenta-cenario-politico',
        content: '<h2>Mudanças no Primeiro Escalão</h2><p>O presidente da República anunciou uma reforma ministerial que afeta quatro pastas estratégicas, em movimento que visa fortalecer a governabilidade e melhorar a articulação política no Congresso.</p><h3>Novos Ministros</h3><p>Os ministérios da Fazenda, Saúde, Educação e Infraestrutura recebem novos comandos, todos com perfil técnico e experiência na administração pública. As nomeações foram bem recebidas pelo mercado financeiro.</p><h3>Reação do Congresso</h3><p>Lideranças partidárias elogiaram as escolhas, destacando o diálogo que antecedeu as nomeações. A medida é vista como tentativa de oxigenar o governo e fortalecer sua base de apoio.</p>',
        excerpt: 'Reforma ministerial em quatro pastas estratégicas busca fortalecer governabilidade e melhorar articulação política.',
        category_id: catMap.politica,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2890,
        reading_time: 3,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // ECONOMIA
      {
        title: 'Banco Central Mantém Taxa Selic em 12,75% ao Ano',
        subtitle: 'Copom decide por unanimidade manter juros em patamar atual',
        slug: 'banco-central-mantem-taxa-selic-copom',
        content: '<h2>Decisão Unânime</h2><p>O Comitê de Política Monetária (Copom) do Banco Central decidiu por unanimidade manter a taxa básica de juros (Selic) em 12,75% ao ano, conforme esperado pelo mercado financeiro.</p><h3>Cenário Inflacionário</h3><p>A decisão considera o cenário de inflação controlada e as expectativas dos agentes econômicos. O IPCA acumula alta de 3,8% em 12 meses, dentro da meta estabelecida pelo Conselho Monetário Nacional.</p><h3>Perspectivas Futuras</h3><p>O comunicado do Copom indica que o ciclo de alta dos juros pode estar chegando ao fim, mas ressalta que futuras decisões dependerão da evolução dos dados econômicos.</p>',
        excerpt: 'Banco Central mantém Selic em 12,75% por unanimidade, sinalizando possível fim do ciclo de alta dos juros básicos.',
        category_id: catMap.economia,
        author_id: admin.id,
        status: 'published',
        is_featured: true,
        views_count: 4120,
        reading_time: 3,
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'PIB do Terceiro Trimestre Cresce 1,2% e Surpreende Mercado',
        subtitle: 'Resultado supera expectativas e indica recuperação da economia brasileira',
        slug: 'pib-terceiro-trimestre-cresce-supera-expectativas',
        content: '<h2>Crescimento Acima do Esperado</h2><p>O Produto Interno Bruto (PIB) brasileiro registrou crescimento de 1,2% no terceiro trimestre de 2024, superando as expectativas do mercado, que previa alta de 0,8%.</p><h3>Setores que Mais Cresceram</h3><p>O setor de serviços liderou o crescimento com alta de 1,5%, seguido pela indústria (0,9%) e agropecuária (0,6%). O consumo das famílias foi o principal impulsionador da economia.</p><h3>Projeções para 2024</h3><p>Com o resultado, a projeção do PIB para o ano todo foi revisada para cima, passando de 2,1% para 2,4%, indicando recuperação mais robusta que o previsto.</p>',
        excerpt: 'PIB cresce 1,2% no terceiro trimestre, superando expectativas e impulsionando projeções para crescimento anual.',
        category_id: catMap.economia,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2750,
        reading_time: 3,
        published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Dólar Recua para R$ 5,20 com Aprovação de Reformas',
        subtitle: 'Moeda americana cai após aprovação de medidas estruturais no Congresso',
        slug: 'dolar-recua-aprovacao-reformas-congresso',
        content: '<h2>Alívio no Câmbio</h2><p>O dólar americano fechou em queda de 2,1%, cotado a R$ 5,20, menor valor em três meses. A baixa está relacionada à aprovação de importantes reformas estruturais pelo Congresso Nacional.</p><h3>Confiança do Mercado</h3><p>Investidores estrangeiros demonstraram otimismo com as aprovações, resultando em fluxo positivo de entrada de capital no país. O Ibovespa também registrou alta de 1,8% na sessão.</p><h3>Reformas Aprovadas</h3><p>Entre as medidas aprovadas estão a modernização do marco regulatório de infraestrutura e mudanças na legislação tributária que simplificam o ambiente de negócios.</p>',
        excerpt: 'Dólar recua para R$ 5,20 após Congresso aprovar reformas estruturais, sinalizando maior confiança dos investidores.',
        category_id: catMap.economia,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 1890,
        reading_time: 3,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Inflação de Alimentos Desacelera pelo Terceiro Mês Consecutivo',
        subtitle: 'IPCA de alimentos registra menor alta desde início de 2023',
        slug: 'inflacao-alimentos-desacelera-terceiro-mes',
        content: '<h2>Tendência de Arrefecimento</h2><p>A inflação de alimentos registrou alta de apenas 0,12% em dezembro, a menor variação mensal desde janeiro de 2023, indicando arrefecimento das pressões nos preços dos produtos básicos.</p><h3>Principais Quedas</h3><p>Carnes bovinas (-2,1%), frango (-1,8%) e ovos (-3,2%) puxaram a desaceleração, compensando altas pontuais em verduras e legumes devido à sazonalidade.</p><h3>Impacto Social</h3><p>A estabilização dos preços dos alimentos beneficia principalmente as famílias de menor renda, que comprometem maior parcela do orçamento com alimentação.</p>',
        excerpt: 'Inflação de alimentos desacelera pelo terceiro mês, com queda nos preços de carnes e proteínas básicas.',
        category_id: catMap.economia,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2340,
        reading_time: 3,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // ESPORTES
      {
        title: 'Palmeiras Vence Clássico e Assume Liderança do Brasileirão',
        subtitle: 'Verdão derrota rival por 2 a 1 e chega aos 45 pontos na competição',
        slug: 'palmeiras-vence-classico-lidera-brasileirao',
        content: '<h2>Clássico Decisivo</h2><p>O Palmeiras venceu o clássico paulista por 2 a 1 no Allianz Parque e assumiu a liderança isolada do Campeonato Brasileiro, chegando aos 45 pontos em 20 jogos disputados.</p><h3>Gols da Vitória</h3><p>Rony abriu o placar no primeiro tempo, após bela jogada de Raphael Veiga. O rival empatou no início do segundo tempo, mas Endrick garantiu a vitória alviverde aos 38 minutos da etapa final.</p><h3>Próximos Jogos</h3><p>O Palmeiras volta a campo na próxima quarta-feira, enfrentando o Atletico-MG no Mineirão, em jogo que pode ampliar ainda mais a vantagem na liderança do campeonato.</p>',
        excerpt: 'Palmeiras vence clássico paulista por 2 a 1 e assume liderança isolada do Campeonato Brasileiro com 45 pontos.',
        category_id: catMap.esportes,
        author_id: admin.id,
        status: 'published',
        is_featured: true,
        views_count: 5240,
        reading_time: 3,
        published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Vôlei Feminino: Brasil Garante Vaga na Final do Mundial',
        subtitle: 'Seleção derrota Sérvia por 3 sets a 1 e vai à decisão',
        slug: 'volei-feminino-brasil-final-mundial',
        content: '<h2>Classificação Histórica</h2><p>A seleção brasileira feminina de vôlei derrotou a Sérvia por 3 sets a 1 (25-22, 23-25, 25-18, 25-20) e garantiu vaga na final do Campeonato Mundial, que acontece no próximo domingo.</p><h3>Grandes Atuações</h3><p>Gabi foi o destaque da partida com 22 pontos, seguida por Rosamaria com 18. O Brasil controlou os momentos decisivos e mostrou superioridade técnica contra as atuais vice-campeãs mundiais.</p><h3>Final Aguardada</h3><p>Na decisão, o Brasil enfrentará a Itália, atual campeã mundial, em busca do terceiro título mundial da história do vôlei feminino brasileiro.</p>',
        excerpt: 'Seleção brasileira feminina de vôlei derrota Sérvia e garante vaga na final do Mundial contra a Itália.',
        category_id: catMap.esportes,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 3680,
        reading_time: 3,
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Fórmula 1: Verstappen Vence GP do Brasil em Interlagos',
        subtitle: 'Piloto holandês conquista sua décima vitória na temporada',
        slug: 'formula1-verstappen-vence-gp-brasil-interlagos',
        content: '<h2>Domínio Absoluto</h2><p>Max Verstappen venceu o Grande Prêmio do Brasil de Fórmula 1, em Interlagos, conquistando sua décima vitória na temporada e praticamente garantindo o tetracampeonato mundial.</p><h3>Corrida Emocionante</h3><p>Largando em segundo lugar, Verstappen ultrapassou Hamilton na primeira curva e controlou a corrida. O piloto brasileiro Fernando Alonso terminou em terceiro, para alegria da torcida presente.</p><h3>Campeonato Decidido</h3><p>Com mais uma vitória, Verstappen amplia sua vantagem no campeonato para 140 pontos sobre o segundo colocado, faltando apenas três corridas para o fim da temporada.</p>',
        excerpt: 'Max Verstappen vence GP do Brasil em Interlagos e está a um passo do tetracampeonato mundial de Fórmula 1.',
        category_id: catMap.esportes,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 4150,
        reading_time: 4,
        published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'NBA: Lakers Vencem Celtics em Jogo Épico no TD Garden',
        subtitle: 'LeBron James marca 35 pontos e comanda virada histórica',
        slug: 'nba-lakers-vencem-celtics-lebron-35-pontos',
        content: '<h2>Clássico da NBA</h2><p>Os Los Angeles Lakers derrotaram o Boston Celtics por 128-126 em partida épica no TD Garden, com atuação brilhante de LeBron James, que marcou 35 pontos e liderou a virada no último quarto.</p><h3>Virada Espetacular</h3><p>Perdendo por 15 pontos no início do quarto período, os Lakers reagiram com uma sequência de 22-7 nos minutos finais. Anthony Davis contribuiu com 28 pontos e 12 rebotes na vitória californiana.</p><h3>Rivalidade Renovada</h3><p>O confronto renovou uma das maiores rivalidades da NBA, com o TD Garden lotado testemunhando mais um capítulo memorável entre as duas franquias mais vitoriosas da liga.</p>',
        excerpt: 'Lakers vencem Celtics por 128-126 com show de LeBron James, que marcou 35 pontos em virada épica no TD Garden.',
        category_id: catMap.esportes,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2970,
        reading_time: 3,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // CULTURA
      {
        title: 'Museu da Língua Portuguesa Reabre com Nova Exposição Interativa',
        subtitle: 'Instituição paulista inaugura mostra sobre evolução digital da comunicação',
        slug: 'museu-lingua-portuguesa-reabre-exposicao-digital',
        content: '<h2>Reabertura Aguardada</h2><p>O Museu da Língua Portuguesa, na Estação da Luz, em São Paulo, reabriu suas portas com uma nova exposição permanente que explora a evolução digital da comunicação em português.</p><h3>Tecnologia e Interação</h3><p>A nova mostra conta com recursos de realidade aumentada, instalações interativas e um laboratório de linguagem digital onde visitantes podem experimentar tradutores automáticos e assistentes virtuais.</p><h3>Preservação Cultural</h3><p>O museu também lançou um projeto de digitalização de documentos históricos, tornando acessível online um acervo de mais de 50 mil peças sobre a história da língua portuguesa no Brasil.</p>',
        excerpt: 'Museu da Língua Portuguesa reabre com exposição interativa sobre evolução digital da comunicação em português.',
        category_id: catMap.cultura,
        author_id: admin.id,
        status: 'published',
        is_featured: true,
        views_count: 2840,
        reading_time: 4,
        published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Festival de Inverno de Campos do Jordão Anuncia Programação 2025',
        subtitle: 'Evento traz 120 concertos com artistas nacionais e internacionais',
        slug: 'festival-inverno-campos-jordao-programacao-2025',
        content: '<h2>50ª Edição Especial</h2><p>O Festival de Inverno de Campos do Jordão anunciou a programação de sua 50ª edição, que acontecerá de 15 de junho a 31 de julho de 2025, com 120 concertos e shows em diversos espaços da cidade.</p><h3>Atrações Confirmadas</h3><p>Entre os destaques estão a Orquestra Sinfônica do Estado de São Paulo, o pianista Nelson Freire, a cantora Maria Bethânia e apresentações especiais da Orquestra Filarmônica de Berlim.</p><h3>Democratização Cultural</h3><p>30% dos concertos terão entrada gratuita, mantendo a tradição de democratizar o acesso à música erudita. Os ingressos para os demais eventos começam a ser vendidos em março.</p>',
        excerpt: 'Festival de Inverno de Campos do Jordão celebra 50 anos com programação especial de 120 concertos e shows.',
        category_id: catMap.cultura,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 1920,
        reading_time: 3,
        published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Cinema Nacional Bate Recorde de Público em 2024',
        subtitle: 'Filmes brasileiros atraem 45 milhões de espectadores aos cinemas',
        slug: 'cinema-nacional-recorde-publico-2024',
        content: '<h2>Ano Histórico</h2><p>O cinema brasileiro bateu recorde de público em 2024, atraindo mais de 45 milhões de espectadores às salas de cinema, um crescimento de 35% em relação ao ano anterior.</p><h3>Sucessos de Bilheteria</h3><p>Os filmes "Minha Vida em Marte", "Cidade Invisível" e "O Auto da Compadecida 2" lideraram as bilheterias, provando a força da produção nacional junto ao público brasileiro.</p><h3>Investimentos Crescentes</h3><p>O setor recebeu R$ 850 milhões em investimentos públicos e privados, permitindo a produção de 160 longas-metragens nacionais, o maior número da última década.</p>',
        excerpt: 'Cinema brasileiro bate recorde histórico com 45 milhões de espectadores em 2024, crescimento de 35%.',
        category_id: catMap.cultura,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 3210,
        reading_time: 3,
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Bienal de Arte de São Paulo Revela Lista de Curadores para 2026',
        subtitle: 'Edição será a primeira com curadoria 100% brasileira e indígena',
        slug: 'bienal-arte-sao-paulo-curadores-2026',
        content: '<h2>Marco Histórico</h2><p>A Fundação Bienal de São Paulo anunciou que a 36ª edição do evento, marcada para 2026, será a primeira da história a contar com curadoria 100% brasileira e com representação indígena na coordenação artística.</p><h3>Nova Abordagem Curatorial</h3><p>O time curatorial é formado por cinco profissionais de diferentes regiões do país, incluindo dois curadores indígenas, marcando uma mudança paradigmática na concepção da maior mostra de arte contemporânea da América Latina.</p><h3>Tema Central</h3><p>A mostra terá como tema "Raízes e Resistências: Artes Originárias na Contemporaneidade", explorando conexões entre tradições ancestrais e expressões artísticas contemporâneas.</p>',
        excerpt: 'Bienal de São Paulo 2026 será a primeira com curadoria 100% brasileira e indígena, focando em artes originárias.',
        category_id: catMap.cultura,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2650,
        reading_time: 4,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // CIDADES
      {
        title: 'São Paulo Inaugura Maior Parque Linear da América Latina',
        subtitle: 'Parque do Tietê conecta 42 km ao longo do rio principal da cidade',
        slug: 'sao-paulo-inaugura-maior-parque-linear-tiete',
        content: '<h2>Transformação Urbana</h2><p>A Prefeitura de São Paulo inaugurou oficialmente o Parque Linear do Tietê, que se estende por 42 quilômetros ao longo do rio, tornando-se o maior parque linear da América Latina.</p><h3>Benefícios Ambientais</h3><p>O projeto inclui 2.500 hectares de área verde, ciclovia, pistas de caminhada, equipamentos de ginástica e áreas de contemplação. A iniciativa deve reduzir a temperatura da cidade em até 2°C nas regiões próximas.</p><h3>Revitalização do Rio</h3><p>Além do parque, o projeto incluiu tratamento das águas do Tietê e criação de habitat para fauna urbana, marcando uma nova fase na relação da cidade com seus recursos hídricos.</p>',
        excerpt: 'São Paulo inaugura Parque Linear do Tietê de 42 km, maior da América Latina, transformando paisagem urbana.',
        category_id: catMap.cidades,
        author_id: admin.id,
        status: 'published',
        is_featured: true,
        views_count: 4680,
        reading_time: 4,
        published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Rio de Janeiro Implementa Sistema de Bike Sharing Elétrico',
        subtitle: 'Cidade ganha 5 mil bicicletas elétricas em 200 estações espalhadas',
        slug: 'rio-janeiro-implementa-bike-sharing-eletrico',
        content: '<h2>Mobilidade Sustentável</h2><p>O Rio de Janeiro lançou seu novo sistema de bike sharing elétrico, com 5 mil bicicletas distribuídas em 200 estações estrategicamente posicionadas pela cidade.</p><h3>Cobertura Abrangente</h3><p>O sistema conecta as zonas Sul, Norte e Centro da cidade, incluindo pontos turísticos como Copacabana, Ipanema, Centro Histórico e Maracanã, facilitando tanto o deslocamento de moradores quanto de turistas.</p><h3>Tecnologia Integrada</h3><p>As bicicletas contam com GPS, sistema antifurto e aplicativo integrado com outros modais de transporte público, permitindo planejamento multimodal de viagens pela cidade.</p>',
        excerpt: 'Rio de Janeiro lança sistema de bike sharing com 5 mil bicicletas elétricas conectando principais regiões da cidade.',
        category_id: catMap.cidades,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 3240,
        reading_time: 3,
        published_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Curitiba Recebe Prêmio de Cidade Mais Sustentável das Américas',
        subtitle: 'Capital paranaense é reconhecida por políticas ambientais inovadoras',
        slug: 'curitiba-premio-cidade-sustentavel-americas',
        content: '<h2>Reconhecimento Internacional</h2><p>Curitiba foi eleita a Cidade Mais Sustentável das Américas pelo Conselho Mundial de Cidades Sustentáveis, em reconhecimento às suas políticas ambientais e de qualidade de vida urbana.</p><h3>Políticas Premiadas</h3><p>O prêmio destaca iniciativas como o sistema integrado de transporte público, programas de reciclagem inovadores, criação de parques urbanos e políticas de construção verde que servem de modelo para outras cidades.</p><h3>Impacto Regional</h3><p>Curitiba compete agora ao título mundial, representando a América Latina na categoria de cidades médias. O resultado será anunciado na Conferência Mundial do Clima de 2025.</p>',
        excerpt: 'Curitiba é eleita Cidade Mais Sustentável das Américas por políticas ambientais e qualidade de vida inovadoras.',
        category_id: catMap.cidades,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2780,
        reading_time: 3,
        published_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Salvador Inicia Revitalização do Centro Histórico com Tecnologia 5G',
        subtitle: 'Projeto piloto traz internet ultrarrápida para região do Pelourinho',
        slug: 'salvador-revitalizacao-centro-historico-5g',
        content: '<h2>Patrimônio Digital</h2><p>Salvador iniciou um projeto pioneiro de revitalização do Centro Histórico que combina restauração arquitetônica com implementação de tecnologia 5G, tornando o Pelourinho a primeira área histórica do Brasil com internet ultrarrápida.</p><h3>Turismo Inteligente</h3><p>O projeto inclui QR codes em pontos históricos, tours virtuais em realidade aumentada e aplicativo interativo que conta a história de cada local através de inteligência artificial.</p><h3>Desenvolvimento Econômico</h3><p>A iniciativa busca atrair empreendedores de tecnologia para a região, criando um hub de inovação que respeita e valoriza o patrimônio histórico-cultural da primeira capital do Brasil.</p>',
        excerpt: 'Salvador revitaliza Centro Histórico com tecnologia 5G, criando primeira área histórica brasileira com internet ultrarrápida.',
        category_id: catMap.cidades,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 2450,
        reading_time: 4,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      
      // TECNOLOGIA
      {
        title: 'IA Generativa Revoluciona Educação Brasileira em 2025',
        subtitle: 'Escolas públicas implementam assistentes virtuais personalizados',
        slug: 'ia-generativa-revoluciona-educacao-brasileira',
        content: '<h2>Transformação Educacional</h2><p>O Ministério da Educação lançou programa nacional que implementa assistentes de IA generativa em 15 mil escolas públicas, personalizando o aprendizado para cada estudante brasileiro.</p><h3>Personalização do Ensino</h3><p>Os sistemas de IA adaptam conteúdo, ritmo e metodologia de acordo com o perfil de cada aluno, identificando dificuldades e potencializando habilidades individuais através de análise contínua de desempenho.</p><h3>Resultados Iniciais</h3><p>Escolas piloto registraram melhoria de 40% no desempenho em matemática e 35% em português, além de redução significativa na evasão escolar entre estudantes do ensino médio.</p>',
        excerpt: 'Programa nacional implementa IA generativa em 15 mil escolas públicas, personalizando educação para cada estudante.',
        category_id: catMap.tecnologia,
        author_id: admin.id,
        status: 'published',
        is_featured: true,
        views_count: 6420,
        reading_time: 4,
        published_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        title: 'Startup Brasileira Desenvolve Chip Quântico Nacional',
        subtitle: 'Tecnologia promete revolucionar computação e segurança cibernética',
        slug: 'startup-brasileira-chip-quantico-nacional',
        content: '<h2>Inovação Nacional</h2><p>A startup paulista QuantumBR desenvolveu o primeiro chip quântico totalmente nacional, capaz de processar 128 qubits e prometendo revolucionar a computação e segurança cibernética no país.</p><h3>Aplicações Estratégicas</h3><p>O chip será usado inicialmente em sistemas bancários para criptografia ultra-segura e em centros de pesquisa para simulações complexas. O governo já sinalizou interesse em aplicações para defesa nacional.</p><h3>Mercado Bilionário</h3><p>A empresa recebeu aporte de R$ 500 milhões de fundos de venture capital e planeja produção em massa até 2026, positioning o Brasil entre os poucos países com tecnologia quântica própria.</p>',
        excerpt: 'Startup brasileira cria primeiro chip quântico nacional de 128 qubits, revolucionando computação e segurança.',
        category_id: catMap.tecnologia,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 4580,
        reading_time: 4,
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Meta Anuncia Datacenter Sustentável no Brasil com Energia Solar',
        subtitle: 'Investimento de US$ 2 bilhões criará maior centro de dados da América Latina',
        slug: 'meta-datacenter-sustentavel-brasil-energia-solar',
        content: '<h2>Investimento Bilionário</h2><p>A Meta anunciou investimento de US$ 2 bilhões na construção do maior datacenter sustentável da América Latina, localizado no interior de São Paulo e totalmente alimentado por energia solar.</p><h3>Sustentabilidade Total</h3><p>O complexo contará com fazenda solar de 500 MW, sistema de resfriamento natural e tecnologias de reutilização de água, estabelecendo novo padrão mundial de eficiência energética em datacenters.</p><h3>Impacto Econômico</h3><p>O projeto gerará 5 mil empregos diretos durante a construção e 800 permanentes na operação, além de impulsionar o ecossistema tecnológico regional e atrair outras big techs para o país.</p>',
        excerpt: 'Meta investe US$ 2 bilhões em datacenter sustentável no Brasil, maior da América Latina com energia 100% solar.',
        category_id: catMap.tecnologia,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 3890,
        reading_time: 4,
        published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Robôs Médicos Brasileiros Realizam Primeira Cirurgia Autônoma',
        subtitle: 'Sistema desenvolvido pela USP opera com precisão 300% superior',
        slug: 'robos-medicos-brasileiros-primeira-cirurgia-autonoma',
        content: '<h2>Marco da Medicina</h2><p>Robôs cirúrgicos desenvolvidos pela USP em parceria com o Hospital das Clínicas realizaram a primeira cirurgia totalmente autônoma do Brasil, removendo tumor cerebral com precisão 300% superior à humana.</p><h3>Tecnologia Avançada</h3><p>O sistema combina IA, visão computacional 8K e braços robóticos com precisão submilimétrica, permitindo cirurgias minimamente invasivas em áreas críticas do cérebro anteriormente inacessíveis.</p><h3>Futuro da Medicina</h3><p>A tecnologia será expandida para cirurgias cardíacas e neurológicas complexas, posicionando o Brasil como líder mundial em robótica médica e atraindo pacientes internacionais.</p>',
        excerpt: 'Robôs médicos brasileiros realizam primeira cirurgia autônoma do país com precisão 300% superior à humana.',
        category_id: catMap.tecnologia,
        author_id: admin.id,
        status: 'published',
        is_featured: false,
        views_count: 5720,
        reading_time: 5,
        published_at: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString()
      }
    ];

    console.log(`🔄 Inserindo ${articles.length} artigos...`);
    let insertedCount = 0;
    let errorCount = 0;

    for (const article of articles) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert([article]);

        if (error) {
          throw error;
        }

        console.log(`✅ Artigo inserido: "${article.title}"`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Erro ao inserir artigo "${article.title}":`, error.message);
        errorCount++;
      }
    }

    // Inserir alguns leads também
    const leads = [
      {
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-1111',
        source: 'newsletter',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Carlos Santos',
        email: 'carlos.santos@gmail.com',
        phone: '(21) 88888-2222',
        source: 'newsletter',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Mariana Costa',
        email: 'mariana.costa@yahoo.com',
        phone: '(31) 77777-3333',
        source: 'contato',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Roberto Lima',
        email: 'roberto.lima@hotmail.com',
        phone: '(85) 66666-4444',
        source: 'newsletter',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Julia Ferreira',
        email: 'julia.ferreira@outlook.com',
        phone: '(47) 55555-5555',
        source: 'contato',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    console.log('🔄 Inserindo leads...');
    for (const lead of leads) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert([lead]);

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }
        console.log(`✅ Lead inserido: ${lead.name}`);
      } catch (error) {
        console.log(`⚠️  Lead já existe: ${lead.name}`);
      }
    }

    console.log('\n🎉 ================================');
    console.log('🎉 POPULAÇÃO CONCLUÍDA!');
    console.log('🎉 ================================');
    console.log(`✅ ${insertedCount} artigos inseridos com sucesso`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} artigos com erro`);
    }

    // Verificação final
    await generateFinalReport();

    return insertedCount;
  } catch (error) {
    console.error('❌ Erro durante população:', error.message);
    return 0;
  }
}

async function generateFinalReport() {
  console.log('\n📊 RELATÓRIO FINAL:');
  
  try {
    // Contar artigos por categoria
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true);

    for (const category of categories) {
      const { data: articles, count } = await supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('category_id', category.id)
        .eq('status', 'published');

      console.log(`   📰 ${category.name}: ${count || 0} artigos`);
    }

    // Total de visualizações
    const { data: allArticles } = await supabase
      .from('articles')
      .select('views_count')
      .eq('status', 'published');

    const totalViews = allArticles.reduce((sum, article) => sum + (article.views_count || 0), 0);
    console.log(`   👁️  Total de visualizações: ${totalViews.toLocaleString()} views`);

    // Leads
    const { data: leads, count: leadsCount } = await supabase
      .from('leads')
      .select('id', { count: 'exact' });

    console.log(`   👥 Total de leads: ${leadsCount || 0} leads`);

    // Artigo mais visualizado
    const { data: topArticle } = await supabase
      .from('articles')
      .select('title, views_count')
      .eq('status', 'published')
      .order('views_count', { ascending: false })
      .limit(1)
      .single();

    if (topArticle) {
      console.log(`   🏆 Artigo mais visto: "${topArticle.title}" (${topArticle.views_count} views)`);
    }

  } catch (error) {
    console.log('⚠️  Erro ao gerar relatório:', error.message);
  }
}

async function main() {
  console.log('🚀 POPULANDO BANCO DE DADOS - PORTAL DE NOTÍCIAS');
  console.log('===================================================\n');

  // Testar conexão
  const connected = await testConnection();
  if (!connected) {
    console.log('\n💡 Instruções:');
    console.log('1. Certifique-se de que o Supabase está configurado');
    console.log('2. Configure o arquivo .env.local');
    process.exit(1);
  }

  // Verificar dados existentes
  const existingData = await checkExistingData();
  if (!existingData) {
    process.exit(1);
  }

  if (existingData.articleCount > 0) {
    console.log(`\n⚠️  Já existem ${existingData.articleCount} artigos no banco.`);
    console.log('Este script adicionará novos artigos sem remover os existentes.\n');
  }

  // Popular dados
  const inserted = await populateArticles();

  if (inserted > 0) {
    console.log('\n🎉 SUCESSO!');
    console.log('==================');
    console.log('✅ Banco de dados populado com sucesso!');
    console.log('✅ Agora você pode testar o site e dashboard admin');
    console.log('\n💡 Próximos passos:');
    console.log('1. Acesse http://localhost:3000 para ver o site público');
    console.log('2. Acesse http://localhost:3000/admin para ver o dashboard');
    console.log('3. Teste a funcionalidade de busca e filtros');
  } else {
    console.log('\n❌ Nenhum artigo foi inserido.');
    console.log('Verifique os erros acima e tente novamente.');
  }
}

// Executar script
main().catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});
