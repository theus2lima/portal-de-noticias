'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Não redirecionar se estivermos na página de login
    if (pathname === '/admin/login') {
      return
    }

    // Apenas redireciona se realmente não tem token
    const token = localStorage.getItem('admin_token')
    if (!loading && !isAuthenticated && !token) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  // Se está carregando, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado e não está na página de login, não mostra nada
  // (o useEffect já fez o redirect)
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  return <>{children}</>
}
