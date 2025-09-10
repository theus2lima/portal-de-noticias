'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppPopup from '@/components/WhatsAppPopup'
import { CategoriesProvider } from '@/contexts/CategoriesContext'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  
  // Não renderizar Header e Footer nas rotas do admin
  const isAdminRoute = pathname?.startsWith('/admin')
  
  // Para rotas públicas, usar CategoriesProvider
  if (!isAdminRoute) {
    return (
      <CategoriesProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1" role="main">
            {children}
          </main>
          <Footer />
          {/* Popup do WhatsApp apenas no site público */}
          <WhatsAppPopup />
        </div>
      </CategoriesProvider>
    )
  }
  
  // Para rotas admin, renderizar sem Header e Footer
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1" role="main">
        {children}
      </main>
    </div>
  )
}

export default ConditionalLayout
