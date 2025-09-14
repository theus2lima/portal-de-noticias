import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { articleId, slug } = await request.json()

    if (!articleId && !slug) {
      return NextResponse.json(
        { error: 'Article ID or slug is required' },
        { status: 400 }
      )
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIP || request.ip || 'unknown'
    
    // Get user agent and referrer for additional analytics
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    let article = null

    // If we have slug, get the article first
    if (slug && !articleId) {
      const { data } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      
      article = data
    } else {
      article = { id: articleId }
    }

    if (!article?.id) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const articleIdToUse = article.id

    // Check if this IP already viewed this article in the last 24 hours
    // to prevent inflated view counts from the same reader
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const { data: existingView } = await supabase
      .from('article_views')
      .select('id')
      .eq('article_id', articleIdToUse)
      .eq('ip_address', ip)
      .gte('viewed_at', oneDayAgo.toISOString())
      .single()

    // Only track the view and increment counter if it's a unique view
    // in the last 24 hours
    if (!existingView) {
      // Insert into article_views table
      await supabase
        .from('article_views')
        .insert({
          article_id: articleIdToUse,
          ip_address: ip,
          user_agent: userAgent,
          referrer: referrer,
          viewed_at: new Date().toISOString()
        })

      // Get current views count and increment
      const { data: currentArticle } = await supabase
        .from('articles')
        .select('views_count')
        .eq('id', articleIdToUse)
        .single()

      // Increment the views_count on the article
      await supabase
        .from('articles')
        .update({ 
          views_count: (currentArticle?.views_count || 0) + 1
        })
        .eq('id', articleIdToUse)

      return NextResponse.json({ 
        success: true, 
        message: 'View tracked successfully',
        unique_view: true 
      })
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'View already counted in last 24 hours',
        unique_view: false 
      })
    }

  } catch (error) {
    console.error('Error tracking article view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
