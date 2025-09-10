export type CurationItem = {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'editing'
  ai_confidence?: number | null
  ai_category_reasoning?: string | null
  curator_notes?: string | null
  created_at: string
  updated_at: string
  scraped_news: {
    id: string
    title: string
    summary?: string | null
    content?: string | null
    published_at?: string | null
    image_url?: string | null
    original_url: string
    news_sources: {
      name: string
      url: string
    }
  }
  suggested_category?: { id: string; name: string; color?: string | null } | null
  manual_category?: { id: string; name: string; color?: string | null } | null
  curator?: { name?: string | null; email?: string | null } | null
}

export type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
}

