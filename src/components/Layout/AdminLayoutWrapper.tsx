'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import DashboardLayout from '@/components/Dashboard/DashboardLayout'
import { NotificationProvider } from '@/contexts/NotificationContext'

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Na página de login, não renderizar o menu e o cabeçalho da dashboard
  if (pathname === '/admin/login') {
    return <AuthProvider>{children}</AuthProvider>
  }

  // Para as demais páginas admin, aplicar o layout da dashboard com proteção
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
      </NotificationProvider>
    </AuthProvider>
  )
}

