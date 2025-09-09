import { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Login - Portal de Notícias',
  description: 'Acesso ao painel administrativo do Portal de Notícias',
  robots: 'noindex, nofollow',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
