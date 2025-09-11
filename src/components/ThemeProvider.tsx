'use client'

import { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, loading } = useTheme()

  useEffect(() => {
    // Aplicar tema inicial imediatamente
    if (!loading) {
      document.documentElement.style.setProperty('--theme-loaded', '1')
    }
  }, [loading])

  if (loading) {
    // Mostrar um loading simples enquanto carrega o tema
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
