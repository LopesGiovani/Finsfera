import { useState, useEffect } from "react";
import { OrdemServico, StatusOS } from "@/types/ordem-servico";
import { OrdemServicoService } from "@/services/OrdemServicoService";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface NotificacaoOSPendentesProps {
  usuarioId: number;
  onClose: () => void;
  onJustificativaEnviada: () => void;
}

export function NotificacaoOSPendentes({
  usuarioId,
  onClose,
  onJustificativaEnviada,
}: NotificacaoOSPendentesProps) {
  const [loading, setLoading] = useState(true);
  const [osPendentes, setOSPendentes] = useState<OrdemServico[]>([]);
  const [justificativas, setJustificativas] = useState<Record<number, string>>(
    {}
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const verificarPendencias = async () => {
      setLoading(true);

      try {
        const pendentes = await OrdemServicoService.verificarOSPendentes(
          usuarioId
        );
        setOSPendentes(pendentes);

        // Inicializar objeto de justificativas
        const justificativasIniciais: Record<number, string> = {};
        pendentes.forEach((os) => {
          justificativasIniciais[os.id] = "";
        });
        setJustificativas(justificativasIniciais);
      } catch (error) {
        console.error(error);
        setErro("Erro ao verificar ordens de serviço pendentes");
      } finally {
        setLoading(false);
      }
    };

    verificarPendencias();
  }, [usuarioId]);

  const handleJustificativaChange = (osId: number, texto: string) => {
    setJustificativas((prev) => ({
      ...prev,
      [osId]: texto,
    }));
  };

  const enviarJustificativas = async () => {
    // Verificar se todas as justificativas foram preenchidas
    const osIdsSemJustificativa = osPendentes
      .filter((os) => !justificativas[os.id].trim())
      .map((os) => os.id);

    if (osIdsSemJustificativa.length > 0) {
      setErro(
        `Preencha a justificativa para todas as OS pendentes (${osIdsSemJustificativa.join(
          ", "
        )})`
      );
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      // Enviar justificativas para cada OS pendente
      for (const os of osPendentes) {
        await OrdemServicoService.adicionarJustificativa(
          os.id,
          justificativas[os.id],
          usuarioId,
          "Usuário" // Nome seria obtido do contexto de autenticação
        );
      }

      onJustificativaEnviada();
    } catch (error) {
      console.error(error);
      setErro("Erro ao enviar justificativas. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const getStatusLabel = (status: StatusOS) => {
    switch (status) {
      case StatusOS.EM_ABERTO:
        return "Em Aberto";
      case StatusOS.EM_ANDAMENTO:
        return "Em Andamento";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <p className="text-center">
            Verificando ordens de serviço pendentes...
          </p>
        </div>
      </div>
    );
  }

  if (osPendentes.length === 0) {
    return null; // Não mostrar nada se não houver pendências
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Ordens de Serviço Pendentes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <p className="mb-4 text-gray-600">
          Você possui {osPendentes.length} orden(s) de serviço pendente(s). Por
          favor, forneça uma justificativa para cada uma delas antes de sair.
        </p>

        {erro && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
          {osPendentes.map((os) => (
            <div key={os.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="font-medium">
                    OS #{os.id}: {os.titulo}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Status: {getStatusLabel(os.status)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificativa
                </label>
                <textarea
                  value={justificativas[os.id]}
                  onChange={(e) =>
                    handleJustificativaChange(os.id, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Informe o motivo pelo qual esta OS está pendente..."
                  disabled={enviando}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            disabled={enviando}
          >
            Voltar
          </button>

          <button
            onClick={enviarJustificativas}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar e Sair"}
          </button>
        </div>
      </div>
    </div>
  );
}
