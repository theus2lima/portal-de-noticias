// Utilitário para notificar mudanças nas categorias para sincronização entre o painel admin e o site público

export const notifyCategoriesUpdated = () => {
  if (typeof window !== 'undefined') {
    // Usar localStorage para notificar outras abas
    localStorage.setItem('categories-updated', Date.now().toString())
    
    // Disparar evento personalizado na aba atual
    window.dispatchEvent(new CustomEvent('categories-updated', {
      detail: { timestamp: Date.now() }
    }))
  }
}

export const listenToCategoriesUpdates = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    // Escutar mudanças no localStorage (entre abas)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'categories-updated') {
        callback()
      }
    }
    
    // Escutar evento personalizado (na mesma aba)
    const handleCustomEvent = () => {
      callback()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('categories-updated', handleCustomEvent)
    
    // Retornar função de limpeza
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('categories-updated', handleCustomEvent)
    }
  }
  
  return () => {} // No-op para SSR
}
