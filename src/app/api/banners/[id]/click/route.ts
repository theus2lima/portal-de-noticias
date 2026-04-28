import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST - Registrar clique no banner
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_banner_clicks', { banner_id: params.id })

    if (error) {
      // Fallback manual se a função RPC não existir
      const { data: banner } = await supabase
        .from('banners')
        .select('clicks')
        .eq('id', params.id)
        .single()

      if (banner) {
        await supabase
          .from('banners')
          .update({ clicks: (banner.clicks || 0) + 1 })
          .eq('id', params.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar clique' }, { status: 500 })
  }
}
