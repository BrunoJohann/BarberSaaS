export default function CreateBarbershopPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Nova Barbearia
      </h1>
      
      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome da Barbearia
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Barbearia Centro"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Descrição da barbearia..."
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Endereço
          </label>
          <input
            type="text"
            name="address"
            id="address"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Rua, número, bairro, cidade"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="(11) 99999-9999"
          />
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
            Criar Barbearia
          </button>
        </div>
      </form>
    </div>
  )
}
