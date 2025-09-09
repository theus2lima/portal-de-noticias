const http = require('http');

const testLogin = () => {
  const postData = JSON.stringify({
    email: 'admin@portalnoticias.com.br',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🧪 Testando login...');
  console.log('📧 Email: admin@portalnoticias.com.br');
  console.log('🔐 Senha: admin123');
  console.log('');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log('📋 Response:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });

  req.write(postData);
  req.end();
};

// Aguardar 2 segundos para o servidor estar pronto
setTimeout(testLogin, 2000);
