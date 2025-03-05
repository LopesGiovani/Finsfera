import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  ChevronLeftIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { TimelineOS } from "@/components/ordens-servico/TimelineOS";
import { ComentariosOS } from "@/components/ordens-servico/ComentariosOS";
import { StatusOS } from "@/components/ordens-servico/StatusOS";
import { RegistrarTempoModal } from "@/components/ordens-servico/RegistrarTempoModal";
import { GerarFaturaModal } from "@/components/ordens-servico/GerarFaturaModal";
import { UploadArquivos } from "@/components/ordens-servico/UploadArquivos";
import { useRouter } from "next/router";
import {
  useOrdemServico,
  useMudarStatusOS,
  useRegistrarTempo,
  useGerarFatura,
  useEventosOS,
  useLimparDadosOS,
  useVerificarIntegridadeDados,
  useOrdensServico,
} from "@/hooks/useOrdensServico";
import { OrdensServicoService, OS } from "@/services/ordens-servico";
import { formatarMoeda, formatarData } from "@/utils/formatters";
import { toast } from "react-hot-toast";
import { Tab } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TabProps {
  os: OS | null | undefined;
}

// Componentes das abas
const DetalhesTab = ({ os }: TabProps) => (
  <div className="space-y-4 p-4">
    <h2 className="text-2xl font-bold">{os?.titulo}</h2>
    <p className="text-gray-600">{os?.descricao}</p>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="font-medium">Status:</span>
        <span className="ml-2">{os?.status}</span>
      </div>
      <div>
        <span className="font-medium">Valor Total:</span>
        <span className="ml-2">{formatarMoeda(os?.valorTotal || 0)}</span>
      </div>
      <div>
        <span className="font-medium">Prazo:</span>
        <span className="ml-2">{formatarData(os?.prazo)}</span>
      </div>
    </div>
  </div>
);

const TimelineTab = ({ os }: TabProps) => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Histórico de Alterações</h3>
    {/* Implementar timeline aqui */}
  </div>
);

const ComentariosTab = ({ os }: TabProps) => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Comentários</h3>
    {/* Implementar comentários aqui */}
  </div>
);

export default function VisualizarOS() {
  const router = useRouter();
  const { id: osId } = router.query;
  const {
    data: os,
    isLoading,
    error,
  } = useOrdemServico(osId ? String(osId) : "");
  const { mutate: mudarStatus } = useMudarStatusOS();
  const { mutate: registrarTempo } = useRegistrarTempo();
  const { mutate: gerarFatura } = useGerarFatura();
  const { data: eventos, isLoading: isLoadingEventos } = useEventosOS(
    osId ? Number(osId) : 0
  );
  const { limparDados } = useLimparDadosOS();
  const { verificarIntegridade } = useVerificarIntegridadeDados();
  const { atualizar } = useOrdensServico();

  // Estado local otimista da OS que podemos atualizar mesmo quando a API falha
  const [localOS, setLocalOS] = useState<typeof os | null>(null);
  const [isLimpando, setIsLimpando] = useState(false);

  // Combinar os dados da API com os dados locais (os locais têm prioridade)
  const osData = useMemo(() => {
    // Se não temos dados nem da API nem locais, retorna null
    if (!os && !localOS) return null;

    // Se temos dados locais, eles têm prioridade
    if (localOS) return localOS;

    // Caso contrário, usamos os dados da API
    return os;
  }, [os, localOS]);

  // Atualizar o estado local quando os dados da API mudarem
  useEffect(() => {
    if (
      os &&
      (!localOS || new Date(os.updatedAt) > new Date(localOS.updatedAt))
    ) {
      setLocalOS(os);
    }
  }, [os, localOS]);

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "detalhes" | "timeline" | "comentarios" | "edicao"
  >("detalhes");
  const [isRegistrarTempoModalOpen, setIsRegistrarTempoModalOpen] =
    useState(false);
  const [isGerarFaturaModalOpen, setIsGerarFaturaModalOpen] = useState(false);

  // Estado para o formulário de edição
  const [editForm, setEditForm] = useState({
    titulo: "",
    descricao: "",
    valorTotal: 0,
    prazo: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleRegistrarTempo = (dados: {
    horas: number;
    minutos: number;
    descricao: string;
  }) => {
    registrarTempo({ id: osId ? Number(osId) : 0, dados });
    setIsRegistrarTempoModalOpen(false);
  };

  const handleGerarFatura = (dados: {
    vencimento: string;
    condicaoPagamento: string;
    observacoes: string;
  }) => {
    gerarFatura({ id: osId ? Number(osId) : 0, dados });
    setIsGerarFaturaModalOpen(false);
  };

  const handleChangeStatus = (novoStatus: string) => {
    setIsChangingStatus(true);

    // Criar uma cópia local da OS com o status atualizado
    if (osData) {
      const updatedOS = {
        ...osData,
        status: novoStatus as
          | "novo"
          | "em_andamento"
          | "pausado"
          | "concluido"
          | "cancelado"
          | "faturado",
        updatedAt: new Date().toISOString(),
      };

      // Atualizar o estado local imediatamente para feedback instantâneo
      setLocalOS(updatedOS);
    }

    mudarStatus(
      { id, status: novoStatus },
      {
        onSuccess: (data) => {
          setIsChangingStatus(false);
          // Atualizar o estado local com os dados da API
          setLocalOS(data);
          refetch(); // Recarregar os dados da OS
        },
        onError: () => {
          setIsChangingStatus(false);
          // Manter o estado local atualizado mesmo com falha na API
          toast.error(
            "Erro ao salvar no servidor. O status foi salvo localmente e será sincronizado quando possível.",
            { duration: 5000 }
          );
        },
      }
    );
  };

  const handleLimparCache = async () => {
    setIsLimpando(true);
    try {
      const resultado = await limparDados();
      if (resultado.success) {
        toast.success("Dados em cache limpos com sucesso!");
        // Limpar o estado local também
        setLocalOS(null);
      } else {
        toast.error("Erro ao limpar dados em cache");
      }
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      toast.error("Ocorreu um erro ao limpar o cache");
    } finally {
      setIsLimpando(false);
    }
  };

  const handleSincronizarDados = async () => {
    try {
      await verificarIntegridade();
      // A OS será atualizada automaticamente pelos eventos do React Query
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      toast.error("Ocorreu um erro ao sincronizar os dados");
    }
  };

  // Inicializar formulário quando os dados chegarem
  useEffect(() => {
    if (os) {
      setEditForm({
        titulo: os.titulo,
        descricao: os.descricao,
        valorTotal: os.valorTotal,
        prazo: os.prazo,
      });
    }
  }, [os]);

  // Função para salvar as alterações
  const handleSave = async () => {
    try {
      await OrdensServicoService.atualizar(id, editForm);
      toast.success("OS atualizada com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Erro ao atualizar OS");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "valorTotal" ? parseFloat(value) || 0 : value,
    }));
  };

  const tabs = [
    { name: "Detalhes", content: <DetalhesTab os={os} /> },
    { name: "Timeline", content: <TimelineTab os={os} /> },
    { name: "Comentários", content: <ComentariosTab os={os} /> },
    {
      name: "Editar",
      content: (
        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <Input
              name="titulo"
              value={editForm.titulo}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <Textarea
              name="descricao"
              value={editForm.descricao}
              onChange={handleInputChange}
              className="mt-1"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor Total
            </label>
            <Input
              type="number"
              name="valorTotal"
              value={editForm.valorTotal}
              onChange={handleInputChange}
              className="mt-1"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prazo
            </label>
            <Input
              type="date"
              name="prazo"
              value={editForm.prazo}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!os) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-medium">
              {os.numero} - {os.titulo}
            </h1>
            <p className="text-gray-500 text-sm">
              Criada em {formatarData(os.createdAt, true)}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {os.status !== "concluido" && os.status !== "faturado" && (
              <button
                onClick={() => handleChangeStatus("concluido")}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                disabled={isChangingStatus}
              >
                Concluir OS
              </button>
            )}
            {os.status === "concluido" && (
              <button
                onClick={() => setIsGerarFaturaModalOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                Gerar Fatura
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSincronizarDados}
            disabled={isVerificando}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <CloudArrowUpIcon
              className={`w-5 h-5 ${isVerificando ? "animate-pulse" : ""}`}
            />
            {isVerificando ? "Sincronizando..." : "Sincronizar"}
          </button>
          <button
            onClick={handleLimparCache}
            disabled={isLimpando}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${isLimpando ? "animate-spin" : ""}`}
            />
            {isLimpando ? "Limpando..." : "Atualizar Dados"}
          </button>
        </div>

        {/* Alerta de estado de sincronização se houver modificações locais */}
        {os._statusAlteradoOffline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-700 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
              Esta ordem de serviço tem alterações locais que ainda não foram
              sincronizadas com o servidor.
            </p>
            <button
              onClick={handleSincronizarDados}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Tentar sincronizar agora
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl overflow-hidden mb-8">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                className={`px-6 py-4 text-sm ${
                  activeTab === "detalhes"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("detalhes")}
              >
                Detalhes
              </button>
              <button
                className={`px-6 py-4 text-sm ${
                  activeTab === "timeline"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("timeline")}
              >
                Timeline
              </button>
              <button
                className={`px-6 py-4 text-sm ${
                  activeTab === "comentarios"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("comentarios")}
              >
                Comentários
              </button>
              <button
                className={`px-6 py-4 text-sm ${
                  activeTab === "edicao"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("edicao")}
              >
                Edição
              </button>
              <div className="ml-auto py-2 pr-4">
                <button
                  onClick={() => setIsRegistrarTempoModalOpen(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <ClockIcon className="w-4 h-4" />
                  Registrar Tempo
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "detalhes" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">
                    Informações Básicas
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Cliente</h3>
                      <p className="font-medium">{os.cliente.nome}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Status</h3>
                      <StatusOS
                        status={os.status}
                        onChangeStatus={handleChangeStatus}
                        isChanging={isChangingStatus}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Responsável</h3>
                      <p className="font-medium">
                        {os.responsavel?.nome || "Não atribuído"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Prazo</h3>
                      <p className="font-medium">{os.prazo}</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Valor</h3>
                      <p className="font-medium">
                        {formatarMoeda(os.valorTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">Descrição</h2>
                  <p className="text-gray-600">{os.descricao}</p>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">Arquivos</h2>
                  <UploadArquivos osId={id} />
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <TimelineOS
                eventos={eventos || []}
                isLoading={isLoadingEventos}
              />
            )}

            {activeTab === "comentarios" && <ComentariosOS osId={id} />}

            {activeTab === "edicao" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium">Editar OS</h2>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
                        >
                          <CheckIcon className="w-5 h-5" />
                          Salvar
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Editar
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={editForm.titulo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, titulo: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={editForm.descricao}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            descricao: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Total
                      </label>
                      <input
                        type="number"
                        value={editForm.valorTotal}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            valorTotal: Number(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prazo
                      </label>
                      <input
                        type="date"
                        value={editForm.prazo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, prazo: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isRegistrarTempoModalOpen && (
        <RegistrarTempoModal
          isOpen={isRegistrarTempoModalOpen}
          onClose={() => setIsRegistrarTempoModalOpen(false)}
          onRegistrar={handleRegistrarTempo}
        />
      )}

      {isGerarFaturaModalOpen && (
        <GerarFaturaModal
          isOpen={isGerarFaturaModalOpen}
          onClose={() => setIsGerarFaturaModalOpen(false)}
          onGerar={handleGerarFatura}
          totalOS={os.valorTotal}
        />
      )}
    </DashboardLayout>
  );
}
