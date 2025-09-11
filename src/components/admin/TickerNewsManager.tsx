'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  GripVertical, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Settings,
  AlertCircle
} from 'lucide-react'

interface TickerItem {
  id: string
  text: string
  priority: number
  active: boolean
  createdAt: string
  updatedAt?: string
}

interface TickerSettings {
  tickerEnabled: boolean
  tickerSpeed: number
  tickerItems: TickerItem[]
}

export default function TickerNewsManager() {
  const [settings, setSettings] = useState<TickerSettings>({
    tickerEnabled: true,
    tickerSpeed: 30,
    tickerItems: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Carregar configurações do ticker
  useEffect(() => {
    fetchTickerSettings()
  }, [])
  
  const fetchTickerSettings = async () => {
    try {
      const response = await fetch('/api/settings?category=ticker')
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        setError('Erro ao carregar configurações do ticker')
      }
    } catch (err) {
      setError('Erro de conexão ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }
  
  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message)
      setError('')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(message)
      setSuccess('')
      setTimeout(() => setError(''), 3000)
    }
  }
  
  const handleAddItem = async () => {
    if (!newItem.trim()) {
      showMessage('Por favor, digite o texto da notícia', 'error')
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ticker',
          action: 'add_item',
          data: { text: newItem.trim() }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        setNewItem('')
        setShowAddForm(false)
        showMessage('Item adicionado com sucesso!', 'success')
      } else {
        showMessage(result.error || 'Erro ao adicionar item', 'error')
      }
    } catch (err) {
      showMessage('Erro de conexão ao adicionar item', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleUpdateItem = async (id: string, newText: string) => {
    if (!newText.trim()) {
      showMessage('Por favor, digite o texto da notícia', 'error')
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ticker',
          action: 'update_item',
          data: { id, text: newText.trim() }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        setEditingItem(null)
        showMessage('Item atualizado com sucesso!', 'success')
      } else {
        showMessage(result.error || 'Erro ao atualizar item', 'error')
      }
    } catch (err) {
      showMessage('Erro de conexão ao atualizar item', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ticker',
          action: 'delete_item',
          data: { id }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        showMessage('Item excluído com sucesso!', 'success')
      } else {
        showMessage(result.error || 'Erro ao excluir item', 'error')
      }
    } catch (err) {
      showMessage('Erro de conexão ao excluir item', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleToggleItemStatus = async (id: string, active: boolean) => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ticker',
          action: 'update_item',
          data: { id, active }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        showMessage(`Item ${active ? 'ativado' : 'desativado'} com sucesso!`, 'success')
      } else {
        showMessage(result.error || 'Erro ao alterar status do item', 'error')
      }
    } catch (err) {
      showMessage('Erro de conexão ao alterar status', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleUpdateSettings = async (enabled: boolean, speed?: number) => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ticker',
          action: 'update_settings',
          data: { enabled, speed }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSettings(prev => ({
          ...prev,
          tickerEnabled: enabled,
          tickerSpeed: speed || prev.tickerSpeed
        }))
        showMessage('Configurações atualizadas com sucesso!', 'success')
      } else {
        showMessage(result.error || 'Erro ao atualizar configurações', 'error')
      }
    } catch (err) {
      showMessage('Erro de conexão ao atualizar configurações', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleDragEnd = async (result: any) => {
    if (!result.destination) {
      return
    }
    
    const items = Array.from(settings.tickerItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    // Atualizar o estado local imediatamente para feedback visual
    setSettings(prev => ({
      ...prev,
      tickerItems: items
    }))
    
    // Salvar nova ordem no backend
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ticker',
          action: 'reorder_items',
          data: { items }
        })
      })
      
      const responseResult = await response.json()
      
      if (responseResult.success) {
        showMessage('Ordem dos itens atualizada com sucesso!', 'success')
      } else {
        // Reverter o estado local se o backend falhou
        fetchTickerSettings()
        showMessage(responseResult.error || 'Erro ao reordenar itens', 'error')
      }
    } catch (err) {
      // Reverter o estado local se houve erro de conexão
      fetchTickerSettings()
      showMessage('Erro de conexão ao reordenar itens', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-secondary-100 p-2 rounded-lg mr-3">
            <Settings className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Ticker de Notícias</h3>
            <p className="text-sm text-neutral-600">Gerencie as notícias em destaque que aparecem na faixa superior</p>
          </div>
        </div>
        
        {/* Toggle Ticker */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={settings.tickerEnabled}
            onChange={(e) => handleUpdateSettings(e.target.checked)}
            disabled={saving}
          />
          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 text-green-500">✓</div>
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}
      
      {settings.tickerEnabled && (
        <>
          {/* Speed Setting */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Velocidade da Animação (segundos)
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={settings.tickerSpeed}
              onChange={(e) => {
                const speed = parseInt(e.target.value)
                if (speed >= 10 && speed <= 120) {
                  handleUpdateSettings(settings.tickerEnabled, speed)
                }
              }}
              className="w-20 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={saving}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Tempo para a animação completar uma volta (10-120 segundos)
            </p>
          </div>
          
          {/* Add New Item Form */}
          {showAddForm ? (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-neutral-900">Adicionar Nova Notícia</h4>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewItem('')
                  }}
                  className="text-neutral-500 hover:text-neutral-700"
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Ex: 🔴 Breaking news aqui..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={saving}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button
                  onClick={handleAddItem}
                  disabled={saving || !newItem.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Salvando...' : 'Adicionar'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-outline flex items-center space-x-2"
                disabled={saving}
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Notícia</span>
              </button>
            </div>
          )}
          
          {/* Ticker Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900">
                Itens do Ticker ({settings.tickerItems.length})
              </h4>
              {settings.tickerItems.length > 1 && (
                <p className="text-xs text-neutral-500">
                  Arraste os itens para reorganizar a ordem
                </p>
              )}
            </div>
            
            {settings.tickerItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum item no ticker.</p>
                <p className="text-sm">Clique em &quot;Adicionar Notícia&quot; para começar.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="ticker-items">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                      }`}
                    >
                      {settings.tickerItems.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                          isDragDisabled={saving || editingItem === item.id}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-4 border rounded-lg transition-all ${
                                item.active 
                                  ? 'border-neutral-200 bg-white' 
                                  : 'border-neutral-200 bg-neutral-50 opacity-60'
                              } ${
                                snapshot.isDragging 
                                  ? 'shadow-lg rotate-1 bg-white border-primary-300' 
                                  : 'shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className={`p-1 rounded cursor-grab active:cursor-grabbing ${
                                      saving || editingItem === item.id 
                                        ? 'cursor-not-allowed opacity-50' 
                                        : 'hover:bg-neutral-200'
                                    }`}
                                    title="Arraste para reordenar"
                                  >
                                    <GripVertical className="h-4 w-4 text-neutral-400" />
                                  </div>
                                  <button
                                    onClick={() => handleToggleItemStatus(item.id, !item.active)}
                                    className={`p-1 rounded ${
                                      item.active 
                                        ? 'text-green-600 hover:bg-green-100' 
                                        : 'text-neutral-400 hover:bg-neutral-200'
                                    }`}
                                    disabled={saving}
                                    title={item.active ? 'Desativar item' : 'Ativar item'}
                                  >
                                    {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </button>
                                  {/* Indicador de posição */}
                                  <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                </div>
                                
                                <div className="flex-1">
                                  {editingItem === item.id ? (
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        defaultValue={item.text}
                                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        disabled={saving}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement
                                            handleUpdateItem(item.id, target.value)
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={(e) => {
                                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                          handleUpdateItem(item.id, input.value)
                                        }}
                                        disabled={saving}
                                        className="btn-primary text-sm flex items-center space-x-1"
                                      >
                                        {saving ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        ) : (
                                          <Save className="h-3 w-3" />
                                        )}
                                        <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                                      </button>
                                      <button
                                        onClick={() => setEditingItem(null)}
                                        disabled={saving}
                                        className="btn-outline text-sm"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className={`${item.active ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                        {item.text}
                                      </p>
                                      <p className="text-xs text-neutral-400 mt-1">
                                        Criado em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                                        {item.updatedAt && ` • Editado em: ${new Date(item.updatedAt).toLocaleString('pt-BR')}`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {editingItem !== item.id && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => setEditingItem(item.id)}
                                      disabled={saving}
                                      className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                                      title="Editar item"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      disabled={saving}
                                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Excluir item"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
          
          {/* Preview */}
          {settings.tickerItems.filter(item => item.active).length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-lg">
              <h4 className="text-white font-medium mb-2">Preview do Ticker</h4>
              <div className="bg-white bg-opacity-20 rounded p-3 overflow-hidden">
                <div className="flex items-center">
                  <span className="bg-white text-secondary-600 px-2 py-1 rounded text-xs font-bold mr-3 animate-pulse">
                    ÚLTIMAS
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap">
                      <span className="text-white text-sm">
                        {settings.tickerItems
                          .filter(item => item.active)
                          .map(item => item.text)
                          .join(' • ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
