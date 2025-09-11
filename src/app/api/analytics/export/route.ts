import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const period = searchParams.get('period') || '30'
    
    // For now, return a simple report structure
    const reportData = {
      generated_at: new Date().toISOString(),
      period_days: parseInt(period),
      summary: {
        total_views: 0,
        published_articles: 0,
        total_leads: 0,
        avg_views_per_article: 0
      },
      articles: [],
      leads: []
    }

    if (format === 'json') {
      return NextResponse.json(reportData, {
        headers: {
          'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json'
        }
      })
    }

    // CSV format
    const csvData = [
      ['RELATÓRIO DE ANALYTICS'],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      ['Período:', `${period} dias`],
      [''],
      ['RESUMO EXECUTIVO'],
      ['Total de Visualizações:', reportData.summary.total_views.toLocaleString()],
      ['Artigos Publicados:', reportData.summary.published_articles],
      ['Total de Leads:', reportData.summary.total_leads],
      ['Média de Views por Artigo:', reportData.summary.avg_views_per_article],
      [''],
      ['TOP ARTIGOS POR VISUALIZAÇÕES'],
      ['Título', 'Categoria', 'Visualizações', 'Autor', 'Status', 'Data de Criação'],
      ['Nenhum artigo encontrado'],
      [''],
      ['LEADS RECENTES'],
      ['Nome', 'Email', 'Telefone', 'Cidade', 'Contatado', 'Data'],
      ['Nenhum lead encontrado']
    ]

    const csvContent = csvData.map(row => 
      Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : `"${row}"`
    ).join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Disposition': `attachment; filename="relatorio-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de exportação' },
      { status: 500 }
    )
  }
}
