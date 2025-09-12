'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Templates dinâmicos
const DefaultTemplate = dynamic(() => import('./templates/DefaultTemplate'))
const BusinessTemplate = dynamic(() => import('./templates/BusinessTemplate'))
const MinimalTemplate = dynamic(() => import('./templates/MinimalTemplate'))
const BoldTemplate = dynamic(() => import('./templates/BoldTemplate'))
const ModernTemplate = dynamic(() => import('./templates/ModernTemplate'))

export interface LandingPageData {
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
  services: Service[]
  testimonials_title: string
  testimonials: Testimonial[]
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

export interface Service {
  title: string
  description: string
  icon: string
}

export interface Testimonial {
  name: string
  testimonial: string
  role: string
  image?: string
}

interface LandingPageRendererProps {
  data: LandingPageData
}

export default function LandingPageRenderer({ data }: LandingPageRendererProps) {
  // Injetar CSS personalizado
  useEffect(() => {
    if (data.custom_css) {
      const style = document.createElement('style')
      style.textContent = data.custom_css
      style.setAttribute('data-landing-page-css', data.id)
      document.head.appendChild(style)

      return () => {
        const existingStyle = document.querySelector(`style[data-landing-page-css="${data.id}"]`)
        if (existingStyle) {
          existingStyle.remove()
        }
      }
    }
  }, [data.custom_css, data.id])

  // Injetar JavaScript personalizado
  useEffect(() => {
    if (data.custom_js) {
      try {
        // Executar JavaScript personalizado de forma segura
        const script = document.createElement('script')
        script.textContent = data.custom_js
        script.setAttribute('data-landing-page-js', data.id)
        document.body.appendChild(script)

        return () => {
          const existingScript = document.querySelector(`script[data-landing-page-js="${data.id}"]`)
          if (existingScript) {
            existingScript.remove()
          }
        }
      } catch (error) {
        console.error('Erro ao executar JavaScript personalizado:', error)
      }
    }
  }, [data.custom_js, data.id])

  // Injetar variáveis CSS para cores do tema
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--landing-primary-color', data.primary_color)
    root.style.setProperty('--landing-secondary-color', data.secondary_color)

    return () => {
      root.style.removeProperty('--landing-primary-color')
      root.style.removeProperty('--landing-secondary-color')
    }
  }, [data.primary_color, data.secondary_color])

  // Selecionar o template apropriado
  const renderTemplate = () => {
    switch (data.template) {
      case 'business':
        return <BusinessTemplate data={data} />
      case 'minimal':
        return <MinimalTemplate data={data} />
      case 'bold':
        return <BoldTemplate data={data} />
      case 'modern':
        return <ModernTemplate data={data} />
      default:
        return <DefaultTemplate data={data} />
    }
  }

  return (
    <div className="landing-page" data-template={data.template}>
      {renderTemplate()}
    </div>
  )
}
