'use client'

import React, { createContext, useContext, useState } from 'react'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  status: string
  created_at: string
  updated_at: string
}

interface GlobalNotificationContextType {
  successArticle: Article | null
  showArticleSuccess: (article: Article) => void
  clearArticleSuccess: () => void
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | undefined>(undefined)

export const useGlobalNotification = () => {
  const context = useContext(GlobalNotificationContext)
  if (!context) {
    throw new Error('useGlobalNotification deve ser usado dentro de um GlobalNotificationProvider')
  }
  return context
}

export const GlobalNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [successArticle, setSuccessArticle] = useState<Article | null>(null)

  const showArticleSuccess = (article: Article) => {
    setSuccessArticle(article)
  }

  const clearArticleSuccess = () => {
    setSuccessArticle(null)
  }

  const value = {
    successArticle,
    showArticleSuccess,
    clearArticleSuccess
  }

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
    </GlobalNotificationContext.Provider>
  )
}
