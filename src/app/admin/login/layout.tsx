import { Metadata } from 'next'

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
  return <>{children}</>
}
