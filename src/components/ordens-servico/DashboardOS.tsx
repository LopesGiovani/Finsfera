import React, { useMemo } from "react";
import { useOrdensServico } from "@/hooks/useOrdensServico";
import {
  PresentationChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { OS } from "@/services/ordens-servico";

// Registrando os componentes do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Interface para o objeto de paginação
interface OrdensServicoPaginadas {
  items: OS[];
  total: number;
  page: number;
  totalPages: number;
}

export function DashboardOS() {
  const { data, isLoading } = useOrdensServico();

  const estatisticas = useMemo(() => {
    // Inicializa com valores padrão
    const defaultStats = {
      total: 0,
      emAndamento: 0,
      concluidas: 0,
      porStatus: {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
      },
      porCliente: {
        labels: [],
        datasets: [{ data: [] }],
      },
    };

    // Verifica se data existe e tem items
    if (!data) return defaultStats;

    // Determina a lista de ordens de serviço
    const ordens = Array.isArray(data)
      ? data
      : (data as OrdensServicoPaginadas).items || [];

    if (ordens.length === 0) return defaultStats;

    // Contagem por status
    const novas = ordens.filter((os) => os.status === "novo").length;
    const emAndamento = ordens.filter((os) => os.status === "em_andamento").length;
    const concluidas = ordens.filter((os) => os.status === "concluido").length;

    // Dados para o gráfico de status
    const statusData = {
      labels: ["Novo", "Em Andamento", "Concluído"],
      datasets: [
        {
          data: [novas, emAndamento, concluidas],
          backgroundColor: ["#FCD34D", "#93C5FD", "#6EE7B7"],
          borderColor: ["#F59E0B", "#3B82F6", "#10B981"],
          borderWidth: 1,
        },
      ],
    };

    // Dados para o gráfico de barras (por cliente)
    const clientesMap = new Map<string, number>();
    ordens.forEach((os) => {
      if (os.cliente?.nome) {
        const valorAtual = clientesMap.get(os.cliente.nome) || 0;
        clientesMap.set(os.cliente.nome, valorAtual + 1);
      }
    });

    const porCliente = {
      labels: Array.from(clientesMap.keys()),
      datasets: [
        {
          label: "Ordens de Serviço por Cliente",
          data: Array.from(clientesMap.values()),
          backgroundColor: "#3B82F6",
        },
      ],
    };

    return {
      total: ordens.length,
      emAndamento,
      concluidas,
      porStatus: statusData,
      porCliente,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total de OS</p>
              <h3 className="text-2xl font-bold mt-1">{estatisticas.total}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <PresentationChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Em Andamento</p>
              <h3 className="text-2xl font-bold mt-1">
                {estatisticas.emAndamento}
              </h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <ClockIcon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Concluídas</p>
              <h3 className="text-2xl font-bold mt-1">
                {estatisticas.concluidas}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">OS por Status</h3>
          <div className="h-64">
            <Pie
              data={estatisticas.porStatus}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium mb-4">OS por Cliente</h3>
          <div className="h-64">
            <Bar
              data={estatisticas.porCliente}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
