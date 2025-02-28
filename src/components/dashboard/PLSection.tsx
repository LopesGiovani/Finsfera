import { DonutChart } from "./charts/DonutChart";

export function PLSection() {
  const incomeData = [
    { name: "Vendas de Produtos", value: 0 },
    { name: "Vendas de Serviços", value: 0 },
    { name: "Renda de Dividendos", value: 0 },
    { name: "Vendas Faturadas", value: 0 },
    { name: "Outras Rendas", value: 0 },
  ];

  const expenseData = [
    { name: "Custos de Viagem", value: 0 },
    { name: "Materiais", value: 0 },
    { name: "Publicidade", value: 0 },
    { name: "Aluguel do Escritório", value: 0 },
    { name: "Outras Despesas", value: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">P&L</h2>
        <span className="text-sm text-gray-500">01/01/2025 - 02/19/2025</span>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div>
          <div className="mb-4">
            <h3 className="text-sm text-gray-500">Lucros e Perdas</h3>
            <span className="text-2xl font-medium">R$0,00</span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-gray-500">Receita</h4>
              <span className="text-xl">R$0,00</span>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">Despesas</h4>
              <span className="text-xl">R$0,00</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-gray-500 mb-4">Principais Receitas</h3>
          <DonutChart data={incomeData} />
        </div>

        <div>
          <h3 className="text-sm text-gray-500 mb-4">Principais Despesas</h3>
          <DonutChart data={expenseData} />
        </div>
      </div>
    </div>
  );
}
