interface PageProps {
  params: {
    barbershopId: string
  }
}

export default function AgendaPage({ params }: PageProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Agenda - Barbearia {params.barbershopId}
      </h1>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Agendamentos de Hoje
          </h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">João Silva</h4>
                  <p className="text-sm text-gray-500">Corte + Barba</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">09:00 - 10:00</p>
                  <p className="text-sm text-gray-500">Cliente: Maria Santos</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Pedro Costa</h4>
                  <p className="text-sm text-gray-500">Sobrancelha</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">10:30 - 10:45</p>
                  <p className="text-sm text-gray-500">Cliente: José Silva</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
