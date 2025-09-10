const http = require('http');

function testAPI(endpoint, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`\n✅ ${description}`);
                    console.log(`Status: ${res.statusCode}`);
                    console.log(`Endpoint: ${endpoint}`);
                    
                    if (jsonData.data && Array.isArray(jsonData.data)) {
                        console.log(`Artigos retornados: ${jsonData.data.length}`);
                        if (jsonData.data.length > 0) {
                            console.log(`Primeiro artigo: "${jsonData.data[0].title}"`);
                        }
                    }
                    
                    if (jsonData.pagination) {
                        console.log(`Paginação: ${jsonData.pagination.total} total, página ${jsonData.pagination.page}`);
                    }
                    
                    resolve(jsonData);
                } catch (error) {
                    console.error(`❌ Erro ao parsear JSON para ${description}:`, error.message);
                    console.log('Resposta raw:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Erro na requisição ${description}:`, error.message);
            reject(error);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🚀 Iniciando testes da API do Portal de Notícias...\n');
    
    const tests = [
        { endpoint: '/api/articles?limit=5', description: 'Buscar 5 artigos' },
        { endpoint: '/api/articles?limit=3&category=6', description: 'Buscar artigos de Tecnologia' },
        { endpoint: '/api/articles?search=brasil', description: 'Buscar artigos com "brasil"' },
        { endpoint: '/api/articles/by-slug/nova-lei-inteligencia-artificial-brasil', description: 'Buscar artigo específico por slug' },
        { endpoint: '/api/categories', description: 'Listar categorias' }
    ];

    for (const test of tests) {
        try {
            await testAPI(test.endpoint, test.description);
            await new Promise(resolve => setTimeout(resolve, 500)); // Pequena pausa entre testes
        } catch (error) {
            // Erro já foi logado na função testAPI
        }
    }
    
    console.log('\n🎉 Testes concluídos!');
    process.exit(0);
}

runTests();
