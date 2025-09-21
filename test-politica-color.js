require('dotenv').config({ path: '.env.local' })

async function testPoliticaColor() {
  try {
    console.log('=== TESTE DE COR DA CATEGORIA POLÍTICA ===\n')
    
    // Simular o que o frontend faz
    const baseUrl = 'http://localhost:3000'
    
    console.log('1. Buscando dados da categoria política...')
    const response = await fetch(`${baseUrl}/api/categories`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('Erro na API:', response.status, response.statusText)
      return
    }
    
    const data = await response.json()
    const categories = data.data || []
    const politica = categories.find(cat => cat.slug === 'politica' && cat.is_active)
    
    if (!politica) {
      console.error('❌ Categoria política não encontrada!')
      return
    }
    
    console.log('✅ Categoria política encontrada:')
    console.log(`   Nome: ${politica.name}`)
    console.log(`   Cor: ${politica.color}`)
    console.log(`   Atualizada: ${politica.updated_at}`)
    
    // Mapear cor para CSS
    const colorMap = {
      '#DC2626': 'bg-gradient-to-br from-red-900 to-red-800',
      '#059669': 'bg-gradient-to-br from-emerald-900 to-emerald-800', 
      '#7C3AED': 'bg-gradient-to-br from-violet-900 to-violet-800',
      '#0EA5E9': 'bg-gradient-to-br from-sky-900 to-sky-800',
      '#3B82F6': 'bg-gradient-to-br from-blue-900 to-blue-800',
      '#D97706': 'bg-gradient-to-br from-amber-900 to-amber-800',
      '#16A34A': 'bg-gradient-to-br from-green-900 to-green-800',
      '#10B981': 'bg-gradient-to-br from-emerald-900 to-emerald-800',
      '#BE185D': 'bg-gradient-to-br from-pink-900 to-pink-800',
      '#7C2D12': 'bg-gradient-to-br from-amber-800 to-amber-900',
      '#374151': 'bg-gradient-to-br from-gray-600 to-gray-700',
      '#1F2937': 'bg-gradient-to-br from-gray-800 to-gray-900',
      '#1E3A8A': 'bg-gradient-to-br from-blue-900 to-blue-800'
    }
    
    const cssClass = colorMap[politica.color] || 'bg-gradient-to-br from-primary-900 to-primary-800'
    
    console.log('\n2. Mapeamento de cor:')
    console.log(`   Cor hex: ${politica.color}`)
    console.log(`   CSS class: ${cssClass}`)
    
    // Verificar se a cor está mapeada
    if (colorMap[politica.color]) {
      console.log('✅ Cor está mapeada corretamente!')
    } else {
      console.log('❌ Cor não está no mapeamento - será usado fallback')
    }
    
    // Descrever a cor visualmente
    const colorDescriptions = {
      '#DC2626': '🔴 Vermelho (Red)',
      '#059669': '🟢 Verde esmeralda (Emerald)', 
      '#7C3AED': '🟣 Violeta (Violet)',
      '#0EA5E9': '🔵 Azul céu (Sky)',
      '#3B82F6': '🔵 Azul (Blue)',
      '#D97706': '🟡 Âmbar (Amber)',
      '#16A34A': '🟢 Verde (Green)',
      '#10B981': '🟢 Verde esmeralda claro (Light Emerald)',
      '#BE185D': '🩷 Rosa (Pink)',
      '#1E3A8A': '🔵 Azul escuro (Dark Blue)'
    }
    
    const colorDesc = colorDescriptions[politica.color] || '⚫ Cor desconhecida'
    console.log(`   Cor visual: ${colorDesc}`)
    
    console.log('\n=== CONCLUSÃO ===')
    if (politica.color === '#16A34A') {
      console.log('✅ A categoria Política tem cor VERDE (#16A34A)')
      console.log('✅ Esta cor está mapeada para: bg-gradient-to-br from-green-900 to-green-800')
      console.log('✅ A página deveria mostrar um fundo verde!')
      
      if (cssClass.includes('green')) {
        console.log('✅ Tudo configurado corretamente!')
      } else {
        console.log('❌ Algo está errado com o mapeamento!')
      }
    } else {
      console.log(`⚠️  A categoria Política tem cor ${politica.color}`)
      console.log('   Se você alterou para verde, a mudança pode ainda não ter sido aplicada')
    }
    
  } catch (error) {
    console.error('Erro:', error.message)
  }
}

testPoliticaColor()
