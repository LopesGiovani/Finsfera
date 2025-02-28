import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CORES_STATUS = {
  novo: "#94A3B8",
  em_andamento: "#FCD34D",
  pausado: "#FB923C",
  concluido: "#4ADE80",
  cancelado: "#F87171",
  faturado: "#60A5FA",
};

export function DashboardOS() {
  const dadosStatus = [
    { status: "Novo", quantidade: 5, cor: CORES_STATUS.novo },
    { status: "Em Andamento", quantidade: 8, cor: CORES_STATUS.em_andamento },
    { status: "Pausado", quantidade: 2, cor: CORES_STATUS.pausado },
    { status: "Concluído", quantidade: 15, cor: CORES_STATUS.concluido },
    { status: "Cancelado", quantidade: 1, cor: CORES_STATUS.cancelado },
    { status: "Faturado", quantidade: 12, cor: CORES_STATUS.faturado },
  ];

  const dadosMensais = [
    { mes: "Jan", quantidade: 10, faturamento: 5000 },
    { mes: "Fev", quantidade: 15, faturamento: 7500 },
    { mes: "Mar", quantidade: 12, faturamento: 6000 },
    // ... mais dados
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-sm text-gray-500 mb-1">Total de OS</h3>
          <div className="text-2xl font-medium">43</div>
        </div>
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-sm text-gray-500 mb-1">Em Andamento</h3>
          <div className="text-2xl font-medium">8</div>
        </div>
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-sm text-gray-500 mb-1">Concluídas</h3>
          <div className="text-2xl font-medium">15</div>
        </div>
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-sm text-gray-500 mb-1">Faturamento</h3>
          <div className="text-2xl font-medium">R$ 18.500</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">OS por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosStatus}
                  dataKey="quantidade"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {dadosStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {dadosStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.cor }}
                />
                <span className="text-sm text-gray-600">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Evolução Mensal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="quantidade"
                  fill="#60A5FA"
                  name="Quantidade"
                />
                <Bar
                  yAxisId="right"
                  dataKey="faturamento"
                  fill="#4ADE80"
                  name="Faturamento"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
