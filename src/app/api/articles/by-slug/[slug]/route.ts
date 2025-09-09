import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import fs from 'fs'
import path from 'path'

// Função para ler artigos do arquivo local
function readLocalArticles() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles.json')
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.log('Erro ao ler artigos locais:', error)
    return []
  }
}

// GET - Buscar artigo por slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      )
    }

    try {
      // Tentar buscar do Supabase primeiro
      const { data: article, error } = await supabase
        .from('articles_with_details')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (!error && article) {
        // Incrementar contador de visualizações
        await supabase
          .from('articles')
          .update({ views_count: (article.views_count || 0) + 1 })
          .eq('id', article.id)

        return NextResponse.json({ data: article })
      }
      
      console.log('Supabase query error, using local fallback:', error)
    } catch (supabaseError) {
      console.log('Supabase connection error, using local fallback:', supabaseError)
    }
    
    // Fallback: buscar nos arquivos locais
    console.log('Searching in local articles for slug:', slug)
    const localArticles = readLocalArticles()
    const article = localArticles.find((a: any) => a.slug === slug && a.status === 'published')
    
    if (article) {
      console.log('Found article in local storage:', article.title)
      // Incrementar views localmente
      article.views_count = (article.views_count || 0) + 1
      const updatedArticles = localArticles.map((a: any) => 
        a.slug === slug ? article : a
      )
      
      // Salvar artigos atualizados
      try {
        const filePath = path.join(process.cwd(), 'data', 'articles.json')
        fs.writeFileSync(filePath, JSON.stringify(updatedArticles, null, 2))
      } catch (writeError) {
        console.log('Erro ao atualizar views:', writeError)
      }
      
      return NextResponse.json({ data: article })
    }

    return NextResponse.json(
      { error: 'Artigo não encontrado' },
      { status: 404 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
