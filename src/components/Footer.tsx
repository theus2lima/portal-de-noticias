'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, MessageCircle, Mail, Phone, MapPin, Loader2, LinkIcon } from 'lucide-react'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { useState } from 'react'

const Footer = () => {
  const { config, loading } = useSiteConfig()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState({ success: false, message: '' })

  const categories = [
    { name: 'Política', href: '/categoria/politica' },
    { name: 'Economia', href: '/categoria/economia' },
    { name: 'Esportes', href: '/categoria/esportes' },
    { name: 'Cultura', href: '/categoria/cultura' },
    { name: 'Cidades', href: '/categoria/cidades' },
  ]
  
  // Mapear ícones para componentes
  const iconMap = {
    Facebook,
    Twitter,
    Instagram,
    MessageCircle,
    LinkIcon
  }
  
  // Filtrar apenas os links de redes sociais habilitados
  const activeSocialLinks = config.socialLinks.filter(link => link.enabled)
  
  // Filtrar apenas os links úteis habilitados
  const activeUsefulLinks = config.usefulLinks.filter(link => link.enabled)

  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RN</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Radar Noroeste PR</h2>
                <p className="text-sm text-primary-200">Sua fonte confiável</p>
              </div>
            </Link>
            <p className="text-primary-200 text-sm mb-4">
              {config.footerDescription}
            </p>
            <div className="flex space-x-3">
              {activeSocialLinks.map((social) => {
                const Icon = iconMap[social.icon as keyof typeof iconMap] || LinkIcon
                return (
                  <Link
                    key={social.id}
                    href={social.url}
                    className={`p-2 bg-primary-800 rounded-lg ${social.color} transition-all duration-200 hover:scale-110`}
                    aria-label={social.platform}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary-400">Categorias</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-primary-200 hover:text-white transition-colors duration-200"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary-400">Links Úteis</h3>
            <ul className="space-y-2">
              {activeUsefulLinks.map((link) => (
                <li key={link.id}>
                  <Link 
                    href={link.url} 
                    className="text-primary-200 hover:text-white transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary-400">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-primary-200">
                <Mail size={16} />
                <span className="text-sm">{config.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-200">
                <Phone size={16} />
                <span className="text-sm">{config.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-200">
                <MapPin size={16} />
                <span className="text-sm">{config.contactAddress}</span>
              </div>
            </div>

            {/* Newsletter */}
            {config.newsletterEnabled && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2 text-secondary-400">{config.newsletterTitle}</h4>
                <p className="text-xs text-primary-300 mb-2">{config.newsletterDescription}</p>
                
                <form 
                  className="flex"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!newsletterEmail.trim()) return
                    
                    setNewsletterLoading(true)
                    // Simular inscrição na newsletter
                    setTimeout(() => {
                      setNewsletterStatus({
                        success: true,
                        message: 'Inscrição realizada com sucesso!'
                      })
                      setNewsletterEmail('')
                      setNewsletterLoading(false)
                      
                      // Limpar mensagem após 3 segundos
                      setTimeout(() => {
                        setNewsletterStatus({ success: false, message: '' })
                      }, 3000)
                    }, 1000)
                  }}
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    className="flex-1 px-3 py-2 text-sm bg-primary-800 border border-primary-700 rounded-l-lg focus:outline-none focus:border-secondary-500 text-white placeholder-primary-300"
                    disabled={newsletterLoading}
                    required
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-r-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={newsletterLoading}
                  >
                    {newsletterLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Mail size={16} />
                    )}
                  </button>
                </form>
                
                {newsletterStatus.message && (
                  <div className={`mt-2 text-xs ${newsletterStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                    {newsletterStatus.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary-950 border-t border-primary-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-300 text-sm">
            {config.footerCopyright}
          </p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <Link href="/sitemap" className="text-primary-300 hover:text-white text-sm transition-colors duration-200">
              Sitemap
            </Link>
            <Link href="/rss" className="text-primary-300 hover:text-white text-sm transition-colors duration-200">
              RSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
