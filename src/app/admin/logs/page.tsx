'use client'

import { useEffect, useState } from 'react'
import { Shield, User, FileText, Image, LogIn, LogOut, Trash2, Edit, Upload } from 'lucide-react'

interface AuditLog {
  id: string
  user_email: string
  action: string
  resource_type: string
  resource_id: string | null
  ip_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  LOGIN: <LogIn size={14} className="text-green-500" />,
  LOGOUT: <LogOut size={14} className="text-neutral-400" />,
  CREATE_ARTICLE: <FileText size={14} className="text-blue-500" />,
  UPDATE_ARTICLE: <Edit size={14} className="text-yellow-500" />,
  DELETE_ARTICLE: <Trash2 size={14} className="text-red-500" />,
  CREATE_BANNER: <Image size={14} className="text-blue-500" />,
  UPDATE_BANNER: <Edit size={14} className="text-yellow-500" />,
  DELETE_BANNER: <Trash2 size={14} className="text-red-500" />,
  UPLOAD_FILE: <Upload size={14} className="text-purple-500" />,
  REWRITE_AI: <Shield size={14} className="text-teal-500" />,
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE_ARTICLE: 'Artigo criado',
  UPDATE_ARTICLE: 'Artigo editado',
  DELETE_ARTICLE: 'Artigo deletado',
  CREATE_BANNER: 'Banner criado',
  UPDATE_BANNER: 'Banner editado',
  DELETE_BANNER: 'Banner deletado',
  UPLOAD_FILE: 'Upload de arquivo',
  REWRITE_AI: 'Reescrita com IA',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
      }
    } catch (err) {
      console.error('Erro ao buscar logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter(log =>
    filter === '' ||
    log.action.includes(filter.toUpperCase()) ||
    log.user_email.includes(filter.toLowerCase()) ||
    log.resource_type.includes(filter.toLowerCase())
  )

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-primary-600" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
          <p className="text-sm text-neutral-500">Histórico de ações administrativas</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por ação, email ou tipo..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Data/Hora</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Ação</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Usuário</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Recurso</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">IP</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap font-mono text-xs">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ACTION_ICONS[log.action] ?? <Shield size={14} />}
                        <span className="font-medium text-neutral-800">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-neutral-400" />
                        <span className="text-neutral-700">{log.user_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {log.resource_type}
                      {log.resource_id && (
                        <span className="ml-1 text-xs text-neutral-400 font-mono">
                          #{log.resource_id.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 font-mono text-xs">
                      {log.ip_address ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {log.metadata ? (
                        <span title={JSON.stringify(log.metadata, null, 2)} className="cursor-help underline decoration-dashed">
                          ver detalhes
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
