import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// USUÁRIO ADMIN TEMPORÁRIO - REMOVER EM PRODUÇÃO COM SUPABASE REAL
const TEMP_ADMIN_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@portalnoticias.com.br',
  password_hash: '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.', // admin123
  name: 'Administrador',
  role: 'admin',
  bio: 'Administrador do Portal de Notícias',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// CATEGORIAS E ARTIGOS MOCK PARA DESENVOLVIMENTO
const MOCK_CATEGORIES = [
  { id: '1', name: 'Política', slug: 'politica', description: 'Notícias sobre política nacional e local', color: '#DC2626', icon: 'Vote', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Economia', slug: 'economia', description: 'Mercado financeiro, negócios, indicadores econômicos e análises...', color: '#059669', icon: 'TrendingUp', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Esportes', slug: 'esportes', description: 'Resultados, análises e novidades do mundo esportivo nacional e...', color: '#7C3AED', icon: 'Trophy', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Cultura', slug: 'cultura', description: 'Arte, música, literatura, cinema e eventos culturais do Brasil', color: '#3B82F6', icon: 'Palette', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Cidades', slug: 'cidades', description: 'Notícias locais, infraestrutura urbana e qualidade de vida das cidades...', color: '#0EA5E9', icon: 'MapPin', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação e tecnologia', color: '#D97706', icon: 'Laptop', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', name: 'Saúde', slug: 'saude', description: 'Notícias desta categoria', color: '#16A34A', icon: 'Heart', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Eventos', slug: 'eventos', description: 'Cobertura dos principais acontecimentos sociais, culturais...', color: '#3B82F6', icon: 'Calendar', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', name: 'Policial', slug: 'policial', description: 'Notícias policiais', color: '#DC2626', icon: 'Shield', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const MOCK_ARTICLES = [
  // Política - 4 artigos
  { id: 'art-1', title: 'Congresso Aprova Nova Lei de Transparência Pública', excerpt: 'Projeto estabelece regras mais rígidas para divulgação de gastos governamentais em todos os níveis.', slug: 'congresso-aprova-nova-lei', category_id: '1', status: 'published', views_count: 2850, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 2*60*60*1000).toISOString() },
  { id: 'art-1b', title: 'STF Julga Constitucionalidade do Marco Temporal', excerpt: 'Supremo analisa demarcação de terras indígenas em sessão histórica que pode redefinir políticas.', slug: 'stf-julga-marco-temporal', category_id: '1', status: 'published', views_count: 1920, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 6*60*60*1000).toISOString() },
  { id: 'art-1c', title: 'Eleições 2026: TSE Define Calendário', excerpt: 'Tribunal Superior Eleitoral estabelece cronograma para próximo pleito presidencial com novas regras.', slug: 'eleicoes-2026-tse-calendario', category_id: '1', status: 'published', views_count: 1560, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
  { id: 'art-1d', title: 'Reforma Ministerial Movimenta Cenário Político', excerpt: 'Presidente promove mudanças em quatro ministérios estratégicos buscando fortalecer governabilidade.', slug: 'reforma-ministerial-cenario-politico', category_id: '1', status: 'published', views_count: 2340, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
  
  // Economia - 4 artigos
  { id: 'art-2a', title: 'Banco Central Mantém Taxa Selic em 12,75%', excerpt: 'Copom decide por unanimidade manter juros, sinalizando possível fim do ciclo de alta dos juros básicos.', slug: 'banco-central-mantem-selic', category_id: '2', status: 'published', views_count: 3420, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 4*60*60*1000).toISOString() },
  { id: 'art-2b', title: 'PIB Cresce 1,2% e Supera Expectativas', excerpt: 'Resultado do terceiro trimestre indica recuperação mais robusta da economia brasileira.', slug: 'pib-cresce-supera-expectativas', category_id: '2', status: 'published', views_count: 2750, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 12*60*60*1000).toISOString() },
  { id: 'art-2c', title: 'Dólar Recua para R$ 5,20 com Aprovação de Reformas', excerpt: 'Moeda americana cai após Congresso aprovar medidas estruturais, sinalizando confiança dos investidores.', slug: 'dolar-recua-aprovacao-reformas', category_id: '2', status: 'published', views_count: 1890, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
  { id: 'art-2d', title: 'Inflação de Alimentos Desacelera pelo Terceiro Mês', excerpt: 'IPCA de alimentos registra menor alta com queda nos preços de carnes e proteínas básicas.', slug: 'inflacao-alimentos-desacelera', category_id: '2', status: 'published', views_count: 2340, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  
  // Esportes - 4 artigos
  { id: 'art-3a', title: 'Palmeiras Vence Clássico e Assume Liderança', excerpt: 'Verdão derrota rival por 2 a 1 e assume liderança isolada do Campeonato Brasileiro com 45 pontos.', slug: 'palmeiras-vence-classico-lidera', category_id: '3', status: 'published', views_count: 5240, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 3*60*60*1000).toISOString() },
  { id: 'art-3b', title: 'Vôlei Feminino: Brasil Garante Vaga na Final', excerpt: 'Seleção brasileira feminina de vôlei derrota Sérvia e garante vaga na final do Mundial.', slug: 'volei-feminino-brasil-final', category_id: '3', status: 'published', views_count: 3680, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 6*60*60*1000).toISOString() },
  { id: 'art-3c', title: 'Fórmula 1: Verstappen Vence GP do Brasil', excerpt: 'Max Verstappen vence GP do Brasil em Interlagos e está a um passo do tetracampeonato mundial.', slug: 'verstappen-vence-gp-brasil', category_id: '3', status: 'published', views_count: 4150, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 18*60*60*1000).toISOString() },
  { id: 'art-3d', title: 'NBA: Lakers Vencem Celtics em Jogo Épico', excerpt: 'LeBron James marca 35 pontos e comanda virada histórica dos Lakers sobre os Celtics no TD Garden.', slug: 'lakers-vencem-celtics-lebron', category_id: '3', status: 'published', views_count: 2970, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  
  // Cultura - 4 artigos
  { id: 'art-4a', title: 'Museu da Língua Portuguesa Reabre com Nova Exposição', excerpt: 'Instituição paulista inaugura mostra interativa sobre evolução digital da comunicação em português.', slug: 'museu-lingua-portuguesa-reabre', category_id: '4', status: 'published', views_count: 2840, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 5*60*60*1000).toISOString() },
  { id: 'art-4b', title: 'Festival de Inverno de Campos do Jordão Anuncia Programação', excerpt: 'Festival celebra 50 anos com programação especial de 120 concertos e shows em 2025.', slug: 'festival-inverno-campos-jordao-2025', category_id: '4', status: 'published', views_count: 1920, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 10*60*60*1000).toISOString() },
  { id: 'art-4c', title: 'Cinema Nacional Bate Recorde de Público em 2024', excerpt: 'Filmes brasileiros atraem 45 milhões de espectadores, crescimento de 35% em relação ao ano anterior.', slug: 'cinema-nacional-recorde-2024', category_id: '4', status: 'published', views_count: 3210, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 24*60*60*1000).toISOString() },
  { id: 'art-4d', title: 'Bienal de Arte Revela Curadores para 2026', excerpt: 'Edição será a primeira com curadoria 100% brasileira e indígena, focando em artes originárias.', slug: 'bienal-arte-curadores-2026', category_id: '4', status: 'published', views_count: 2650, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
  
  // Cidades - 4 artigos
  { id: 'art-5a', title: 'São Paulo Inaugura Maior Parque Linear da América Latina', excerpt: 'Parque do Tietê conecta 42 km transformando paisagem urbana e reduzindo temperatura da cidade.', slug: 'sao-paulo-parque-linear-tiete', category_id: '5', status: 'published', views_count: 4680, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 1*60*60*1000).toISOString() },
  { id: 'art-5b', title: 'Rio Implementa Sistema de Bike Sharing Elétrico', excerpt: 'Cidade ganha 5 mil bicicletas elétricas conectando principais regiões da cidade.', slug: 'rio-bike-sharing-eletrico', category_id: '5', status: 'published', views_count: 3240, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 7*60*60*1000).toISOString() },
  { id: 'art-5c', title: 'Curitiba Recebe Prêmio de Cidade Mais Sustentável', excerpt: 'Capital paranaense é reconhecida por políticas ambientais e qualidade de vida inovadoras.', slug: 'curitiba-premio-sustentavel', category_id: '5', status: 'published', views_count: 2780, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 15*60*60*1000).toISOString() },
  { id: 'art-5d', title: 'Salvador Revitaliza Centro Histórico com Tecnologia 5G', excerpt: 'Projeto pioneiro transforma Pelourinho na primeira área histórica brasileira com internet ultrarrápida.', slug: 'salvador-centro-historico-5g', category_id: '5', status: 'published', views_count: 2450, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  
  // Tecnologia - 4 artigos
  { id: 'art-6a', title: 'IA Generativa Revoluciona Educação Brasileira', excerpt: 'Programa nacional implementa IA generativa em 15 mil escolas públicas, personalizando educação.', slug: 'ia-generativa-educacao-brasileira', category_id: '6', status: 'published', views_count: 6420, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 30*60*1000).toISOString() },
  { id: 'art-6b', title: 'Startup Brasileira Desenvolve Chip Quântico', excerpt: 'Startup brasileira cria primeiro chip quântico nacional de 128 qubits, revolucionando computação.', slug: 'startup-chip-quantico-nacional', category_id: '6', status: 'published', views_count: 4580, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 4*60*60*1000).toISOString() },
  { id: 'art-6c', title: 'Meta Anuncia Datacenter Sustentável no Brasil', excerpt: 'Meta investe US$ 2 bilhões em datacenter sustentável, maior da América Latina com energia 100% solar.', slug: 'meta-datacenter-sustentavel-brasil', category_id: '6', status: 'published', views_count: 3890, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 14*60*60*1000).toISOString() },
  { id: 'art-6d', title: 'Robôs Médicos Realizam Primeira Cirurgia Autônoma', excerpt: 'Robôs médicos brasileiros realizam primeira cirurgia autônoma com precisão 300% superior à humana.', slug: 'robos-medicos-cirurgia-autonoma', category_id: '6', status: 'published', views_count: 5720, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 29*60*60*1000).toISOString() },
  
  // Saúde - 2 artigos
  { id: 'art-7a', title: 'Nova Vacina Contra Dengue Aprovada pela Anvisa', excerpt: 'Anvisa aprova nova vacina contra dengue com eficácia de 95%, começa distribuição em março.', slug: 'nova-vacina-dengue-anvisa', category_id: '7', status: 'published', views_count: 4200, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 8*60*60*1000).toISOString() },
  { id: 'art-7b', title: 'SUS Implementa Telemedicina em Todo o País', excerpt: 'Sistema Único de Saúde lança plataforma nacional de telemedicina conectando 5 mil municípios.', slug: 'sus-telemedicina-nacional', category_id: '7', status: 'published', views_count: 3150, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 20*60*60*1000).toISOString() },
  
  // Eventos - 2 artigos
  { id: 'art-8a', title: 'Rock in Rio 2025 Anuncia Line-up Completo', excerpt: 'Festival anuncia line-up com grandes nomes internacionais e valorização de artistas nacionais.', slug: 'rock-in-rio-2025-lineup', category_id: '8', status: 'published', views_count: 8900, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 12*60*60*1000).toISOString() },
  { id: 'art-8b', title: 'Feira de Tecnologia de São Paulo Bate Recorde', excerpt: 'Evento reúne 200 startups e atrai 50 mil visitantes interessados em inovações tecnológicas.', slug: 'feira-tecnologia-sao-paulo-recorde', category_id: '8', status: 'published', views_count: 2800, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 16*60*60*1000).toISOString() },
  
  // Policial - 2 artigos
  { id: 'art-9a', title: 'Operação Nacional Combate Crime Organizado', excerpt: 'PF deflagra operação em 12 estados contra organização criminosa, com 150 mandados cumpridos.', slug: 'operacao-nacional-crime-organizado', category_id: '9', status: 'published', views_count: 5400, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 6*60*60*1000).toISOString() },
  { id: 'art-9b', title: 'Polícia Civil Desarticula Esquema de Corrupção', excerpt: 'Operação prende 25 pessoas envolvidas em esquema de corrupção que desviou R$ 50 milhões.', slug: 'policia-civil-esquema-corrupcao', category_id: '9', status: 'published', views_count: 3600, author_name: 'Equipe Portal', created_at: new Date(Date.now() - 22*60*60*1000).toISOString() }
];

export const createClient = async () => {
  // Se as variáveis não estão configuradas, retorna um mock
  if (!supabaseUrl || !supabaseKey) {
    return {
      from: (table: string) => ({
        select: (columns = '*') => ({
          eq: (column: string, value: any) => ({
            eq: (column2: string, value2: any) => ({
              single: () => {
                // Login de usuário admin temporário - email + is_active
                if (table === 'users' && 
                    column === 'email' && value === 'admin@portalnoticias.com.br' &&
                    column2 === 'is_active' && value2 === true) {
                  return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
                }
                // Verificação por ID (para /api/auth/verify)
                if (table === 'users' && 
                    column === 'id' && value === TEMP_ADMIN_USER.id &&
                    column2 === 'is_active' && value2 === true) {
                  return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
                }
                return Promise.resolve({ data: null, error: new Error('User not found') });
              }
            }),
            single: () => {
              // Fallback para queries com apenas um .eq()
              if (table === 'users' && column === 'email' && value === 'admin@portalnoticias.com.br') {
                return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
              }
              if (table === 'users' && column === 'id' && value === TEMP_ADMIN_USER.id) {
                return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
              }
              return Promise.resolve({ data: null, error: new Error('User not found') });
            }
          }),
          single: () => {
            if (table === 'users') {
              return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
            }
            return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
          },
          order: (orderColumn: string) => {
            // Retorna um objeto que pode ser chamado diretamente ou com limit()
            const handler = {
              then: (resolve: Function) => {
                if (table === 'users') {
                  return resolve({ data: [TEMP_ADMIN_USER], error: null });
                }
                // Para categorias com select especial (include articles count)
                if (table === 'categories' && typeof columns === 'string' && columns.includes('articles:articles(count)')) {
                  const categoriesWithCount = MOCK_CATEGORIES.map(cat => {
                    const articleCount = MOCK_ARTICLES.filter(art => art.category_id === cat.id && art.status === 'published').length;
                    return {
                      ...cat,
                      articles: [{ count: articleCount }]
                    };
                  });
                  return resolve({ data: categoriesWithCount, error: null });
                }
                if (table === 'categories') {
                  return resolve({ data: MOCK_CATEGORIES, error: null });
                }
                return resolve({ data: [], error: null });
              },
              limit: () => ({
                then: (resolve: Function) => {
                  if (table === 'users') {
                    return resolve({ data: [TEMP_ADMIN_USER], error: null });
                  }
                  // Para categorias com select especial (include articles count)
                  if (table === 'categories' && typeof columns === 'string' && columns.includes('articles:articles(count)')) {
                    const categoriesWithCount = MOCK_CATEGORIES.map(cat => {
                      const articleCount = MOCK_ARTICLES.filter(art => art.category_id === cat.id && art.status === 'published').length;
                      return {
                        ...cat,
                        articles: [{ count: articleCount }]
                      };
                    });
                    return resolve({ data: categoriesWithCount, error: null });
                  }
                  if (table === 'categories') {
                    return resolve({ data: MOCK_CATEGORIES, error: null });
                  }
                  return resolve({ data: [], error: null });
                }
              })
            };
            
            return handler;
          },
          limit: () => {
            if (table === 'users') {
              return Promise.resolve({ data: [TEMP_ADMIN_USER], error: null });
            }
            return Promise.resolve({ data: [], error: null });
          }
        }),
        insert: (data: any) => ({
          select: () => ({
            single: () => {
              if (table === 'articles') {
                // Mock para inserção de artigo
                const mockArticle = {
                  id: '00000000-0000-0000-0000-' + Date.now(),
                  ...data[0],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                return Promise.resolve({ data: mockArticle, error: null });
              }
              return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
            }
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
            })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error('Supabase not configured') })
        })
      })
    } as any;
  }

  const cookieStore = await cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
