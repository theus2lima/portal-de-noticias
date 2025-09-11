import { Metadata } from 'next'
import AdminLayoutWrapper from '@/components/Layout/AdminLayoutWrapper'

export const metadata: Metadata = {
  title: 'Dashboard - Portal de Notícias',
  description: 'Painel administrativo do Portal de Notícias',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  )
}
