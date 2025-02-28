import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { OrdensServicoService } from "@/services/ordens-servico";

export default function RelatoriosOS() {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    tipo: "faturamento", // ou "produtividade", "clientes", etc.
  });

  const gerarRelatorio = async () => {
    const response = await OrdensServicoService.gerarRelatorio(filtros);
    // Lógica para download do relatório
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-medium mb-8">Relatórios</h1>

        <div className="bg-white rounded-xl p-6">
          <div className="space-y-4">
            {/* Filtros do relatório */}
            <div className="grid grid-cols-3 gap-4">
              {/* ... campos de filtro ... */}
            </div>

            <button
              onClick={gerarRelatorio}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
