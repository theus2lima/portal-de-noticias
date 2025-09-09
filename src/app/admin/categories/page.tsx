import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Folder,
  FileText,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Buscar categorias com contagem de artigos
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      description,
      color,
      is_active,
      created_at,
      articles:articles(count)
    `)
    .order('name')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Categorias</h1>
          <p className="text-neutral-600">Organize o conteúdo em categorias</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar categorias..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.length > 0 ? (
          categories.map((category: any) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                >
                  <Folder className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar categoria"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {category.name}
              </h3>
              
              {category.description && (
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-neutral-500">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{category.articles?.[0]?.count || 0} artigos</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Slug: <span className="font-mono">{category.slug}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <Folder className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900">
                Nenhuma categoria encontrada
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Comece criando sua primeira categoria.
              </p>
              <div className="mt-6">
                <button className="btn-primary inline-flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nova Categoria</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Estatísticas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {categories?.length || 0}
            </div>
            <div className="text-sm text-neutral-600">Total de Categorias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600">
              {categories?.filter((cat: any) => cat.is_active).length || 0}
            </div>
            <div className="text-sm text-neutral-600">Categorias Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {categories?.reduce((total: number, cat: any) => total + (cat.articles?.[0]?.count || 0), 0) || 0}
            </div>
            <div className="text-sm text-neutral-600">Total de Artigos</div>
          </div>
        </div>
      </div>

      {/* Categories Table (Alternative view) */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Lista de Categorias</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Artigos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Criada em
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <tr key={category.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        >
                          <Tag className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-sm text-neutral-500 truncate max-w-xs">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-neutral-400 mr-1" />
                        {category.articles?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(category.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/categoria/${category.slug}`}
                          className="text-neutral-600 hover:text-neutral-900 transition-colors"
                          title="Ver categoria"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Editar categoria"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Excluir categoria"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Folder className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">
                      Nenhuma categoria encontrada
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Comece criando sua primeira categoria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
