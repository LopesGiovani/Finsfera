import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  ChevronLeftIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { TimelineOS } from "@/components/ordens-servico/TimelineOS";
import { ComentariosOS } from "@/components/ordens-servico/ComentariosOS";
import { StatusOS } from "@/components/ordens-servico/StatusOS";
import { RegistrarTempoModal } from "@/components/ordens-servico/RegistrarTempoModal";
import { ClosingReasonModal } from "@/components/ordens-servico/ClosingReasonModal";
import { ReopenReasonModal } from "@/components/ordens-servico/ReopenReasonModal";
import { TransferirOS } from "@/components/ordens-servico/TransferirOS";
import { useRouter } from "next/router";
import {
  useOrdemServico,
  useMudarStatusOS,
  useRegistrarTempo,
  useEventosOS,
  useReabrirOS,
} from "@/hooks/useOrdensServico";
import { OrdensServicoService, OS } from "@/services/ordens-servico";
import { formatarData } from "@/utils/formatters";
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

    <div className="mb-6">
      <p className="text-gray-600">{os?.descricao}</p>

      {/* Motivo de fechamento - exibido logo após a descrição quando a OS estiver concluída */}
      {os?.status === "concluido" && os?.closingReason && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Motivo do Fechamento
          </h3>
          <p className="text-green-700">{os.closingReason}</p>
        </div>
      )}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="font-medium">Status:</span>
        <span className="ml-2">{os?.status}</span>
      </div>
      <div>
        <span className="font-medium">Responsável:</span>
        <span className="ml-2">{os?.responsavel?.nome || "Não atribuído"}</span>
      </div>
      <div>
        <span className="font-medium">Agendamento:</span>
        <span className="ml-2">
          {os?.agendamento ? formatarData(os.agendamento) : "Não definido"}
        </span>
      </div>
      <div>
        <span className="font-medium">Cliente:</span>
        <span className="ml-2">{os?.cliente?.nome || "Não atribuído"}</span>
      </div>
      {os?.closedAt && (
        <div>
          <span className="font-medium">Data de Conclusão:</span>
          <span className="ml-2">{formatarData(os.closedAt, true)}</span>
        </div>
      )}
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

// Função para converter data do formato DD/MM/YYYY para YYYY-MM-DD
const converterDataParaFormatoInput = (dataString: string): string => {
  try {
    // Verificar se a data já está no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
      return dataString;
    }

    // Tentar converter do formato DD/MM/YYYY para YYYY-MM-DD
    const partes = dataString.split("/");
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }

    // Se não conseguir converter, retornar string vazia
    return "";
  } catch (error) {
    console.error("Erro ao converter data:", error);
    return "";
  }
};

export default function VisualizarOS() {
  const router = useRouter();
  const { id: osId } = router.query;
  const {
    data: os,
    isLoading,
    error,
    refetch,
  } = useOrdemServico(osId ? Number(osId) : 0);
  const { mutate: mudarStatus } = useMudarStatusOS();
  const { mutate: registrarTempo } = useRegistrarTempo();
  const {
    data: eventos,
    isLoading: isLoadingEventos,
    refetch: refetchEventos,
  } = useEventosOS(osId ? Number(osId) : 0);
  const { mutate: reabrirOS } = useReabrirOS();

  // Estado local otimista da OS que podemos atualizar mesmo quando a API falha
  const [localOS, setLocalOS] = useState<typeof os | null>(null);

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
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "detalhes" | "timeline" | "comentarios" | "edicao"
  >("detalhes");
  const [isRegistrarTempoModalOpen, setIsRegistrarTempoModalOpen] =
    useState(false);

  // Estado para o link externo
  const [linkExterno, setLinkExterno] = useState("");
  const [isAdicionandoLink, setIsAdicionandoLink] = useState(false);

  // Estado para o formulário de edição
  const [editForm, setEditForm] = useState({
    titulo: "",
    descricao: "",
    agendamento: "",
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

  const handleChangeStatus = (novoStatus: string, closingReason?: string) => {
    if (!osId) return;

    console.log(
      `Alterando status para: ${novoStatus}${
        closingReason ? `, com motivo: ${closingReason}` : ""
      }`
    );

    // Validar se temos o motivo quando necessário
    if (novoStatus === "concluido" && !closingReason) {
      toast.error("É necessário informar o motivo para concluir a OS");
      return;
    }

    setIsChangingStatus(true);

    // Atualizar o estado local imediatamente para feedback visual
    if (os) {
      const osAtualizado = {
        ...os,
        status: novoStatus as any,
      };
      setLocalOS(osAtualizado);
    }

    mudarStatus(
      { id: Number(osId), status: novoStatus, closingReason },
      {
        onSuccess: (data) => {
          console.log("Status alterado com sucesso:", data);
          setIsChangingStatus(false);

          // Atualizar o estado local com os dados da API
          setLocalOS(data);
          refetch(); // Recarregar os dados da OS

          // Atualizar a timeline
          refetchEventos();

          // Mostrar mensagem de sucesso
          if (novoStatus === "concluido") {
            toast.success(`OS concluída com sucesso!`);
          } else {
            toast.success(`Status alterado para ${novoStatus}`);
          }
        },
        onError: (error: any) => {
          console.error("Erro ao alterar status:", error);
          setIsChangingStatus(false);

          // Reverter para o status original em caso de erro
          if (os) {
            setLocalOS(os);
          }

          // Exibir mensagem de erro amigável
          const mensagem =
            error.message ||
            `Não foi possível alterar o status para ${novoStatus}`;
          toast.error(mensagem);
        },
      }
    );
  };

  // Função para abrir o modal de conclusão da OS
  const handleOpenConclusionModal = () => {
    console.log("Abrindo modal de conclusão da OS");
    setIsClosingModalOpen(true);
  };

  // Função para tratar a confirmação do motivo de fechamento
  const handleConfirmClosing = (reason: string) => {
    console.log("Motivo de fechamento confirmado:", reason);
    setIsClosingModalOpen(false);
    handleChangeStatus("concluido", reason);
  };

  // Inicializar formulário quando os dados chegarem
  useEffect(() => {
    if (os) {
      setEditForm({
        titulo: os.titulo,
        descricao: os.descricao,
        agendamento: converterDataParaFormatoInput(os.agendamento),
      });
    }
  }, [os]);

  // Função para salvar as alterações
  const handleSave = async () => {
    if (!osId) return;

    try {
      // Criar uma cópia do formulário para enviar à API
      const dadosParaEnviar = {
        ...editForm,
        // Não precisamos converter o agendamento, pois já está no formato correto para a API
      };

      await OrdensServicoService.atualizar(Number(osId), dadosParaEnviar);
      toast.success("OS atualizada com sucesso!");
      setIsEditing(false);

      // Recarregar os dados da OS
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Não foi possível atualizar a OS");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Para todos os campos, usar o valor como está
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para adicionar/atualizar o link externo
  const handleSalvarLink = async () => {
    if (!osId) return;

    try {
      setIsAdicionandoLink(true);
      await OrdensServicoService.atualizar(Number(osId), {
        closingLink: linkExterno,
      });
      toast.success("Link adicionado com sucesso!");
      refetch(); // Recarregar os dados da OS
    } catch (error) {
      console.error("Erro ao salvar link:", error);
      toast.error("Não foi possível salvar o link");
    } finally {
      setIsAdicionandoLink(false);
    }
  };

  // Função para reabrir a OS (alterar status para pendente)
  const handleReopenOS = () => {
    if (!osId) return;

    console.log("Reabrindo a OS...");
    setIsReopenModalOpen(true);
  };

  const handleReopenConfirm = (reason: string) => {
    console.log("Motivo de reabertura confirmado:", reason);
    setIsReopenModalOpen(false);

    // Chamar mudarStatus com reopenReason
    if (!osId) return;

    setIsChangingStatus(true);

    // Atualizar o estado local imediatamente para feedback visual
    if (os) {
      const osAtualizado = {
        ...os,
        status: "novo" as any,
      };
      setLocalOS(osAtualizado);
    }

    mudarStatus(
      {
        id: Number(osId),
        status: "novo",
        reopenReason: reason,
      },
      {
        onSuccess: (data) => {
          console.log("Status alterado com sucesso:", data);
          setIsChangingStatus(false);

          // Atualizar o estado local com os dados da API
          setLocalOS(data);
          refetch(); // Recarregar os dados da OS

          // Atualizar a timeline
          refetchEventos();

          toast.success(`OS reaberta com sucesso!`);
        },
        onError: (error: any) => {
          console.error("Erro ao reabrir OS:", error);
          setIsChangingStatus(false);

          // Reverter para o status original em caso de erro
          if (os) {
            setLocalOS(os);
          }

          // Exibir mensagem de erro amigável
          const mensagem = error.message || "Não foi possível reabrir a OS";
          toast.error(mensagem);
        },
      }
    );
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
              Agendamento
            </label>
            <Input
              type="date"
              name="agendamento"
              value={editForm.agendamento}
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
            {os.status !== "concluido" ? (
              <button
                onClick={handleOpenConclusionModal}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                disabled={isChangingStatus}
              >
                {isChangingStatus ? "Processando..." : "Concluir OS"}
              </button>
            ) : (
              <button
                onClick={handleReopenOS}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                disabled={isChangingStatus}
              >
                {isChangingStatus ? "Processando..." : "Reabrir OS"}
              </button>
            )}
          </div>
        </div>

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
                      <h3 className="text-sm text-gray-500">Agendamento</h3>
                      <p className="font-medium">{os.agendamento}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="text-lg font-medium mb-2">Detalhes</h2>
                  <p className="text-gray-600">{os.descricao}</p>
                </div>

                {os.status === "concluido" && os.closingReason && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-green-800 mb-2">
                      Motivo do Fechamento
                    </h2>
                    <p className="text-green-700">{os.closingReason}</p>
                  </div>
                )}

                {os.status === "novo" && os.reopenReason && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-blue-800 mb-2">
                      Motivo da Reabertura
                    </h2>
                    <p className="text-blue-700">{os.reopenReason}</p>
                  </div>
                )}

                {/* Adicionar componente de transferência apenas se a OS não estiver concluída */}
                {os.status !== "concluido" && (
                  <TransferirOS
                    osId={os.id}
                    currentAssigneeId={os.responsavel?.id}
                    onSuccess={() => refetch()}
                  />
                )}

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">Link Externo</h2>
                  <div className="space-y-4">
                    {localOS?.closingLink ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Link atual:</p>
                        <a
                          href={localOS.closingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <LinkIcon className="h-4 w-4" />
                          {localOS.closingLink}
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Nenhum link adicionado ainda.
                      </p>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="link-externo"
                        className="text-sm font-medium text-gray-700"
                      >
                        {localOS?.closingLink
                          ? "Atualizar link"
                          : "Adicionar link"}
                        :
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="link-externo"
                          type="text"
                          value={linkExterno}
                          onChange={(e) => setLinkExterno(e.target.value)}
                          placeholder="https://exemplo.com/documento"
                          className="px-3 py-2 border border-gray-300 rounded-lg flex-grow text-sm"
                        />
                        <button
                          onClick={handleSalvarLink}
                          disabled={isAdicionandoLink || !linkExterno}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isAdicionandoLink ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <TimelineOS
                eventos={eventos || []}
                isLoading={isLoadingEventos}
              />
            )}

            {activeTab === "comentarios" && osId && (
              <ComentariosOS osId={Number(osId)} />
            )}

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
                        Agendamento
                      </label>
                      <input
                        type="date"
                        id="agendamento"
                        name="agendamento"
                        value={editForm.agendamento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RegistrarTempoModal
        isOpen={isRegistrarTempoModalOpen}
        onClose={() => setIsRegistrarTempoModalOpen(false)}
        onRegistrar={handleRegistrarTempo}
      />

      {/* Modal de motivo de fechamento para o botão Concluir OS */}
      <ClosingReasonModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        onConfirm={handleConfirmClosing}
      />

      {/* Modal de motivo de reabertura para o botão Reabrir OS */}
      <ReopenReasonModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onConfirm={handleReopenConfirm}
      />
    </DashboardLayout>
  );
}
