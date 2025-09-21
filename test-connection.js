const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/articles?limit=1',
  method: 'GET'
};

console.log('Testando conectividade com a aplicação...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Dados recebidos:', JSON.stringify(jsonData, null, 2));
      if (jsonData.data && jsonData.data.length > 0) {
        const article = jsonData.data[0];
        console.log(`\nArtigo encontrado: ${article.title}`);
        console.log(`Slug: ${article.slug}`);
        console.log(`URL para teste: http://localhost:3000/noticia/${article.slug}`);
      }
    } catch (error) {
      console.log('Erro ao parsear JSON:', error.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Erro na requisição: ${e.message}`);
  console.log('A aplicação Next.js está rodando? Tente executar "npm run dev" em outro terminal.');
});

req.setTimeout(5000, () => {
  console.log('Timeout - aplicação não respondeu em 5 segundos');
  req.destroy();
});

req.end();
