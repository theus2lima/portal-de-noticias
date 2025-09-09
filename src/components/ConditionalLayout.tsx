'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  
  // Não renderizar Header e Footer nas rotas do admin
  const isAdminRoute = pathname?.startsWith('/admin')
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-1" role="main">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default ConditionalLayout
