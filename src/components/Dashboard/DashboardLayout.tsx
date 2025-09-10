'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Database,
  Menu,
  X,
  LogOut,
  Bell,
  Activity,
  Rss,
  Filter,
  Bot,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  PieChart,
  Shield,
  Globe,
  Layers,
  TrendingUp
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const FontesSubmenu = ({ pathname, setSidebarOpen }: { pathname: string, setSidebarOpen: (open: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(
    pathname?.startsWith('/admin/curadoria/fontes') || pathname?.startsWith('/admin/curadoria/historico') || false
  )

  const isActive = pathname?.startsWith('/admin/curadoria/fontes') || pathname?.startsWith('/admin/curadoria/historico') || false
  const subItems = [
    {
      name: 'Gerenciar Fontes',
      href: '/admin/curadoria/fontes',
      icon: Rss,
      isActive: pathname === '/admin/curadoria/fontes'
    },
    {
      name: 'Histórico (Fontes)',
      href: '/admin/curadoria/fontes-historico',
      icon: Clock,
      isActive: pathname?.startsWith('/admin/curadoria/fontes-historico') || false
    },
    {
      name: 'Histórico (Interna)',
      href: '/admin/curadoria/historico',
      icon: Activity,
      isActive: pathname === '/admin/curadoria/historico'
    }
  ]

  return (
    <>
      {/* Main Fontes Item */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 mx-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group ${
          isActive
            ? 'bg-secondary-600 text-white shadow-lg'
            : 'text-primary-200 hover:text-white hover:bg-primary-800/70'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Rss className={`mr-3 h-5 w-5 transition-colors ${
            isActive ? 'text-white' : 'text-primary-300 group-hover:text-secondary-400'
          }`} />
          <span className="truncate">Fontes</span>
        </div>
        <div className="flex items-center space-x-2">
          {isActive && (
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          )}
          {isOpen ? 
            <ChevronDown className="w-4 h-4 text-primary-300" /> : 
            <ChevronRight className="w-4 h-4 text-primary-300" />
          }
        </div>
      </div>

      {/* Submenu Items */}
      {isOpen && (
        <div className="ml-6 mt-1 space-y-1 border-l border-primary-800 pl-4">
          {subItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 group ${
                item.isActive
                  ? 'bg-secondary-700 text-white shadow-sm'
                  : 'text-primary-300 hover:text-white hover:bg-primary-800/50'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`mr-2 h-4 w-4 transition-colors ${
                item.isActive ? 'text-white' : 'text-primary-400 group-hover:text-secondary-400'
              }`} />
              <span className="truncate">{item.name}</span>
              {item.isActive && (
                <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const menuSections = [
    {
      title: 'Dashboard',
      items: [
        {
          name: 'Visão Geral',
          href: '/admin/dashboard',
          icon: Home
        }
      ]
    },
    {
      title: 'Gestão de Conteúdo',
      items: [
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
        }
      ]
    },
    {
      title: 'Analytics & Monitoramento',
      items: [
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: PieChart
        },
        {
          name: 'Status do Sistema',
          href: '/admin/status',
          icon: TrendingUp
        }
      ]
    },
    {
      title: 'Administração',
      items: [
        {
          name: 'Usuários',
          href: '/admin/users',
          icon: Users
        },
        {
          name: 'Banco de Dados',
          href: '/admin/config',
          icon: Database
        },
        {
          name: 'Configurações',
          href: '/admin/settings',
          icon: Settings
        }
      ]
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
              <span className="text-white font-bold text-sm">RN</span>
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

        <nav className="flex-1 mt-2 overflow-y-auto admin-sidebar-scroll" style={{ height: 'calc(100vh - 64px - 140px)' }}>
          <div className="px-3 pb-4">
            {/* Menu Principal Sections */}
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-6">
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-primary-300 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-3 py-2.5 mx-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-secondary-600 text-white shadow-lg'
                            : 'text-primary-200 hover:text-white hover:bg-primary-800/70'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                          isActive ? 'text-white' : 'text-primary-300 group-hover:text-secondary-400'
                        }`} />
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {/* Separador */}
            <div className="mx-6 my-6 h-px bg-primary-700" />
            
            {/* Curadoria Section */}
            <div className="mb-6">
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-primary-300 uppercase tracking-wider flex items-center">
                  <Bot className="mr-1 h-3 w-3" />
                  Curadoria
                </h3>
              </div>
              <div className="space-y-1">
                <Link
                  href="/admin/curadoria"
                  className={`flex items-center px-3 py-2.5 mx-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    pathname === '/admin/curadoria'
                      ? 'bg-secondary-600 text-white shadow-lg'
                      : 'text-primary-200 hover:text-white hover:bg-primary-800/70'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Filter className={`mr-3 h-5 w-5 transition-colors ${
                    pathname === '/admin/curadoria' ? 'text-white' : 'text-primary-300 group-hover:text-secondary-400'
                  }`} />
                  <span className="truncate">Dashboard</span>
                  {pathname === '/admin/curadoria' && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
                
                <FontesSubmenu pathname={pathname} setSidebarOpen={setSidebarOpen} />
                
                <Link
                  href="/admin/curadoria/configuracoes"
                  className={`flex items-center px-3 py-2.5 mx-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    pathname === '/admin/curadoria/configuracoes'
                      ? 'bg-secondary-600 text-white shadow-lg'
                      : 'text-primary-200 hover:text-white hover:bg-primary-800/70'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings className={`mr-3 h-5 w-5 transition-colors ${
                    pathname === '/admin/curadoria/configuracoes' ? 'text-white' : 'text-primary-300 group-hover:text-secondary-400'
                  }`} />
                  <span className="truncate">Configurações</span>
                  {pathname === '/admin/curadoria/configuracoes' && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-primary-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-primary-300 text-xs truncate">
                  {user?.email || 'admin@exemplo.com'}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center w-full text-primary-200 hover:text-white text-sm transition-colors duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Admin Top Bar */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <Menu size={18} />
              </button>
              
              {/* Breadcrumb/Page Title */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <Link href="/admin" className="text-neutral-500 hover:text-neutral-700 transition-colors">
                  Admin
                </Link>
                <span className="text-neutral-300">/</span>
                <span className="text-neutral-700 font-medium">
                  {(() => {
                    const lastSegment = pathname.split('/').pop()
                    return lastSegment
                      ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
                      : 'Dashboard'
                  })()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                >
                  <FileText size={14} className="mr-1" />
                  Novo Artigo
                </Link>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-secondary-700 bg-secondary-50 hover:bg-secondary-100 rounded-md transition-colors"
                >
                  <Users size={14} className="mr-1" />
                  Usuários
                </Link>
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* View Site */}
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                Ver Site
              </Link>
              
              {/* User Profile */}
              <div className="flex items-center space-x-2 pl-3 border-l border-neutral-200">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs font-medium text-neutral-900 truncate max-w-24">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {user?.role || 'Administrador'}
                  </p>
                </div>
              </div>
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
