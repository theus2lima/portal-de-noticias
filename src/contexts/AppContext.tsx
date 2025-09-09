'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  LocalStorage, 
  User, 
  Article, 
  Category, 
  Comment, 
  Lead, 
  Settings,
  initializeDefaultData,
  getDefaultSettings,
  generateId
} from '@/lib/storage'

interface AppContextType {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  
  // Settings
  settings: Settings
  updateSettings: (newSettings: Settings) => void
  
  // Users
  users: User[]
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  
  // Articles
  articles: Article[]
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'commentsCount'>) => void
  updateArticle: (id: string, article: Partial<Article>) => void
  deleteArticle: (id: string) => void
  
  // Categories
  categories: Category[]
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'articlesCount'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  // Comments
  comments: Comment[]
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateComment: (id: string, comment: Partial<Comment>) => void
  deleteComment: (id: string) => void
  
  // Leads
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLead: (id: string, lead: Partial<Lead>) => void
  deleteLead: (id: string) => void
  
  // Utils
  refreshData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings>(getDefaultSettings())
  const [users, setUsers] = useState<User[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [leads, setLeads] = useState<Lead[]>([])

  // Inicializar dados
  useEffect(() => {
    initializeDefaultData()
    refreshData()
  }, [])

  const refreshData = () => {
    setCurrentUser(LocalStorage.get('currentUser'))
    setSettings(LocalStorage.get('settings', getDefaultSettings()) || getDefaultSettings())
    setUsers(LocalStorage.get('users', []) || [])
    setArticles(LocalStorage.get('articles', []) || [])
    setCategories(LocalStorage.get('categories', []) || [])
    setComments(LocalStorage.get('comments', []) || [])
    setLeads(LocalStorage.get('leads', []) || [])
  }

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    // Para demonstração, aceita qualquer email/senha
    // Em produção, verificaria credenciais reais
    if (email && password) {
      const user = users.find(u => u.email === email && u.isActive)
      if (user) {
        LocalStorage.set('currentUser', user)
        setCurrentUser(user)
        return true
      }
      
      // Se não encontrar o usuário, usa o admin padrão
      const adminUser: User = {
        id: 'admin-001',
        name: 'Administrador',
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
      LocalStorage.set('currentUser', adminUser)
      setCurrentUser(adminUser)
      return true
    }
    return false
  }

  const logout = () => {
    LocalStorage.set('currentUser', null)
    setCurrentUser(null)
  }

  // Settings functions
  const updateSettings = (newSettings: Settings) => {
    LocalStorage.set('settings', newSettings)
    setSettings(newSettings)
  }

  // Users functions
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updatedUsers = [...users, newUser]
    LocalStorage.set('users', updatedUsers)
    setUsers(updatedUsers)
  }

  const updateUser = (id: string, userData: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === id 
        ? { ...user, ...userData, updatedAt: new Date().toISOString() }
        : user
    )
    LocalStorage.set('users', updatedUsers)
    setUsers(updatedUsers)
  }

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id)
    LocalStorage.set('users', updatedUsers)
    setUsers(updatedUsers)
  }

  // Articles functions
  const addArticle = (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'commentsCount'>) => {
    const newArticle: Article = {
      ...articleData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      commentsCount: 0
    }
    const updatedArticles = [...articles, newArticle]
    LocalStorage.set('articles', updatedArticles)
    setArticles(updatedArticles)
    
    // Atualizar contador da categoria
    updateCategoryCount(articleData.category, 1)
  }

  const updateArticle = (id: string, articleData: Partial<Article>) => {
    const updatedArticles = articles.map(article => 
      article.id === id 
        ? { ...article, ...articleData, updatedAt: new Date().toISOString() }
        : article
    )
    LocalStorage.set('articles', updatedArticles)
    setArticles(updatedArticles)
  }

  const deleteArticle = (id: string) => {
    const article = articles.find(a => a.id === id)
    if (article) {
      updateCategoryCount(article.category, -1)
    }
    
    const updatedArticles = articles.filter(article => article.id !== id)
    LocalStorage.set('articles', updatedArticles)
    setArticles(updatedArticles)
  }

  // Categories functions
  const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'articlesCount'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      articlesCount: 0
    }
    const updatedCategories = [...categories, newCategory]
    LocalStorage.set('categories', updatedCategories)
    setCategories(updatedCategories)
  }

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    const updatedCategories = categories.map(category => 
      category.id === id 
        ? { ...category, ...categoryData, updatedAt: new Date().toISOString() }
        : category
    )
    LocalStorage.set('categories', updatedCategories)
    setCategories(updatedCategories)
  }

  const deleteCategory = (id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id)
    LocalStorage.set('categories', updatedCategories)
    setCategories(updatedCategories)
  }

  const updateCategoryCount = (categoryId: string, delta: number) => {
    const updatedCategories = categories.map(category => 
      category.id === categoryId || category.name === categoryId
        ? { ...category, articlesCount: Math.max(0, category.articlesCount + delta) }
        : category
    )
    LocalStorage.set('categories', updatedCategories)
    setCategories(updatedCategories)
  }

  // Comments functions
  const addComment = (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updatedComments = [...comments, newComment]
    LocalStorage.set('comments', updatedComments)
    setComments(updatedComments)
  }

  const updateComment = (id: string, commentData: Partial<Comment>) => {
    const updatedComments = comments.map(comment => 
      comment.id === id 
        ? { ...comment, ...commentData, updatedAt: new Date().toISOString() }
        : comment
    )
    LocalStorage.set('comments', updatedComments)
    setComments(updatedComments)
  }

  const deleteComment = (id: string) => {
    const updatedComments = comments.filter(comment => comment.id !== id)
    LocalStorage.set('comments', updatedComments)
    setComments(updatedComments)
  }

  // Leads functions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updatedLeads = [...leads, newLead]
    LocalStorage.set('leads', updatedLeads)
    setLeads(updatedLeads)
  }

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    const updatedLeads = leads.map(lead => 
      lead.id === id 
        ? { ...lead, ...leadData, updatedAt: new Date().toISOString() }
        : lead
    )
    LocalStorage.set('leads', updatedLeads)
    setLeads(updatedLeads)
  }

  const deleteLead = (id: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== id)
    LocalStorage.set('leads', updatedLeads)
    setLeads(updatedLeads)
  }

  const value: AppContextType = {
    // Auth
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    
    // Settings
    settings,
    updateSettings,
    
    // Users
    users,
    addUser,
    updateUser,
    deleteUser,
    
    // Articles
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    
    // Categories
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Comments
    comments,
    addComment,
    updateComment,
    deleteComment,
    
    // Leads
    leads,
    addLead,
    updateLead,
    deleteLead,
    
    // Utils
    refreshData
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
