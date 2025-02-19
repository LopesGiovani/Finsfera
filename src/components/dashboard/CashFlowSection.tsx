import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { month: "Fev 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Mar 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Abr 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Mai 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Jun 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Jul 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Ago 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Set 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Out 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Nov 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Dez 2024", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Jan 2025", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
  { month: "Fev 2025", moneyIn: 0, moneyOut: 0, netValue: 0, netAmount: 0 },
];

export function CashFlowSection() {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-medium">Fluxo de Caixa</h2>
          <div className="flex gap-2">
            <button className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
              Todos
            </button>
            <button className="px-4 py-1 rounded-full text-gray-500 text-sm">
              Conectado
            </button>
          </div>
        </div>
        <span className="text-sm text-gray-500">Últimos 12 meses</span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMoneyIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMoneyOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="moneyIn"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorMoneyIn)"
              name="Entrada"
            />
            <Area
              type="monotone"
              dataKey="moneyOut"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorMoneyOut)"
              name="Saída"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-600">Entrada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">Saída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-sm text-gray-600">Valor líquido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600">Valor total</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
          Dias
        </button>
        <button className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
          Semanas
        </button>
        <button className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
          Meses
        </button>
      </div>
    </div>
  );
}
