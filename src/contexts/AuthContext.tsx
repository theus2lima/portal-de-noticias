'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

interface LoginResult {
  success: boolean
  mfaRequired?: boolean
  mfaTempToken?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<LoginResult>
  verifyMfa: (code: string, tempToken: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se há um token válido ao carregar a página
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 🔐 Cookie httpOnly é enviado automaticamente — sem localStorage
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        // MFA requerido — retornar token temporário para segunda etapa
        if (data.mfaRequired) {
          return { success: false, mfaRequired: true, mfaTempToken: data.mfaTempToken }
        }
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false }
    }
  }

  const verifyMfa = async (code: string, tempToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, mfaTempToken: tempToken })
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Mesmo em erro de rede, limpar estado local
    } finally {
      setUser(null)
      router.push('/admin/login')
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      login,
      verifyMfa,
      logout,
      loading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
