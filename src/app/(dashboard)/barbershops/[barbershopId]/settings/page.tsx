interface PageProps {
  params: {
    barbershopId: string
  }
}

export default function BarbershopSettingsPage({ params }: PageProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Configurações - Barbearia {params.barbershopId}
      </h1>
      
      <form className="space-y-6">
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Fuso Horário
          </label>
          <select
            name="timezone"
            id="timezone"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="slotGranularity" className="block text-sm font-medium text-gray-700">
            Granularidade dos Slots (minutos)
          </label>
          <select
            name="slotGranularity"
            id="slotGranularity"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="5">5 minutos</option>
            <option value="10">10 minutos</option>
            <option value="15" selected>15 minutos</option>
            <option value="20">20 minutos</option>
            <option value="30">30 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  )
}
