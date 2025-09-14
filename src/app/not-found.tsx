import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center text-white">
        {/* 404 Grande */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold mb-2 opacity-20">404</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
        </div>
        
        {/* Conteúdo */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Página não encontrada
          </h2>
          <p className="text-xl text-white/80 leading-relaxed mb-6">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        {/* Ações */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 w-full py-3 px-6 bg-white text-primary-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <Home size={20} />
            <span>Voltar ao início</span>
          </Link>
          
          <Link
            href="/buscar"
            className="inline-flex items-center justify-center space-x-2 w-full py-3 px-6 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-900 transition-colors duration-200"
          >
            <Search size={20} />
            <span>Buscar notícias</span>
          </Link>
        </div>
        
        {/* Sugestões */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-sm text-white/60 mb-3">
            Talvez você esteja procurando por:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              href="/categoria/politica" 
              className="px-3 py-1 text-xs bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              Política
            </Link>
            <Link 
              href="/categoria/economia" 
              className="px-3 py-1 text-xs bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              Economia
            </Link>
            <Link 
              href="/categoria/esportes" 
              className="px-3 py-1 text-xs bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              Esportes
            </Link>
            <Link 
              href="/categoria/tecnologia" 
              className="px-3 py-1 text-xs bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              Tecnologia
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
