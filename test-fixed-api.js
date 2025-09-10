require('dotenv').config({ path: '.env.local' })
const { default: fetch } = require('node-fetch')

async function testFixedAPI() {
  try {
    console.log('=== Testando API corrigida ===\n')
    
    // Buscar artigo específico da IA
    const slug = 'ia-generativa-revoluciona-educacao-brasileira-em-2025-1757538859121'
    
    console.log(`Testando artigo com slug: ${slug}`)
    
    const response = await fetch(`http://localhost:3000/api/articles/by-slug/${slug}`)
    
    if (!response.ok) {
      console.log(`❌ API retornou erro ${response.status}:`, response.statusText)
      const errorText = await response.text()
      console.log('Corpo da resposta:', errorText)
      return
    }
    
    const data = await response.json()
    
    if (data.data) {
      console.log('✅ Artigo encontrado!')
      console.log('Título:', data.data.title)
      console.log('Categoria:', data.data.category_name)
      console.log('Autor:', data.data.author_name)
      console.log('Status:', data.data.status)
      console.log('Content existe?', !!data.data.content)
      console.log('Content length:', data.data.content ? data.data.content.length : 0)
      
      if (data.data.content) {
        console.log('\n=== Preview do conteúdo ===')
        console.log(data.data.content.substring(0, 300) + '...')
        console.log('\n✅ PROBLEMA RESOLVIDO! O conteúdo está sendo retornado!')
      } else {
        console.log('\n❌ Conteúdo ainda está vazio')
      }
    } else {
      console.log('❌ Dados não encontrados na resposta')
      console.log('Resposta completa:', data)
    }
    
  } catch (err) {
    console.error('❌ Erro no teste:', err.message)
    
    if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando com "npm run dev"')
    }
  }
}

// Aguardar um pouco para o servidor reiniciar após as mudanças
setTimeout(testFixedAPI, 2000)
