/**
 * Script de teste para funcionalidade de compartilhamentos
 * Execute este script com: node test-shares.js
 */

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisições
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { response, data };
    } catch (error) {
        console.error(`Erro na requisição para ${url}:`, error);
        return { error };
    }
}

// Teste 1: Buscar artigos disponíveis
async function testGetArticles() {
    console.log('\n=== TESTE 1: Buscar artigos ===');
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/articles?status=published&limit=3`);
    
    if (error) {
        console.log('❌ Erro ao buscar artigos:', error);
        return null;
    }
    
    if (response.ok && data.data && data.data.length > 0) {
        console.log('✅ Artigos encontrados:', data.data.length);
        console.log('Primeiro artigo:', {
            id: data.data[0].id,
            title: data.data[0].title.substring(0, 50) + '...'
        });
        return data.data[0].id; // Retorna ID do primeiro artigo para usar nos testes
    } else {
        console.log('❌ Nenhum artigo encontrado ou erro na resposta');
        return null;
    }
}

// Teste 2: Registrar compartilhamento
async function testShareArticle(articleId, platform) {
    console.log(`\n=== TESTE 2: Compartilhar artigo (${platform}) ===`);
    
    if (!articleId) {
        console.log('❌ ID do artigo não fornecido');
        return false;
    }
    
    const { response, data, error } = await makeRequest(
        `${BASE_URL}/api/articles/${articleId}/share`,
        {
            method: 'POST',
            body: JSON.stringify({ platform })
        }
    );
    
    if (error) {
        console.log('❌ Erro na requisição de compartilhamento:', error);
        return false;
    }
    
    console.log('Status da resposta:', response.status);
    console.log('Dados da resposta:', data);
    
    if (response.ok && data.success) {
        console.log(`✅ Compartilhamento registrado com sucesso no ${platform}`);
        return true;
    } else {
        console.log(`❌ Falha ao registrar compartilhamento no ${platform}`);
        return false;
    }
}

// Teste 3: Buscar estatísticas de compartilhamento
async function testGetShareAnalytics(period = 30) {
    console.log(`\n=== TESTE 3: Buscar analytics (${period} dias) ===`);
    
    const { response, data, error } = await makeRequest(`${BASE_URL}/api/analytics/shares?period=${period}`);
    
    if (error) {
        console.log('❌ Erro ao buscar analytics:', error);
        return false;
    }
    
    console.log('Status da resposta:', response.status);
    
    if (response.ok && data.data) {
        console.log('✅ Analytics recuperados com sucesso');
        console.log('Total de compartilhamentos:', data.data.totalShares);
        console.log('Por plataforma:', data.data.sharesByPlatform);
        console.log('Últimos 7 dias:', data.data.last7Days?.length || 0, 'registros');
        console.log('Top artigos:', data.data.topArticles?.length || 0, 'artigos');
        return true;
    } else {
        console.log('❌ Falha ao buscar analytics');
        console.log('Resposta:', data);
        return false;
    }
}

// Teste 4: Verificar página de insights (só testa se a rota está acessível)
async function testInsightsPage() {
    console.log('\n=== TESTE 4: Verificar página de insights ===');
    
    try {
        const response = await fetch(`${BASE_URL}/admin/insights/compartilhamentos`);
        
        if (response.ok) {
            console.log('✅ Página de insights acessível');
            console.log('Status:', response.status);
            return true;
        } else {
            console.log('❌ Página de insights inacessível');
            console.log('Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro ao acessar página de insights:', error.message);
        return false;
    }
}

// Teste 5: Testar exportação
async function testExportShares(period = 30) {
    console.log(`\n=== TESTE 5: Testar exportação (${period} dias) ===`);
    
    try {
        const response = await fetch(`${BASE_URL}/api/analytics/shares/export?period=${period}&format=csv`);
        
        if (response.ok) {
            console.log('✅ Export funcionando');
            console.log('Status:', response.status);
            console.log('Content-Type:', response.headers.get('content-type'));
            
            // Tentar ler o conteúdo (apenas primeiros 100 caracteres)
            const text = await response.text();
            console.log('Conteúdo (primeiros 100 chars):', text.substring(0, 100));
            return true;
        } else {
            console.log('❌ Export falhou');
            console.log('Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no export:', error.message);
        return false;
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 Iniciando testes da funcionalidade de compartilhamentos...');
    console.log('Base URL:', BASE_URL);
    
    const results = {
        articles: false,
        shares: [],
        analytics: false,
        insights: false,
        export: false
    };
    
    // Teste 1: Buscar artigos
    const articleId = await testGetArticles();
    results.articles = !!articleId;
    
    if (articleId) {
        // Teste 2: Compartilhar em diferentes plataformas
        const platforms = ['whatsapp', 'x', 'instagram', 'threads'];
        
        for (const platform of platforms) {
            const success = await testShareArticle(articleId, platform);
            results.shares.push({ platform, success });
            
            // Pequena pausa entre compartilhamentos
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Teste 3: Analytics
    results.analytics = await testGetShareAnalytics(30);
    
    // Teste 4: Insights page
    results.insights = await testInsightsPage();
    
    // Teste 5: Export
    results.export = await testExportShares(30);
    
    // Resumo dos resultados
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(50));
    
    console.log(`Busca de artigos: ${results.articles ? '✅' : '❌'}`);
    
    console.log('Compartilhamentos:');
    results.shares.forEach(({ platform, success }) => {
        console.log(`  - ${platform}: ${success ? '✅' : '❌'}`);
    });
    
    console.log(`Analytics API: ${results.analytics ? '✅' : '❌'}`);
    console.log(`Insights Page: ${results.insights ? '✅' : '❌'}`);
    console.log(`Export CSV: ${results.export ? '✅' : '❌'}`);
    
    // Cálculo da pontuação geral
    const totalTests = 2 + results.shares.length + 2; // articles + shares + analytics + insights + export
    const passedTests = Number(results.articles) + 
                       results.shares.filter(s => s.success).length + 
                       Number(results.analytics) + 
                       Number(results.insights) + 
                       Number(results.export);
    
    const scorePercentage = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n' + '='.repeat(50));
    console.log(`🎯 PONTUAÇÃO GERAL: ${passedTests}/${totalTests} (${scorePercentage}%)`);
    
    if (scorePercentage >= 80) {
        console.log('🎉 SISTEMA DE COMPARTILHAMENTOS: FUNCIONANDO CORRETAMENTE!');
    } else if (scorePercentage >= 50) {
        console.log('⚠️  SISTEMA DE COMPARTILHAMENTOS: FUNCIONANDO PARCIALMENTE');
    } else {
        console.log('🔴 SISTEMA DE COMPARTILHAMENTOS: PRECISA DE CORREÇÕES');
    }
    
    console.log('\n📝 PRÓXIMOS PASSOS:');
    
    if (!results.articles) {
        console.log('- Verifique se existem artigos publicados no banco de dados');
    }
    
    if (results.shares.some(s => !s.success)) {
        console.log('- Verifique a tabela article_shares no banco de dados');
        console.log('- Execute o script shares-schema.sql no Supabase');
    }
    
    if (!results.analytics) {
        console.log('- Verifique a API de analytics e conexão com o banco');
    }
    
    if (!results.insights) {
        console.log('- Verifique se o servidor está rodando na porta 3000');
        console.log('- Teste acessar http://localhost:3000/admin/insights/compartilhamentos');
    }
}

// Executar os testes
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runAllTests().catch(console.error);
} else {
    // Browser environment - só exporta as funções
    window.shareTests = {
        runAllTests,
        testGetArticles,
        testShareArticle,
        testGetShareAnalytics,
        testInsightsPage,
        testExportShares
    };
    console.log('Testes carregados! Execute shareTests.runAllTests() no console.');
}
