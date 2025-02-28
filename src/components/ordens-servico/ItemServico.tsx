import { TrashIcon } from "@heroicons/react/24/outline";

interface ItemServicoProps {
  index: number;
  onRemove: (index: number) => void;
}

export function ItemServico({ index, onRemove }: ItemServicoProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Item {index + 1}</h3>
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Descrição</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            placeholder="Descreva o item"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Tipo</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
            <option>Serviço</option>
            <option>Material</option>
            <option>Equipamento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Quantidade</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">
            Valor Unitário
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            step="0.01"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
