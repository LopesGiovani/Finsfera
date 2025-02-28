import { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  ChevronLeftIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
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
} from "@/hooks/useOrdensServico";

export default function VisualizarOS() {
  const router = useRouter();
  const id = Number(router.query.id);

  const { data: os, isLoading } = useOrdemServico(id);
  const { mutate: mudarStatus } = useMudarStatusOS();
  const { mutate: registrarTempo } = useRegistrarTempo();

  const [activeTab, setActiveTab] = useState<
    "detalhes" | "timeline" | "comentarios"
  >("detalhes");
  const [isRegistrarTempoModalOpen, setIsRegistrarTempoModalOpen] =
    useState(false);
  const [isGerarFaturaModalOpen, setIsGerarFaturaModalOpen] = useState(false);
  const [status, setStatus] = useState("em_andamento");

  const handleRegistrarTempo = (dados: {
    horas: number;
    minutos: number;
    descricao: string;
  }) => {
    registrarTempo({ id, dados });
    setIsRegistrarTempoModalOpen(false);
  };

  const handleGerarFatura = (dados: {
    vencimento: string;
    condicaoPagamento: string;
    observacoes: string;
  }) => {
    // Aqui você implementaria a lógica para gerar a fatura
    console.log("Fatura gerada:", dados);
    // Atualizar o status da OS para "faturado"
    setStatus("faturado");
    setIsGerarFaturaModalOpen(false);
  };

  const handleChangeStatus = (novoStatus: string) => {
    mudarStatus({ id, status: novoStatus });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            {/* Esqueleto de carregamento... */}
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
          <Link
            href="/dashboard/ordens-servico"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium">OS #12345</h1>
            <p className="text-sm text-gray-500">Criada em 19/02/2025</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setStatus("concluido")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
            >
              Concluir OS
            </button>
            <button
              onClick={() => setIsGerarFaturaModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              Gerar Fatura
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("detalhes")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === "detalhes"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Detalhes
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === "timeline"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                <ClockIcon className="w-5 h-5" />
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("comentarios")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  activeTab === "comentarios"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                Comentários
              </button>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === "detalhes" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">
                    Informações Básicas
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Cliente</h3>
                      <p className="font-medium">Cliente Exemplo</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Status</h3>
                      <StatusOS
                        status={status}
                        onChangeStatus={handleChangeStatus}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Responsável</h3>
                      <p className="font-medium">João Silva</p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500">Prazo</h3>
                      <p className="font-medium">26/02/2025</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">Descrição</h2>
                  <p className="text-gray-600">
                    Descrição detalhada da ordem de serviço...
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-lg font-medium mb-4">Itens do Serviço</h2>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-3 font-medium">Descrição</th>
                        <th className="pb-3 font-medium">Tipo</th>
                        <th className="pb-3 font-medium">Qtd</th>
                        <th className="pb-3 font-medium">Valor Unit.</th>
                        <th className="pb-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="text-sm">
                        <td className="py-3">Item exemplo</td>
                        <td className="py-3">Serviço</td>
                        <td className="py-3">1</td>
                        <td className="py-3">R$ 100,00</td>
                        <td className="py-3">R$ 100,00</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="text-sm font-medium">
                        <td colSpan={4} className="py-3 text-right">
                          Total:
                        </td>
                        <td className="py-3">R$ 100,00</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "timeline" && <TimelineOS />}
            {activeTab === "comentarios" && <ComentariosOS />}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Tempo Registrado</h2>
              <div className="text-center">
                <div className="text-3xl font-medium mb-1">2h 30min</div>
                <p className="text-sm text-gray-500">Total registrado</p>
              </div>
              <button
                onClick={() => setIsRegistrarTempoModalOpen(true)}
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
              >
                Registrar Tempo
              </button>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Arquivos</h2>
              <UploadArquivos />
            </div>
          </div>
        </div>

        {/* Modais */}
        <RegistrarTempoModal
          isOpen={isRegistrarTempoModalOpen}
          onClose={() => setIsRegistrarTempoModalOpen(false)}
          onRegistrar={handleRegistrarTempo}
        />

        <GerarFaturaModal
          isOpen={isGerarFaturaModalOpen}
          onClose={() => setIsGerarFaturaModalOpen(false)}
          onGerar={handleGerarFatura}
          totalOS={1500.0}
        />
      </div>
    </DashboardLayout>
  );
}
