'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut,
  Bell
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home
    },
    {
      name: 'Artigos',
      href: '/admin/articles',
      icon: FileText
    },
    {
      name: 'Categorias',
      href: '/admin/categories',
      icon: FolderOpen
    },
    {
      name: 'Leads',
      href: '/admin/leads',
      icon: MessageSquare
    },
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: Settings
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-primary-800">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary-600 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PN</span>
            </div>
            <span className="text-white font-bold text-lg">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-primary-200 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-6 mb-4">
            <h3 className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
              Menu Principal
            </h3>
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-800 text-white border-r-3 border-secondary-500'
                    : 'text-primary-200 hover:text-white hover:bg-primary-800'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-primary-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Admin</p>
                <p className="text-primary-300 text-xs">Administrador</p>
              </div>
            </div>
            <button className="flex items-center w-full text-primary-200 hover:text-white text-sm transition-colors duration-200">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <Menu size={20} />
              </button>
              <h1 className="ml-4 text-2xl font-bold text-neutral-900 lg:ml-0">
                Portal de Notícias
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                href="/"
                target="_blank"
                className="btn-outline text-sm px-4 py-2"
              >
                Ver Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
