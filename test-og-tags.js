require('dotenv').config({ path: '.env.local' })

async function testOpenGraphTags() {
  try {
    console.log('=== TESTANDO META TAGS OPEN GRAPH ===\n')
    
    // URL base (altere conforme necessário)
    const baseUrl = 'http://localhost:3000' // ou sua URL de produção
    
    // Primeiro, vamos buscar um artigo para testar
    console.log('1. Buscando artigo de teste...')
    const articlesResponse = await fetch(`${baseUrl}/api/articles?status=published&limit=1`)
    
    if (!articlesResponse.ok) {
      console.error('❌ Erro ao buscar artigos:', articlesResponse.status)
      return
    }
    
    const articlesData = await articlesResponse.json()
    const articles = articlesData.data || []
    
    if (articles.length === 0) {
      console.error('❌ Nenhum artigo encontrado para teste')
      return
    }
    
    const testArticle = articles[0]
    const articleUrl = `${baseUrl}/noticia/${testArticle.slug}`
    
    console.log(`✅ Artigo de teste encontrado:`)
    console.log(`   Título: ${testArticle.title}`)
    console.log(`   Slug: ${testArticle.slug}`)
    console.log(`   URL: ${articleUrl}`)
    console.log(`   Imagem: ${testArticle.featured_image || 'N/A'}`)
    
    console.log('\n2. Testando carregamento da página...')
    
    // Tentar acessar a página do artigo
    const pageResponse = await fetch(articleUrl)
    
    if (!pageResponse.ok) {
      console.error('❌ Erro ao carregar página:', pageResponse.status)
      return
    }
    
    const pageHtml = await pageResponse.text()
    
    console.log('✅ Página carregada com sucesso!')
    
    console.log('\n3. Verificando meta tags Open Graph...')
    
    // Extrair meta tags importantes
    const metaTags = {
      'og:title': pageHtml.match(/<meta property="og:title" content="([^"]*)"/) || [],
      'og:description': pageHtml.match(/<meta property="og:description" content="([^"]*)"/) || [],
      'og:image': pageHtml.match(/<meta property="og:image" content="([^"]*)"/) || [],
      'og:url': pageHtml.match(/<meta property="og:url" content="([^"]*)"/) || [],
      'og:type': pageHtml.match(/<meta property="og:type" content="([^"]*)"/) || [],
      'og:site_name': pageHtml.match(/<meta property="og:site_name" content="([^"]*)"/) || [],
      'article:author': pageHtml.match(/<meta property="article:author" content="([^"]*)"/) || []
    }
    
    console.log('\n=== RESULTADO DAS META TAGS ===')
    
    let allTagsFound = true
    
    Object.entries(metaTags).forEach(([tag, match]) => {
      if (match.length > 1) {
        console.log(`✅ ${tag}: ${match[1]}`)
      } else {
        console.log(`❌ ${tag}: NÃO ENCONTRADA`)
        allTagsFound = false
      }
    })
    
    console.log('\n=== TESTE PARA WHATSAPP ===')
    
    if (allTagsFound) {
      console.log('✅ Todas as meta tags foram encontradas!')
      console.log('✅ O WhatsApp deve conseguir exibir a imagem e informações do artigo')
      console.log('\n📋 Para testar no WhatsApp:')
      console.log(`1. Compartilhe este link: ${articleUrl}`)
      console.log('2. Aguarde alguns segundos para o WhatsApp processar')
      console.log('3. A imagem e o título devem aparecer no preview')
    } else {
      console.log('❌ Algumas meta tags estão faltando')
      console.log('❌ O WhatsApp pode não exibir corretamente a imagem/informações')
    }
    
    console.log('\n=== DICAS DE DEBUG ===')
    console.log('• Teste com WhatsApp Web: https://web.whatsapp.com')
    console.log('• Teste com Facebook Debugger: https://developers.facebook.com/tools/debug/')
    console.log('• Aguarde até 24h para o cache do WhatsApp limpar após mudanças')
    
  } catch (error) {
    console.error('Erro durante o teste:', error.message)
  }
}

testOpenGraphTags()
