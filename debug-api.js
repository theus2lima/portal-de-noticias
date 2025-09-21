require('dotenv').config({ path: '.env.local' })

async function testAPI() {
  try {
    console.log('=== TESTANDO API DE ARTIGOS ===\n')
    
    // Teste 1: Verificar se o servidor está rodando
    console.log('1. Testando conexão com o servidor local...')
    
    const testUrls = [
      'http://localhost:3000/api/articles?status=published&limit=10',
      'http://localhost:3000/api/categories'
    ]
    
    for (const url of testUrls) {
      console.log(`\nTestando: ${url}`)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        clearTimeout(timeoutId)
        
        console.log(`Status: ${response.status} ${response.statusText}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Resposta recebida:')
          console.log(JSON.stringify(data, null, 2))
        } else {
          console.log('Erro na resposta:', await response.text())
        }
        
      } catch (fetchError) {
        console.log('Erro ao fazer fetch:', fetchError.message)
        if (fetchError.name === 'AbortError') {
          console.log('⚠️  Timeout - servidor pode não estar rodando')
        }
      }
    }
    
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

testAPI()
