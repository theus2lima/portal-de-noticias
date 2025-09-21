require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategoryColors() {
  try {
    console.log('=== Verificando Cores das Categorias ===\n')
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return
    }
    
    console.log('Categorias no banco de dados:\n')
    
    categories.forEach(cat => {
      console.log(`📂 ${cat.name}`)
      console.log(`   ID: ${cat.id}`)
      console.log(`   Slug: ${cat.slug}`)
      console.log(`   Cor: ${cat.color}`)
      console.log(`   Ativa: ${cat.is_active}`)
      console.log(`   Atualizada em: ${cat.updated_at || 'N/A'}`)
      console.log('')
    })
    
    // Teste específico da categoria Política
    const politica = categories.find(cat => cat.slug === 'politica')
    if (politica) {
      console.log('=== POLÍTICA - Detalhes ===')
      console.log(`Cor atual: ${politica.color}`)
      console.log(`Última atualização: ${politica.updated_at || 'Nunca atualizada'}`)
      
      // Verificar qual cor CSS seria aplicada
      const colorMap = {
        '#DC2626': 'bg-gradient-to-br from-red-900 to-red-800',
        '#059669': 'bg-gradient-to-br from-emerald-900 to-emerald-800', 
        '#7C3AED': 'bg-gradient-to-br from-violet-900 to-violet-800',
        '#0EA5E9': 'bg-gradient-to-br from-sky-900 to-sky-800',
        '#3B82F6': 'bg-gradient-to-br from-blue-900 to-blue-800',
        '#D97706': 'bg-gradient-to-br from-amber-900 to-amber-800',
        '#16A34A': 'bg-gradient-to-br from-green-900 to-green-800',
        '#BE185D': 'bg-gradient-to-br from-pink-900 to-pink-800',
        '#7C2D12': 'bg-gradient-to-br from-amber-800 to-amber-900',
        '#374151': 'bg-gradient-to-br from-gray-600 to-gray-700',
        '#1F2937': 'bg-gradient-to-br from-gray-800 to-gray-900'
      }
      
      const cssClass = colorMap[politica.color] || 'bg-gradient-to-br from-primary-900 to-primary-800'
      console.log(`Classe CSS aplicada: ${cssClass}`)
    }
    
  } catch (err) {
    console.error('Erro:', err)
  }
}

checkCategoryColors()
