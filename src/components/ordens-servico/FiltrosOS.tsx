export function FiltrosOS({
  filtros,
  onFiltrar,
}: {
  filtros: Filtros;
  onFiltrar: (filtros: Filtros) => void;
}) {
  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Status</label>
          <select
            value={filtros.status}
            onChange={(e) => onFiltrar({ ...filtros, status: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Todos</option>
            <option value="novo">Novo</option>
            <option value="em_andamento">Em Andamento</option>
            {/* ... outras opções ... */}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Período</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) =>
                onFiltrar({ ...filtros, dataInicio: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) =>
                onFiltrar({ ...filtros, dataFim: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
