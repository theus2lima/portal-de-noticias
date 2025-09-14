import { Metadata } from 'next'
import GoogleNewsCollector from '@/components/admin/GoogleNewsCollector'

export const metadata: Metadata = {
  title: 'Coletor Google News - Admin',
  description: 'Colete notícias automaticamente do Google Notícias'
}

export default function GoogleNewsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Coletor Google News</h1>
        <p className="text-gray-600 mt-2">
          Ferramenta para coletar notícias automaticamente do Google Notícias usando diferentes critérios de busca
        </p>
      </div>
      
      <GoogleNewsCollector />
    </div>
  )
}
