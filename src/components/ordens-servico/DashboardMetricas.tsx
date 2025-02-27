import { useQuery } from "@tanstack/react-query";
import { OrdensServicoService } from "@/services/ordens-servico";
import {
  BarChart,
  LineChart,
  PieChart,
  // ... outros componentes do recharts
} from "recharts";

export function DashboardMetricas() {
  const { data: metricas } = useQuery({
    queryKey: ["metricas-os"],
    queryFn: () => OrdensServicoService.obterMetricas(),
  });

  return (
    <div className="space-y-6">
      {/* Gráfico de OS por Status */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">OS por Status</h3>
        <PieChart width={400} height={300}>
          {/* Configuração do gráfico */}
        </PieChart>
      </div>

      {/* Gráfico de Faturamento Mensal */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Faturamento Mensal</h3>
        <LineChart width={800} height={300}>
          {/* Configuração do gráfico */}
        </LineChart>
      </div>

      {/* Gráfico de Tempo Médio de Conclusão */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Tempo Médio de Conclusão</h3>
        <BarChart width={800} height={300}>
          {/* Configuração do gráfico */}
        </BarChart>
      </div>
    </div>
  );
}
