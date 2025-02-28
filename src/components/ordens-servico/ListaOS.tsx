import { useState, useEffect } from "react";
import { OrdemServico, StatusOS, FiltrosOS } from "@/types/ordem-servico";
import { OrdemServicoService } from "@/services/OrdemServicoService";
import { UsuarioService } from "@/services/UsuarioService";
import { NivelAcesso } from "@/types/usuario";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function ListaOS() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosOS>({});
  const [busca, setBusca] = useState("");

  // Simular usuário logado
  const usuarioLogado = {
    id: 1,
    nivel: NivelAcesso.ADMINISTRADOR,
  };

  const carregarOrdens = async () => {
    setLoading(true);
    setErro(null);

    try {
      const filtrosCompletos: FiltrosOS = {
        ...filtros,
        busca: busca || undefined,
      };

      const listaOrdens = await OrdemServicoService.listarOrdens(
        filtrosCompletos,
        usuarioLogado.id,
        usuarioLogado.nivel
      );

      setOrdens(listaOrdens);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar as ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  // Carregar ordens quando montar componente
  useEffect(() => {
    carregarOrdens();
  }, []);

  // Atualizar lista quando filtros mudam
  useEffect(() => {
    carregarOrdens();
  }, [filtros, busca]);

  const handleStatusClick = (status: StatusOS | null) => {
    if (!status) {
      setFiltros((prev) => ({ ...prev, status: undefined }));
      return;
    }

    setFiltros((prev) => ({
      ...prev,
      status: [status],
    }));
  };

  const limparFiltros = () => {
    setFiltros({});
    setBusca("");
    setShowFiltros(false);
  };

  const getStatusLabel = (status: StatusOS) => {
    switch (status) {
      case StatusOS.EM_ABERTO:
        return "Em Aberto";
      case StatusOS.EM_ANDAMENTO:
        return "Em Andamento";
      case StatusOS.CONCLUIDA:
        return "Concluída";
      case StatusOS.FATURADA:
        return "Faturada";
      case StatusOS.REPROVADA:
        return "Reprovada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: StatusOS) => {
    switch (status) {
      case StatusOS.EM_ABERTO:
        return "bg-yellow-100 text-yellow-800";
      case StatusOS.EM_ANDAMENTO:
        return "bg-blue-100 text-blue-800";
      case StatusOS.CONCLUIDA:
        return "bg-green-100 text-green-800";
      case StatusOS.FATURADA:
        return "bg-purple-100 text-purple-800";
      case StatusOS.REPROVADA:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return "bg-gray-100 text-gray-800";
      case "media":
        return "bg-blue-100 text-blue-800";
      case "alta":
        return "bg-orange-100 text-orange-800";
      case "urgente":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Ordens de Serviço</h2>

        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar OS..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
          </div>

          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`px-3 py-2 border ${
              Object.keys(filtros).length > 0
                ? "border-blue-500 text-blue-500"
                : "border-gray-300 text-gray-700"
            } rounded-lg flex items-center`}
          >
            <FunnelIcon className="h-5 w-5 mr-1" />
            Filtros
            {Object.keys(filtros).length > 0 && (
              <span className="ml-1 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {Object.keys(filtros).length}
              </span>
            )}
          </button>

          <Link
            href="/dashboard/ordens-servico/nova"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="mr-1">+</span> Nova OS
          </Link>
        </div>
      </div>

      {/* Barra de filtros por status */}
      <div className="p-4 bg-gray-50 border-b flex items-center space-x-2">
        <button
          onClick={() => handleStatusClick(null)}
          className={`px-3 py-1 rounded ${
            !filtros.status
              ? "bg-gray-700 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Todas
        </button>

        <button
          onClick={() => handleStatusClick(StatusOS.EM_ABERTO)}
          className={`px-3 py-1 rounded ${
            filtros.status?.includes(StatusOS.EM_ABERTO)
              ? "bg-yellow-500 text-white"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          Em Aberto
        </button>

        <button
          onClick={() => handleStatusClick(StatusOS.EM_ANDAMENTO)}
          className={`px-3 py-1 rounded ${
            filtros.status?.includes(StatusOS.EM_ANDAMENTO)
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          }`}
        >
          Em Andamento
        </button>

        <button
          onClick={() => handleStatusClick(StatusOS.CONCLUIDA)}
          className={`px-3 py-1 rounded ${
            filtros.status?.includes(StatusOS.CONCLUIDA)
              ? "bg-green-500 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Concluídas
        </button>

        <button
          onClick={() => handleStatusClick(StatusOS.FATURADA)}
          className={`px-3 py-1 rounded ${
            filtros.status?.includes(StatusOS.FATURADA)
              ? "bg-purple-500 text-white"
              : "bg-purple-100 text-purple-800 hover:bg-purple-200"
          }`}
        >
          Faturadas
        </button>

        <button
          onClick={() => handleStatusClick(StatusOS.REPROVADA)}
          className={`px-3 py-1 rounded ${
            filtros.status?.includes(StatusOS.REPROVADA)
              ? "bg-red-500 text-white"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          Reprovadas
        </button>

        {Object.keys(filtros).length > 0 && (
          <button
            onClick={limparFiltros}
            className="ml-auto px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Painel de filtros avançados */}
      {showFiltros && (
        <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                placeholder="De"
                value={
                  filtros.dataDe
                    ? new Date(filtros.dataDe).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    dataDe: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
                className="p-2 border border-gray-300 rounded-lg w-full"
              />
              <input
                type="date"
                placeholder="Até"
                value={
                  filtros.dataAte
                    ? new Date(filtros.dataAte).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    dataAte: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
                className="p-2 border border-gray-300 rounded-lg w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <div className="flex flex-wrap gap-2">
              {["baixa", "media", "alta", "urgente"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const prioridadeAtual = filtros.prioridade || [];
                    const novasPrioridades = prioridadeAtual.includes(p)
                      ? prioridadeAtual.filter((item) => item !== p)
                      : [...prioridadeAtual, p];

                    setFiltros((prev) => ({
                      ...prev,
                      prioridade: novasPrioridades.length
                        ? novasPrioridades
                        : undefined,
                    }));
                  }}
                  className={`px-3 py-1 rounded text-sm ${
                    filtros.prioridade?.includes(p)
                      ? "bg-gray-700 text-white"
                      : getPrioridadeColor(p)
                  }`}
                >
                  {p === "baixa" && "Baixa"}
                  {p === "media" && "Média"}
                  {p === "alta" && "Alta"}
                  {p === "urgente" && "Urgente"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outros Filtros
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pendentesJustificativa"
                checked={!!filtros.pendentesJustificativa}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    pendentesJustificativa: e.target.checked || undefined,
                  }))
                }
                className="mr-2"
              />
              <label htmlFor="pendentesJustificativa" className="text-sm">
                Pendentes de Justificativa
              </label>
            </div>
          </div>
        </div>
      )}

      {erro && <div className="p-3 bg-red-50 text-red-600">{erro}</div>}

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Carregando ordens de serviço...
        </div>
      ) : ordens.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Nenhuma ordem de serviço encontrada
          {Object.keys(filtros).length > 0 && " com os filtros aplicados"}
          {busca && ` contendo "${busca}"`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Agendada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ordens.map((os) => (
                <tr
                  key={os.id}
                  onClick={() =>
                    router.push(`/dashboard/ordens-servico/${os.id}`)
                  }
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{os.id}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {os.titulo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {os.descricao.length > 50
                        ? `${os.descricao.substring(0, 50)}...`
                        : os.descricao}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        os.status
                      )}`}
                    >
                      {getStatusLabel(os.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {os.responsavelNome || "Não atribuído"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarData(os.dataAgendada)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPrioridadeColor(
                        os.prioridade
                      )}`}
                    >
                      {os.prioridade === "baixa" && "Baixa"}
                      {os.prioridade === "media" && "Média"}
                      {os.prioridade === "alta" && "Alta"}
                      {os.prioridade === "urgente" && "Urgente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
