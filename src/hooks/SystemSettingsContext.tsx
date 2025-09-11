'use client'

import { ReactNode, createContext, useContext } from 'react'
import { SystemSettings, useSystemSettings } from './useSystemSettings'

interface SystemSettingsContextType {
  settings: SystemSettings
  loading: boolean
  saving: boolean
  lastSaved: Date | null
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  testEmailSettings: () => Promise<{ success: boolean, message: string }>
  exportSettings: () => void
  importSettings: (file: File) => Promise<unknown>
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined)

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const systemSettings = useSystemSettings()
  
  return (
    <SystemSettingsContext.Provider value={systemSettings}>
      {children}
    </SystemSettingsContext.Provider>
  )
}

export function useSystemSettingsContext() {
  const context = useContext(SystemSettingsContext)
  
  if (context === undefined) {
    throw new Error('useSystemSettingsContext deve ser usado dentro de um SystemSettingsProvider')
  }
  
  return context
}
