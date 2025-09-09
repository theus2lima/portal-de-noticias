import Link from 'next/link'
import { Facebook, Twitter, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const categories = [
    { name: 'Política', href: '/categoria/politica' },
    { name: 'Economia', href: '/categoria/economia' },
    { name: 'Esportes', href: '/categoria/esportes' },
    { name: 'Cultura', href: '/categoria/cultura' },
    { name: 'Cidades', href: '/categoria/cidades' },
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: MessageCircle, href: '#', label: 'WhatsApp', color: 'hover:text-green-500' },
  ]

  return (
    <footer className="bg-primary-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PN</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Portal de Notícias</h2>
                <p className="text-sm text-primary-200">Sua fonte confiável</p>
              </div>
            </Link>
            <p className="text-primary-200 text-sm mb-4">
              Informação de qualidade, sempre atualizada. Acompanhe as principais notícias do Brasil e do mundo.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className={`p-2 bg-primary-800 rounded-lg ${social.color} transition-all duration-200 hover:scale-110`}
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </Link>
              ))}
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
              <li>
                <Link href="/sobre" className="text-primary-200 hover:text-white transition-colors duration-200">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-primary-200 hover:text-white transition-colors duration-200">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/politica-editorial" className="text-primary-200 hover:text-white transition-colors duration-200">
                  Política Editorial
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-primary-200 hover:text-white transition-colors duration-200">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-primary-200 hover:text-white transition-colors duration-200">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary-400">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-primary-200">
                <Mail size={16} />
                <span className="text-sm">contato@portalnoticias.com.br</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-200">
                <Phone size={16} />
                <span className="text-sm">(11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-200">
                <MapPin size={16} />
                <span className="text-sm">São Paulo, SP - Brasil</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-secondary-400">Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-3 py-2 text-sm bg-primary-800 border border-primary-700 rounded-l-lg focus:outline-none focus:border-secondary-500 text-white placeholder-primary-300"
                />
                <button className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-r-lg transition-colors duration-200">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary-950 border-t border-primary-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-300 text-sm">
            © 2024 Portal de Notícias. Todos os direitos reservados.
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
