import { InformationCircleIcon } from "@heroicons/react/24/outline";

export function FinancialRatios() {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium">Índices Financeiros</h2>
          <InformationCircleIcon className="w-5 h-5 text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">01/01/2025 - 02/19/2025</span>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="p-6 border border-gray-100 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Margens de Lucro</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Lucro bruto</p>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-0 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Lucro líquido</p>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-0 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border border-gray-100 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Liquidez</h3>
          <div className="flex justify-around mt-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">RÁPIDA</p>
              <div className="w-20 h-20 mx-auto border-4 border-gray-100 rounded-full"></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">CORRENTE</p>
              <div className="w-20 h-20 mx-auto border-4 border-gray-100 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="p-6 border border-gray-100 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Capital de Giro</h3>
          <div className="flex justify-center items-center h-[120px]">
            <svg className="w-16 h-16 text-gray-200" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 4V2A10 10 0 0 0 2 12h2A8 8 0 0 1 12 4zm0 16v2A10 10 0 0 0 22 12h-2A8 8 0 0 1 12 20z"
              />
            </svg>
          </div>
        </div>

        <div className="p-6 border border-gray-100 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Eficiência do Capital</h3>
          <div className="flex justify-center items-center h-[120px]">
            <svg className="w-16 h-16 text-gray-200" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
