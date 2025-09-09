'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, UserCheck, UserX, Search, Crown, User, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin'
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    
    setSubmitLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simular update de usuário localmente
      setTimeout(() => {
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, name: editingUser.name, email: editingUser.email, role: editingUser.role }
            : user
        ))
        
        setEditingUser(null)
        setShowEditModal(false)
        setSuccess('Usuário atualizado com sucesso! (demonstração)')
        setTimeout(() => setSuccess(''), 3000)
        setSubmitLoading(false)
      }, 1000)
      
    } catch (error) {
      setError('Erro de conexão')
      setSubmitLoading(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    setSubmitLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simular delete de usuário localmente
      setTimeout(() => {
        setUsers(users.filter(user => user.id !== userToDelete.id))
        
        setUserToDelete(null)
        setShowDeleteModal(false)
        setSuccess('Usuário removido com sucesso! (demonstração)')
        setTimeout(() => setSuccess(''), 3000)
        setSubmitLoading(false)
      }, 1000)
      
    } catch (error) {
      setError('Erro de conexão')
      setSubmitLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Usar dados de demonstração locais
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@portalnoticias.com.br',
          name: 'Administrador Principal',
          role: 'admin',
          is_active: true,
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          email: 'editor@portalnoticias.com.br',
          name: 'Editor Chefe',
          role: 'editor',
          is_active: true,
          created_at: '2024-01-02T14:30:00Z'
        },
        {
          id: '3',
          email: 'maria.silva@portalnoticias.com.br',
          name: 'Maria Silva',
          role: 'author',
          is_active: true,
          created_at: '2024-01-03T16:45:00Z'
        },
        {
          id: '4',
          email: 'carlos.santos@portalnoticias.com.br',
          name: 'Carlos Santos',
          role: 'editor',
          is_active: false,
          created_at: '2024-01-04T09:15:00Z'
        },
        {
          id: '5',
          email: 'ana.costa@portalnoticias.com.br',
          name: 'Ana Costa',
          role: 'author',
          is_active: true,
          created_at: '2024-01-05T11:20:00Z'
        }
      ]
      
      // Simular delay de carregamento
      setTimeout(() => {
        setUsers(mockUsers)
        setLoading(false)
      }, 800)
      
    } catch (error) {
      setError('Erro de conexão')
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validações
      if (!newUser.name || !newUser.email || !newUser.password) {
        setError('Todos os campos são obrigatórios')
        return
      }

      // Verificar se email já existe
      const existingUser = users.find(user => user.email === newUser.email)
      if (existingUser) {
        setError('Email já está em uso')
        return
      }

      // Simular criação de usuário localmente
      setTimeout(() => {
        const mockNewUser: User = {
          id: Date.now().toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          is_active: true,
          created_at: new Date().toISOString()
        }
        
        setUsers([mockNewUser, ...users])
        setNewUser({ email: '', password: '', name: '', role: 'admin' })
        setShowAddModal(false)
        setSuccess('Usuário criado com sucesso! (demonstração)')
        setTimeout(() => setSuccess(''), 3000)
        setSubmitLoading(false)
      }, 1000)
      
    } catch (error) {
      setError('Erro de conexão')
      setSubmitLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'author':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'editor':
        return 'Editor'
      case 'author':
        return 'Autor'
      default:
        return 'Usuário'
    }
  }

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Estatísticas
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.is_active).length
  const adminUsers = users.filter(user => user.role === 'admin').length
  const editorUsers = users.filter(user => user.role === 'editor').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Usuários</h1>
          <p className="text-neutral-600">Gerencie usuários e suas permissões</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            🎓 Modo Demonstração - Dados ficcionais para teste
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

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

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar usuários por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Role Filter */}
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas as funções</option>
            <option value="admin">Administrador</option>
            <option value="editor">Editor</option>
            <option value="author">Autor</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
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
              {filteredUsers.map((user) => {
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
                      <div className="text-sm text-neutral-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.is_active ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700">Ativo</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700">Inativo</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-primary-600 hover:text-primary-900 transition-colors p-1"
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">
            Nenhum usuário encontrado
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {users.length === 0 ? 'Comece criando o primeiro usuário.' : 'Ajuste os filtros para ver mais resultados.'}
          </p>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Editar Usuário
            </h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Função
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="author">Autor</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  disabled={submitLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white py-2 px-4 rounded-md"
                >
                  {submitLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Confirmar Exclusão
              </h3>
              
              <p className="text-sm text-neutral-600 mb-6">
                Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </p>

              {error && (
                <div className="text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  disabled={submitLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={submitLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white py-2 px-4 rounded-md"
                >
                  {submitLoading ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Adicionar Novo Usuário
            </h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite a senha"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Função
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="author">Autor</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewUser({ email: '', password: '', name: '', role: 'admin' })
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                  disabled={submitLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white py-2 px-4 rounded-md"
                >
                  {submitLoading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
