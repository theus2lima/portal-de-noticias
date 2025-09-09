'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Menu, X, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const categories = [
    { name: 'Política', href: '/categoria/politica' },
    { name: 'Economia', href: '/categoria/economia' },
    { name: 'Esportes', href: '/categoria/esportes' },
    { name: 'Cultura', href: '/categoria/cultura' },
    { name: 'Cidades', href: '/categoria/cidades' },
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    { icon: MessageCircle, href: '#', color: 'hover:text-green-500' },
  ]

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
            📍 Últimas notícias em tempo real
          </div>
          <div className="flex items-center space-x-3">
            {socialLinks.map((social, index) => (
              <Link 
                key={index}
                href={social.href}
                className={`text-white ${social.color} transition-colors duration-200`}
              >
                <social.icon size={16} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-900 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RN</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-gradient">
                Radar Noroeste PR
              </h1>
              <p className="text-sm text-neutral-600">Sua fonte confiável</p>
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
                key={category.name}
                href={category.href}
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
                  key={category.name}
                  href={category.href}
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
