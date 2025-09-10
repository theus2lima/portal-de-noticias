'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { listenToCategoriesUpdates } from '@/lib/categoriesNotifier'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface CategoriesContextType {
  categories: Category[]
  loading: boolean
  error: string | null
  refreshCategories: () => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error('useCategoriesContext must be used within a CategoriesProvider')
  }
  return context
}

interface CategoriesProviderProps {
  children: ReactNode
}

export const CategoriesProvider = ({ children }: CategoriesProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setError(null)
      const response = await fetch('/api/categories', {
        cache: 'no-store' // Forçar busca sempre atualizada
      })
      
      if (response.ok) {
        const data = await response.json()
        // Filtrar apenas categorias ativas e ordenar por nome
        const activeCategories = (data.data || [])
          .filter((cat: Category) => cat.is_active)
          .sort((a: Category, b: Category) => a.name.localeCompare(b.name))
        
        setCategories(activeCategories)
      } else {
        throw new Error('Erro ao buscar categorias')
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      setError('Erro ao carregar categorias')
      
      // Fallback para categorias padrão em caso de erro
      setCategories([
        { id: '1', name: 'Política', slug: 'politica', description: 'Notícias sobre política nacional e local', color: '#DC2626', icon: 'Vote', is_active: true },
        { id: '2', name: 'Economia', slug: 'economia', description: 'Economia, finanças e mercado', color: '#059669', icon: 'DollarSign', is_active: true },
        { id: '3', name: 'Esportes', slug: 'esportes', description: 'Esportes nacionais e internacionais', color: '#DC2626', icon: 'Trophy', is_active: true },
        { id: '4', name: 'Cultura', slug: 'cultura', description: 'Arte, cultura e entretenimento', color: '#7C3AED', icon: 'Palette', is_active: true },
        { id: '5', name: 'Cidades', slug: 'cidades', description: 'Notícias das cidades e regiões', color: '#0EA5E9', icon: 'Building', is_active: true },
        { id: '6', name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação e tecnologia', color: '#3B82F6', icon: 'Laptop', is_active: true }
      ])
    } finally {
      setLoading(false)
    }
  }

  const refreshCategories = async () => {
    await fetchCategories()
  }

  // Carregar categorias na inicialização
  useEffect(() => {
    fetchCategories()
  }, [])

  // Escutar mudanças nas categorias para sincronizar entre abas
  useEffect(() => {
    const cleanup = listenToCategoriesUpdates(() => {
      // Aguardar um pouco para garantir que os dados foram salvos
      setTimeout(() => {
        refreshCategories()
      }, 100)
    })
    
    return cleanup
  }, [])

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refreshCategories
  }

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}
