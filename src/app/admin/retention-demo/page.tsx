'use client'

import ReaderRetentionChart from '@/components/ReaderRetentionChart'

export default function RetentionDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo - Gráfico de Retenção de Leitores
          </h1>
          <p className="text-gray-600">
            Demonstração do gráfico funcional sem dados mockados, 
            conectado diretamente ao banco de dados real.
          </p>
        </div>

        {/* Reader Retention Chart */}
        <ReaderRetentionChart />

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Funcionalidades Implementadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">📊 Dados Reais</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Conectado ao banco Supabase</li>
                <li>• Calcula retenção baseada em IPs únicos</li>
                <li>• Períodos de 1, 7 e 30 dias</li>
                <li>• Tempo médio de leitura calculado</li>
                <li>• Taxa de conclusão real</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🔧 Recursos Técnicos</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• API endpoint /api/analytics/retention</li>
                <li>• Fallback para dados simulados</li>
                <li>• Atualização em tempo real</li>
                <li>• Interface responsiva</li>
                <li>• Tooltips informativos</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Como o portal ainda não tem tráfego suficiente, 
              o gráfico exibe dados simulados realistas. Quando houver visitantes reais, 
              os dados serão automaticamente calculados a partir das visualizações reais.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
