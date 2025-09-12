'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  CheckCircle,
  Users,
  Award,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Target
} from 'lucide-react'
import { LandingPageData } from '../LandingPageRenderer'
import ContactForm from '../ContactForm'

interface BusinessTemplateProps {
  data: LandingPageData
}

// Mapear nomes de ícones para componentes (expandido para template empresarial)
const iconMap: Record<string, any> = {
  Star,
  CheckCircle,
  Users,
  Award,
  Zap,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Shield,
  Clock,
  Target,
  ArrowRight
}

export default function BusinessTemplate({ data }: BusinessTemplateProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || CheckCircle
    return <IconComponent className="w-8 h-8" />
  }

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary-color)' }}>
              {data.title}
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">Sobre</a>
              <a href="#services" className="text-gray-600 hover:text-gray-900 font-medium">Serviços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium">Depoimentos</a>
              <button
                onClick={scrollToContact}
                className="px-6 py-2 rounded-full font-semibold text-white transition-colors"
                style={{ backgroundColor: 'var(--landing-primary-color)' }}
              >
                Contato
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Empresarial */}
      <section className="relative bg-gradient-to-r from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  Solução Profissional
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  {data.hero_title}
                </h1>
                {data.hero_subtitle && (
                  <p className="text-xl lg:text-2xl text-gray-600 font-medium">
                    {data.hero_subtitle}
                  </p>
                )}
              </div>
              
              {data.hero_description && (
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  {data.hero_description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--landing-primary-color)' }}
                >
                  {data.hero_cta_text}
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                {data.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${data.contact_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.views_count || 0}+
                  </div>
                  <div className="text-sm text-gray-600">Visualizações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.leads_count || 0}+
                  </div>
                  <div className="text-sm text-gray-600">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
              </div>
            </div>
            
            {data.hero_image && (
              <div className="lg:order-2">
                <div className="relative w-full h-96 lg:h-[600px]">
                  <Image
                    src={data.hero_image}
                    alt={data.hero_title}
                    fill
                    className="object-cover rounded-2xl shadow-2xl"
                  />
                  {/* Overlay com stats */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary-color)' }}>
                            24/7
                          </div>
                          <div className="text-sm text-gray-600">Suporte</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary-color)' }}>
                            +10 Anos
                          </div>
                          <div className="text-sm text-gray-600">Experiência</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary-color)' }}>
                            100%
                          </div>
                          <div className="text-sm text-gray-600">Qualidade</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section - Empresarial */}
      {data.about_content && (
        <section id="about" className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {data.about_title && (
                  <div>
                    <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                      Nossa História
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {data.about_title}
                    </h2>
                  </div>
                )}
                
                <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  {data.about_content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Soluções personalizadas para seu negócio</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Equipe especializada e experiente</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Suporte técnico 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Garantia de qualidade e resultados</span>
                  </div>
                </div>
              </div>
              
              {data.about_image && (
                <div className="relative">
                  <div className="relative w-full h-96 lg:h-[500px]">
                    <Image
                      src={data.about_image}
                      alt={data.about_title || 'Sobre nós'}
                      fill
                      className="object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                  {/* Floating card */}
                  <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-2xl border">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--landing-primary-color)' }}
                      >
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">Certificação ISO</div>
                        <div className="text-sm text-gray-600">Qualidade garantida</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Empresarial */}
      {data.services && data.services.length > 0 && (
        <section id="services" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                O que fazemos
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {data.services_title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Oferecemos soluções completas e personalizadas para impulsionar seu negócio
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border group hover:border-blue-200"
                >
                  <div className="mb-6">
                    <div 
                      className="inline-flex p-4 rounded-2xl group-hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: 'var(--landing-primary-color)',
                        color: 'white'
                      }}
                    >
                      {getIcon(service.icon)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <button 
                    onClick={scrollToContact}
                    className="text-blue-600 font-semibold hover:text-blue-700 flex items-center group"
                  >
                    Saiba mais
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - Empresarial */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section id="testimonials" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                Depoimentos
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {data.testimonials_title}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Veja o que nossos clientes dizem sobre nosso trabalho
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border">
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-8 text-lg leading-relaxed">
                    &quot;{testimonial.testimonial}&quot;
                  </blockquote>
                  
                  <div className="flex items-center">
                    {testimonial.image ? (
                      <div className="relative w-14 h-14 mr-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {testimonial.name}
                      </div>
                      {testimonial.role && (
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24" style={{ backgroundColor: 'var(--landing-primary-color)' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-xl opacity-90">
              Entre em contato conosco hoje mesmo e descubra como podemos ajudar
              sua empresa a alcançar o próximo nível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToContact}
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Começar agora
              </button>
              {data.contact_whatsapp && (
                <a
                  href={`https://wa.me/${data.contact_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Empresarial */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Fale conosco
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {data.contact_title}
            </h2>
            {data.contact_description && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {data.contact_description}
              </p>
            )}
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {data.contact_phone && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--landing-primary-color)' }}>
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Telefone</div>
                      <a href={`tel:${data.contact_phone}`} className="text-gray-600 hover:text-gray-900">
                        {data.contact_phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {data.contact_email && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--landing-primary-color)' }}>
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">E-mail</div>
                      <a href={`mailto:${data.contact_email}`} className="text-gray-600 hover:text-gray-900">
                        {data.contact_email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {data.contact_address && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-start">
                    <div className="p-3 rounded-lg mr-4 mt-1" style={{ backgroundColor: 'var(--landing-primary-color)' }}>
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Endereço</div>
                      <div className="text-gray-600">
                        {data.contact_address}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Social Links */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="font-semibold text-gray-900 mb-4">Redes Sociais</div>
                <div className="flex space-x-4">
                  {data.social_facebook && (
                    <a
                      href={data.social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {data.social_instagram && (
                    <a
                      href={data.social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {data.social_linkedin && (
                    <a
                      href={data.social_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {data.social_twitter && (
                    <a
                      href={data.social_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8">
                Solicite uma proposta personalizada
              </h3>
              <ContactForm landingPageId={data.id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
