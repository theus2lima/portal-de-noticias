// Utility for managing leads in localStorage when Supabase is not configured
export interface Lead {
  id: number
  name: string
  phone: string
  city: string
  email?: string | null
  source: string
  message?: string | null
  is_contacted: boolean
  notes?: string | null
  created_at: string
}

const LEADS_STORAGE_KEY = 'news_portal_leads'

// Check if we're running in the browser
const isBrowser = typeof window !== 'undefined'

export const LeadsStorage = {
  // Get all leads from localStorage
  getLeads: (): Lead[] => {
    if (!isBrowser) return []
    
    try {
      const leadsJson = localStorage.getItem(LEADS_STORAGE_KEY)
      if (!leadsJson) return []
      
      const leads = JSON.parse(leadsJson)
      return Array.isArray(leads) ? leads : []
    } catch (error) {
      console.error('Error reading leads from localStorage:', error)
      return []
    }
  },

  // Add a new lead to localStorage
  addLead: (leadData: Omit<Lead, 'id' | 'created_at'>): Lead => {
    if (!isBrowser) {
      // Return a simulated lead for SSR
      return {
        id: Date.now(),
        ...leadData,
        created_at: new Date().toISOString()
      }
    }

    try {
      const existingLeads = LeadsStorage.getLeads()
      
      const newLead: Lead = {
        id: Date.now(),
        ...leadData,
        created_at: new Date().toISOString()
      }

      const updatedLeads = [newLead, ...existingLeads]
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updatedLeads))
      
      return newLead
    } catch (error) {
      console.error('Error saving lead to localStorage:', error)
      throw error
    }
  },

  // Update a lead in localStorage
  updateLead: (id: number, updates: Partial<Lead>): Lead | null => {
    if (!isBrowser) return null

    try {
      const existingLeads = LeadsStorage.getLeads()
      const leadIndex = existingLeads.findIndex(lead => lead.id === id)
      
      if (leadIndex === -1) return null

      const updatedLead = { ...existingLeads[leadIndex], ...updates }
      existingLeads[leadIndex] = updatedLead

      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(existingLeads))
      
      return updatedLead
    } catch (error) {
      console.error('Error updating lead in localStorage:', error)
      return null
    }
  },

  // Delete a lead from localStorage
  deleteLead: (id: number): boolean => {
    if (!isBrowser) return false

    try {
      const existingLeads = LeadsStorage.getLeads()
      const filteredLeads = existingLeads.filter(lead => lead.id !== id)
      
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(filteredLeads))
      return true
    } catch (error) {
      console.error('Error deleting lead from localStorage:', error)
      return false
    }
  },

  // Delete multiple leads from localStorage
  deleteLeads: (ids: number[]): number => {
    if (!isBrowser) return 0

    try {
      const existingLeads = LeadsStorage.getLeads()
      const filteredLeads = existingLeads.filter(lead => !ids.includes(lead.id))
      
      const deletedCount = existingLeads.length - filteredLeads.length
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(filteredLeads))
      
      return deletedCount
    } catch (error) {
      console.error('Error deleting leads from localStorage:', error)
      return 0
    }
  },

  // Update multiple leads in localStorage
  updateLeads: (ids: number[], updates: Partial<Lead>): Lead[] => {
    if (!isBrowser) return []

    try {
      const existingLeads = LeadsStorage.getLeads()
      const updatedLeads: Lead[] = []

      existingLeads.forEach(lead => {
        if (ids.includes(lead.id)) {
          const updatedLead = { ...lead, ...updates }
          updatedLeads.push(updatedLead)
          Object.assign(lead, updatedLead)
        }
      })

      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(existingLeads))
      return updatedLeads
    } catch (error) {
      console.error('Error updating leads in localStorage:', error)
      return []
    }
  },

  // Clear all leads from localStorage
  clearLeads: (): void => {
    if (!isBrowser) return
    
    try {
      localStorage.removeItem(LEADS_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing leads from localStorage:', error)
    }
  }
}
