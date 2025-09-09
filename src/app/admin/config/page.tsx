import { 
  Database, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

export default function ConfigPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Configure seu Portal de Notícias
          </h1>
          <p className="text-xl text-gray-600">
            Siga os passos abaixo para ativar sua dashboard administrativa
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                1
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Criar Projeto no Supabase
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Primeiro, você precisa criar um projeto gratuito no Supabase:
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                  <li>Acesse <a href="https://supabase.com" target="_blank" className="font-medium underline">supabase.com</a></li>
                  <li>Clique em &ldquo;Start your project&rdquo; e faça login/cadastro</li>
                  <li>Clique em &ldquo;New Project&rdquo;</li>
                  <li>Escolha um nome (ex: portal-noticias)</li>
                  <li>Defina uma senha segura para o banco</li>
                  <li>Selecione a região mais próxima</li>
                  <li>Clique em &ldquo;Create new project&rdquo;</li>
                </ol>
              </div>

              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <a 
                  href="https://supabase.com/dashboard/new" 
                  target="_blank" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Criar projeto agora →
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                2
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Executar Script SQL
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Agora você precisa criar as tabelas do banco de dados:
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-green-900">
                  <li>No seu projeto Supabase, vá para &ldquo;SQL Editor&rdquo; (menu lateral)</li>
                  <li>Clique em &ldquo;New Query&rdquo;</li>
                  <li>Cole o conteúdo completo do arquivo <code className="bg-green-200 px-1 rounded">database-schema.sql</code></li>
                  <li>Clique em &ldquo;RUN&rdquo; para executar</li>
                  <li>Aguarde a mensagem de sucesso</li>
                </ol>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Localização do arquivo:</span>
                </div>
                <code className="text-sm text-gray-800">📁 news-portal/database-schema.sql</code>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                3
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Configurar Variáveis no Vercel
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Copie as credenciais do Supabase e configure no Vercel:
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">No Supabase:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-purple-900 mb-4">
                  <li>Vá para &ldquo;Settings&rdquo; → &ldquo;API&rdquo;</li>
                  <li>Copie a &ldquo;Project URL&rdquo;</li>
                  <li>Copie a &ldquo;anon/public key&rdquo;</li>
                </ol>
                
                <h4 className="font-semibold text-purple-900 mb-3">No Vercel:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-purple-900">
                  <li>Acesse seu projeto no dashboard do Vercel</li>
                  <li>Vá para &ldquo;Settings&rdquo; → &ldquo;Environment Variables&rdquo;</li>
                  <li>Adicione as duas variáveis abaixo</li>
                  <li>Clique em &ldquo;Save&rdquo; e faça um novo deploy</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Nome da Variável:</label>
                  </div>
                  <code className="text-sm text-gray-800">NEXT_PUBLIC_SUPABASE_URL</code>
                  <div className="mt-2 text-xs text-gray-600">
                    Cole aqui a Project URL do seu Supabase
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Nome da Variável:</label>
                  </div>
                  <code className="text-sm text-gray-800">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                  <div className="mt-2 text-xs text-gray-600">
                    Cole aqui a anon/public key do seu Supabase
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-purple-600" />
                <a 
                  href="https://vercel.com/dashboard" 
                  target="_blank" 
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Configurar no Vercel →
                </a>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                4
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Testar a Configuração
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Após configurar as variáveis, teste se tudo está funcionando:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
                  <li>Aguarde alguns minutos para o deploy automático</li>
                  <li>Acesse novamente sua URL do Vercel</li>
                  <li>Vá para <code className="bg-yellow-200 px-1 rounded">/admin</code> - deve carregar sem erros</li>
                  <li>Vá para <code className="bg-yellow-200 px-1 rounded">/admin/status</code> - deve mostrar tudo ✅</li>
                  <li>Teste criar um artigo em <code className="bg-yellow-200 px-1 rounded">/admin/articles/new</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Success State */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white mt-12">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 mr-3" />
            <h3 className="text-2xl font-bold">Parabéns! 🎉</h3>
          </div>
          <p className="text-green-100 mb-6">
            Após completar esses passos, sua dashboard estará 100% funcional com:
          </p>
          <ul className="space-y-2 text-green-100">
            <li>✅ Gestão completa de artigos e categorias</li>
            <li>✅ Sistema de leads e analytics</li>
            <li>✅ Dashboard com estatísticas em tempo real</li>
            <li>✅ APIs REST funcionais</li>
            <li>✅ Interface responsiva e profissional</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <a 
            href="/admin/dashboard" 
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 text-center"
          >
            Acessar Dashboard →
          </a>
          <a 
            href="/admin/status" 
            className="flex-1 bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center"
          >
            Verificar Status
          </a>
        </div>

        {/* Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Precisa de Ajuda?</h3>
          </div>
          <p className="text-blue-800 mb-4">
            Se encontrar algum problema durante a configuração:
          </p>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>📖 Consulte os arquivos de documentação no projeto</li>
            <li>🔍 Verifique se as variáveis foram salvas corretamente</li>
            <li>⏰ Aguarde alguns minutos após configurar (deploy automático)</li>
            <li>🔄 Tente acessar <code className="bg-blue-200 px-1 rounded">/admin/status</code> para diagnóstico</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
