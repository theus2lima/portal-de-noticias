import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET - Exportar estatísticas de compartilhamento em CSV
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || '30' // dias
    const format = searchParams.get('format') || 'csv'

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    try {
      const { data: shares, error } = await supabase
        .from('article_shares')
        .select(`
          id,
          platform,
          shared_at,
          article_id,
          articles!inner(title, category_name, author_name)
        `)
        .gte('shared_at', startDate.toISOString())
        .lte('shared_at', endDate.toISOString())
        .order('shared_at', { ascending: false })

      if (error) {
        console.log('Erro ao buscar compartilhamentos no Supabase:', error)
        throw error
      }

      if (format === 'csv') {
        // Criar CSV
        const csvHeaders = [
          'ID',
          'Plataforma', 
          'Título do Artigo',
          'Categoria',
          'Autor',
          'Data/Hora do Compartilhamento'
        ].join(',')

        const csvRows = shares?.map((share: any) => [
          share.id,
          share.platform,
          `"${share.articles?.title || 'N/A'}"`,
          `"${share.articles?.category_name || 'N/A'}"`,
          `"${share.articles?.author_name || 'N/A'}"`,
          new Date(share.shared_at).toLocaleString('pt-BR')
        ].join(',')) || []

        const csvContent = [csvHeaders, ...csvRows].join('\n')

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="compartilhamentos-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      } else if (format === 'json') {
        // Retornar JSON
        return NextResponse.json({
          data: shares,
          metadata: {
            period: parseInt(period),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalRecords: shares?.length || 0,
            exportDate: new Date().toISOString()
          }
        })
      }

    } catch (supabaseError) {
      console.log('Erro de Supabase, não há dados para exportar:', supabaseError)
      
      // Retorna dados vazios quando não há dados disponíveis
      if (format === 'csv') {
        const csvHeaders = [
          'ID',
          'Plataforma',
          'Título do Artigo', 
          'Categoria',
          'Autor',
          'Data/Hora do Compartilhamento'
        ].join(',')

        const csvContent = csvHeaders + '\n' + 'Nenhum dado disponível para o período selecionado'

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="compartilhamentos-vazio-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      } else {
        return NextResponse.json({
          data: [],
          metadata: {
            period: parseInt(period),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalRecords: 0,
            exportDate: new Date().toISOString(),
            note: 'Nenhum dado disponível para o período selecionado'
          }
        })
      }
    }

  } catch (error) {
    console.error('Erro ao exportar estatísticas de compartilhamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
