import { Button } from "../Button";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

const data = [
  { name: "W1", value: 0 },
  { name: "W2", value: 0 },
  { name: "W3", value: 0 },
  { name: "W4", value: 0 },
  { name: "W5", value: 0 },
  { name: "W6", value: 0 },
];

export function InvoiceSection() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Receita de Faturas</h2>
          <Button className="bg-blue-500 text-white text-sm">
            Adicionar nova fatura
          </Button>
        </div>

        <div>
          <span className="text-2xl font-medium">R$0,00</span>
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Faturas Pendentes</h2>
          <Button className="bg-blue-500 text-white text-sm">
            Adicionar nova fatura
          </Button>
        </div>

        <div>
          <span className="text-2xl font-medium">R$0,00</span>
          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Pagas</h3>
                <span className="text-sm text-gray-900">0%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-0 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Atrasadas</h3>
                <span className="text-sm text-gray-900">0%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-0 bg-red-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-500">Em Aberto</h3>
                <span className="text-sm text-gray-900">0%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-0 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
