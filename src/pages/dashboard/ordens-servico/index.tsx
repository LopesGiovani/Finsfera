import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  useOrdensServicoFiltros,
} from "@/hooks/useOrdensServico";
import { StatusOS } from "@/components/ordens-servico/StatusOS";
import { formatarMoeda, formatarData } from "@/utils/formatters";
import { OS } from "@/services/ordens-servico";
import { toast } from "react-hot-toast";

export default function OrdensServico() {
  const { data, isLoading, filtros, atualizarFiltros, pagina, setPagina } =
    useOrdensServicoFiltros();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  // Efeito para aplicar busca após digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filtros.busca) {
        atualizarFiltros({ busca: searchQuery });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusFilterChange = (status: string) => {
    const newSelectedStatus = selectedStatus.includes(status)
      ? selectedStatus.filter((s) => s !== status)
      : [...selectedStatus, status];

    setSelectedStatus(newSelectedStatus);
    atualizarFiltros({
      status: newSelectedStatus.length > 0 ? newSelectedStatus : undefined,
    });
  };

  const limparFiltros = () => {
    setSearchQuery("");
    setSelectedStatus([]);
    atualizarFiltros({
      status: undefined,
      busca: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      cliente: undefined,
      responsavel: undefined,
    });
  };

  // Estatísticas
  const stats = {
    total: data?.data?.length || 0,
    novas: data?.data?.filter((os: OS) => os.status === "novo").length || 0,
    emAndamento:
      data?.data?.filter((os: OS) => os.status === "em_andamento").length || 0,
    concluidas:
      data?.data?.filter((os: OS) => os.status === "concluido").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-medium">Ordens de Serviço</h1>
          <div className="flex gap-3">
            <Link href="/dashboard/ordens-servico/relatorios">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm flex items-center gap-2">
                Relatórios
              </button>
            </Link>
            <Link href="/dashboard/ordens-servico/nova">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
                <PlusIcon className="w-5 h-5" />
                Nova OS
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Resumo</h2>

          <div className="flex flex-wrap gap-4">
            <div className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex-1 min-w-[200px]">
              <h3 className="text-sm text-gray-500 mb-1">TOTAL</h3>
              <div className="text-2xl font-medium">{stats.total}</div>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors flex-1 min-w-[200px]">
              <h3 className="text-sm text-gray-500 mb-1">NOVAS</h3>
              <div className="text-2xl font-medium">{stats.novas}</div>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex-1 min-w-[200px]">
              <h3 className="text-sm text-gray-500 mb-1">EM ANDAMENTO</h3>
              <div className="text-2xl font-medium">{stats.emAndamento}</div>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors flex-1 min-w-[200px]">
              <h3 className="text-sm text-gray-500 mb-1">CONCLUÍDAS</h3>
              <div className="text-2xl font-medium">{stats.concluidas}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar OS, cliente ou responsável"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                className={`px-4 py-2 border rounded-lg text-sm flex items-center gap-1 ${
                  showFilters
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "border-gray-200 text-gray-700"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filtros
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {(selectedStatus.length > 0 || searchQuery) && (
                <button
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-1 hover:bg-red-50"
                  onClick={limparFiltros}
                >
                  <XMarkIcon className="w-5 h-5" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <h3 className="text-sm font-medium mb-3">Filtrar por Status</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedStatus.length === 0
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setSelectedStatus([])}
              >
                Todas
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedStatus.includes("novo")
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleStatusFilterChange("novo")}
              >
                Em Aberto
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedStatus.includes("em_andamento")
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleStatusFilterChange("em_andamento")}
              >
                Em Andamento
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedStatus.includes("concluido")
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleStatusFilterChange("concluido")}
              >
                Concluído
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={filtros.dataInicio || ""}
                  onChange={(e) =>
                    atualizarFiltros({
                      dataInicio: e.target.value || undefined,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  value={filtros.dataFim || ""}
                  onChange={(e) =>
                    atualizarFiltros({ dataFim: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-500">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  Nº OS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  Agendamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-4 px-6">
                    <div className="text-center py-8">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
                      <p className="text-gray-500">
                        Carregando ordens de serviço...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 px-6">
                    <div className="text-center text-gray-500 py-8">
                      Nenhuma ordem de serviço encontrada
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data?.map((os: OS) => (
                  <tr key={os.id} className="text-sm hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link
                        href={`/dashboard/ordens-servico/${os.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {os.numero}
                      </Link>
                    </td>
                    <td className="py-4 px-6 truncate">
                      {os.responsavel?.nome || "Não atribuído"}
                    </td>
                    <td className="py-4 px-6 truncate">{os.cliente.nome}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{os.agendamento}</td>
                    <td className="py-4 px-6">
                      <StatusOS status={os.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/dashboard/ordens-servico/${os.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {data && data.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Mostrando {Math.min(data.data.length, 10)} de {data.total}{" "}
                ordens de serviço
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50"
                  disabled={pagina === 1}
                  onClick={() => setPagina(pagina - 1)}
                >
                  Anterior
                </button>
                <span className="text-sm">
                  Página {pagina} de {Math.ceil(data.total / 10)}
                </span>
                <button
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50"
                  disabled={pagina >= Math.ceil(data.total / 10)}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
