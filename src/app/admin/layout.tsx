import { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'

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
    <AuthProvider>
      <ProtectedRoute>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}
