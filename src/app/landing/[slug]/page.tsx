import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import LandingPageRenderer from '@/components/LandingPageRenderer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface LandingPageData {
  id: string
  title: string
  slug: string
  subtitle?: string
  description?: string
  template: string
  primary_color: string
  secondary_color: string
  hero_title: string
  hero_subtitle?: string
  hero_description?: string
  hero_image?: string
  hero_cta_text: string
  about_title?: string
  about_content?: string
  about_image?: string
  services_title: string
  services: any[]
  testimonials_title: string
  testimonials: any[]
  contact_title: string
  contact_description?: string
  contact_phone?: string
  contact_email?: string
  contact_address?: string
  contact_whatsapp?: string
  social_facebook?: string
  social_instagram?: string
  social_linkedin?: string
  social_twitter?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  og_image?: string
  is_active: boolean
  show_header: boolean
  show_footer: boolean
  custom_css?: string
  custom_js?: string
  views_count: number
  leads_count: number
}

async function getLandingPage(slug: string): Promise<LandingPageData | null> {
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    // Incrementar contador de visualizações
    await supabase
      .from('landing_pages')
      .update({ views_count: data.views_count + 1 })
      .eq('id', data.id)

    return data
  } catch (error) {
    console.error('Erro ao buscar landing page:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const landingPage = await getLandingPage(params.slug)

  if (!landingPage) {
    return {
      title: 'Página não encontrada',
    }
  }

  return {
    title: landingPage.meta_title || landingPage.title,
    description: landingPage.meta_description || landingPage.description,
    keywords: landingPage.meta_keywords,
    openGraph: {
      title: landingPage.meta_title || landingPage.title,
      description: landingPage.meta_description || landingPage.description,
      images: landingPage.og_image ? [landingPage.og_image] : undefined,
    },
  }
}

export default async function LandingPage({
  params,
}: {
  params: { slug: string }
}) {
  const landingPage = await getLandingPage(params.slug)

  if (!landingPage) {
    notFound()
  }

  return <LandingPageRenderer data={landingPage} />
}
