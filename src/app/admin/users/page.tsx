import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Shield,
  User,
  Crown,
  Calendar,
  FileText,
  Mail,
  Phone
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function UsersPage() {
  const supabase = await createClient()

  // Buscar usuários
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at,
      articles:articles(count)
    `)
    .order('created_at', { ascending: false })

  // Estatísticas dos usuários
  const totalUsers = users?.length || 0
  const activeUsers = users?.filter((user: any) => user.is_active).length || 0
  const adminUsers = users?.filter((user: any) => user.role === 'admin').length || 0
  const editorUsers = users?.filter((user: any) => user.role === 'editor').length || 0

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Crown
      case 'editor':
        return Edit
      default:
        return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'editor':
        return 'Editor'
      default:
        return 'Usuário'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Usuários</h1>
          <p className="text-neutral-600">Gerencie usuários e suas permissões</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-neutral-900">{totalUsers}</p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Administradores</p>
              <p className="text-2xl font-bold text-red-600">{adminUsers}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Editores</p>
              <p className="text-2xl font-bold text-accent-600">{editorUsers}</p>
            </div>
            <div className="bg-accent-500 p-3 rounded-lg">
              <Edit className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar usuários por nome ou email..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Role Filter */}
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">Todas as funções</option>
            <option value="admin">Administrador</option>
            <option value="editor">Editor</option>
          </select>

          {/* Status Filter */}
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Artigos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {users && users.length > 0 ? (
                users.map((user: any) => {
                  const RoleIcon = getRoleIcon(user.role)
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-2 rounded-full mr-4">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-neutral-900">
                          <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-neutral-400 mr-1" />
                          {user.articles?.[0]?.count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-neutral-400 mr-1" />
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-neutral-600 hover:text-neutral-900 transition-colors"
                            title="Alterar permissões"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">
                      Nenhum usuário encontrado
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Comece criando o primeiro usuário.
                    </p>
                    <div className="mt-6">
                      <button className="btn-primary inline-flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Novo Usuário</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Roles Info */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Informações sobre Funções</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <Crown className="h-5 w-5 text-red-600" />
              </div>
              <h4 className="font-medium text-neutral-900">Administrador</h4>
            </div>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Acesso total ao sistema</li>
              <li>• Gerenciar usuários e permissões</li>
              <li>• Configurações avançadas</li>
              <li>• Relatórios e analytics</li>
            </ul>
          </div>

          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-neutral-900">Editor</h4>
            </div>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Criar e editar artigos</li>
              <li>• Gerenciar categorias</li>
              <li>• Moderar comentários</li>
              <li>• Visualizar relatórios básicos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Atividades Recentes</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Novo usuário registrado</p>
              <p className="text-xs text-neutral-500">João Silva se registrou como editor há 2 horas</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Edit className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Permissões alteradas</p>
              <p className="text-xs text-neutral-500">Maria Santos foi promovida a administradora há 1 dia</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-neutral-50 rounded-lg">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Usuário desativado</p>
              <p className="text-xs text-neutral-500">Carlos Oliveira foi desativado há 3 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
