'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Menu, X, Facebook, Twitter, Instagram, MessageCircle, LinkIcon } from 'lucide-react'
import { useCategoriesContext } from '@/contexts/CategoriesContext'
import { useSiteConfig } from '@/hooks/useSiteConfig'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  
  // Usar contexto de categorias
  const { categories, loading } = useCategoriesContext()
  
  // Usar configurações do site
  const { config, loading: configLoading } = useSiteConfig()
  
  // Mapear ícones para componentes
  const iconMap = {
    Facebook,
    Twitter,
    Instagram,
    MessageCircle,
    LinkIcon
  }
  
  // Filtrar apenas os links de redes sociais habilitados para o header
  const headerSocialLinks = config.socialLinks
    .filter(link => link.enabled)
    .slice(0, 4) // Máximo 4 redes sociais no header para não ficar sobrecarregado

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any)
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-900 text-white">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-sm">
            {config.headerText || '📍 Últimas notícias em tempo real'}
          </div>
          <div className="flex items-center space-x-3">
            {headerSocialLinks.map((social) => {
              const Icon = iconMap[social.icon as keyof typeof iconMap] || LinkIcon
              return (
                <Link 
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-white ${social.color} transition-colors duration-200`}
                  title={social.platform}
                >
                  <Icon size={16} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Radar Noroeste PR" 
              width={180} 
              height={60}
              className="h-12 w-auto"
              priority
            />
            <div className="hidden lg:block">
              <p className="text-sm text-neutral-600">Seu portal de notícias confiável</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 pl-10 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary-500">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex justify-center space-x-8 py-4">
            <Link 
              href="/" 
              className="text-white hover:text-secondary-200 font-medium transition-colors duration-200"
            >
              Início
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="text-white hover:text-secondary-200 font-medium transition-colors duration-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 animate-slideIn">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 pl-10 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <Link 
                href="/" 
                className="block py-2 text-neutral-800 hover:text-primary-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="block py-2 text-neutral-800 hover:text-primary-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
