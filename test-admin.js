// Script de teste básico para verificar se as páginas admin estão respondendo
const http = require('http');

const testPages = [
  { path: '/', name: 'Homepage' },
  { path: '/admin/login', name: 'Login Admin' },
];

function testPage(path, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      console.log(`✓ ${name} (${path}): Status ${res.statusCode}`);
      resolve({ path, name, status: res.statusCode });
    });

    req.on('error', (err) => {
      console.log(`✗ ${name} (${path}): Error - ${err.message}`);
      resolve({ path, name, error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`✗ ${name} (${path}): Timeout`);
      resolve({ path, name, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🧪 Testando páginas do Portal de Notícias...\n');
  
  const results = [];
  for (const page of testPages) {
    const result = await testPage(page.path, page.name);
    results.push(result);
  }

  console.log('\n📊 Resumo dos testes:');
  const successful = results.filter(r => r.status && r.status < 400).length;
  console.log(`${successful}/${results.length} páginas respondendo corretamente`);
  
  if (successful === results.length) {
    console.log('\n🎉 Todos os testes passaram! O sistema está funcionando.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os detalhes acima.');
  }
}

runTests();
