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
  Zap
} from 'lucide-react'
import { LandingPageData } from '../LandingPageRenderer'
import ContactForm from '../ContactForm'

interface DefaultTemplateProps {
  data: LandingPageData
}

// Mapear nomes de ícones para componentes
const iconMap: Record<string, any> = {
  Star,
  CheckCircle,
  Users,
  Award,
  Zap,
  Phone,
  Mail,
  MapPin,
  MessageCircle
}

export default function DefaultTemplate({ data }: DefaultTemplateProps) {
  const [showContactForm, setShowContactForm] = useState(false)

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Star
    return <IconComponent className="w-6 h-6" />
  }

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  {data.hero_title}
                </h1>
                {data.hero_subtitle && (
                  <p className="text-xl lg:text-2xl text-blue-100">
                    {data.hero_subtitle}
                  </p>
                )}
              </div>
              
              {data.hero_description && (
                <p className="text-lg text-blue-100 leading-relaxed">
                  {data.hero_description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToContact}
                  className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  style={{
                    backgroundColor: 'var(--landing-primary-color)',
                    color: 'white'
                  }}
                >
                  {data.hero_cta_text}
                </button>
                
                {data.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${data.contact_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
            
            {data.hero_image && (
              <div className="lg:order-2">
                <div className="relative w-full h-96 lg:h-[500px]">
                  <Image
                    src={data.hero_image}
                    alt={data.hero_title}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      {data.about_content && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {data.about_title && (
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {data.about_title}
                  </h2>
                )}
                <div className="prose prose-lg text-gray-600">
                  {data.about_content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {data.about_image && (
                <div className="relative w-full h-96">
                  <Image
                    src={data.about_image}
                    alt={data.about_title || 'Sobre nós'}
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {data.services && data.services.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {data.services_title}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-t-4"
                  style={{ borderTopColor: 'var(--landing-primary-color)' }}
                >
                  <div className="flex items-center mb-4">
                    <div 
                      className="p-3 rounded-lg mr-4"
                      style={{ 
                        backgroundColor: 'var(--landing-primary-color)',
                        color: 'white'
                      }}
                    >
                      {getIcon(service.icon)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {data.testimonials_title}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-600 mb-6 italic">
                    &quot;{testimonial.testimonial}&quot;
                  </blockquote>
                  
                  <div className="flex items-center">
                    {testimonial.image && (
                      <div className="relative w-12 h-12 mr-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
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

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {data.contact_title}
            </h2>
            {data.contact_description && (
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {data.contact_description}
              </p>
            )}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold mb-6">
                Entre em contato conosco
              </h3>
              
              <div className="space-y-6">
                {data.contact_phone && (
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 mr-4 text-blue-400" />
                    <div>
                      <div className="font-medium">Telefone</div>
                      <a href={`tel:${data.contact_phone}`} className="text-blue-400 hover:text-blue-300">
                        {data.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {data.contact_email && (
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 mr-4 text-blue-400" />
                    <div>
                      <div className="font-medium">E-mail</div>
                      <a href={`mailto:${data.contact_email}`} className="text-blue-400 hover:text-blue-300">
                        {data.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                
                {data.contact_whatsapp && (
                  <div className="flex items-center">
                    <MessageCircle className="w-6 h-6 mr-4 text-green-400" />
                    <div>
                      <div className="font-medium">WhatsApp</div>
                      <a 
                        href={`https://wa.me/${data.contact_whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                      >
                        {data.contact_whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                
                {data.contact_address && (
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 mr-4 text-blue-400 mt-1" />
                    <div>
                      <div className="font-medium">Endereço</div>
                      <div className="text-gray-300">
                        {data.contact_address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4 pt-6">
                {data.social_facebook && (
                  <a
                    href={data.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {data.social_instagram && (
                  <a
                    href={data.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {data.social_linkedin && (
                  <a
                    href={data.social_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
                {data.social_twitter && (
                  <a
                    href={data.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white text-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-6">
                Envie uma mensagem
              </h3>
              <ContactForm landingPageId={data.id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
