import { Fragment, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ClosingReasonModal } from "./ClosingReasonModal";

interface StatusOSProps {
  status: string;
  onChangeStatus?: (novoStatus: string, closingReason?: string) => void;
  tamanho?: "sm" | "md" | "lg";
  isChanging?: boolean;
}

// Mapeamento entre status da API e do frontend
const statusApiToFrontend = {
  pendente: "novo",
  em_andamento: "em_andamento",
  concluida: "concluido",
  reprovada: "novo",
};

// Adicionando um console.log para debug
console.log("StatusOS inicializado com mapeamento:", statusApiToFrontend);

// Configuração de exibição dos status do frontend
const statusConfig = {
  novo: { cor: "bg-yellow-100 text-yellow-800", texto: "Em Aberto" },
  em_andamento: { cor: "bg-blue-100 text-blue-800", texto: "Em Andamento" },
  concluido: { cor: "bg-green-100 text-green-800", texto: "Concluído" },
};

export function StatusOS({
  status,
  onChangeStatus,
  tamanho = "md",
  isChanging = false,
}: StatusOSProps) {
  // Normalizar o status para o formato do frontend
  const normalizedStatus =
    statusApiToFrontend[status as keyof typeof statusApiToFrontend] || status;

  const [localStatus, setLocalStatus] = useState(normalizedStatus);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Atualizar o status local quando o status das props mudar
  useEffect(() => {
    const newNormalizedStatus =
      statusApiToFrontend[status as keyof typeof statusApiToFrontend] || status;
    setLocalStatus(newNormalizedStatus);
  }, [status]);

  // Usar status local ou props de acordo com quem está mais atualizado
  const statusAtual = statusConfig[
    localStatus as keyof typeof statusConfig
  ] || {
    cor: "bg-gray-100 text-gray-800",
    texto: "Desconhecido",
  };

  // Configurações de tamanho
  const tamanhoConfig = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const classesTamanho = tamanhoConfig[tamanho];

  // Se não receber onChangeStatus, renderiza apenas o badge estático
  if (!onChangeStatus) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium ${statusAtual.cor} ${classesTamanho}`}
      >
        {statusAtual.texto}
      </span>
    );
  }

  const handleStatusChange = (novoStatus: string) => {
    console.log("Tentando mudar status para:", novoStatus);

    // Para debug, vamos logar os valores importantes
    console.log({
      novoStatus,
      isOpeningModal: novoStatus === "concluido",
      pendingStatusBeforeChange: pendingStatus,
      currentLocalStatus: localStatus,
    });

    // Se o novo status for "concluido", abrir o modal de motivo
    if (novoStatus === "concluido") {
      console.log("Abrindo modal para status 'concluido'");
      setPendingStatus(novoStatus);
      setIsClosingModalOpen(true);
      setIsMenuOpen(false);
      return;
    }

    // Para outros status, simplesmente atualizar
    setLocalStatus(novoStatus);
    setIsMenuOpen(false);

    if (onChangeStatus) {
      onChangeStatus(novoStatus);
    }
  };

  const handleConfirmClosing = (closingReason: string) => {
    console.log("Modal confirmado com motivo:", closingReason);

    if (pendingStatus && onChangeStatus) {
      // Atualizamos o estado local imediatamente para feedback instantâneo
      setLocalStatus(pendingStatus);

      // Chamar o callback com o motivo de fechamento
      onChangeStatus(pendingStatus, closingReason);

      // Limpar estado
      setPendingStatus(null);
      setIsClosingModalOpen(false);
    }
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => {
          // Usar useEffect para atualizar o estado após a renderização
          useEffect(() => {
            if (open !== isMenuOpen) {
              setIsMenuOpen(open);
            }
          }, [open]);

          return (
            <>
              <Menu.Button
                className={`inline-flex items-center gap-2 rounded-full font-medium ${
                  statusAtual.cor
                } ${classesTamanho} ${isChanging ? "opacity-70" : ""}`}
                disabled={isChanging}
              >
                {isChanging ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    <span>Atualizando...</span>
                  </>
                ) : (
                  <>
                    {statusAtual.texto}
                    <ChevronDownIcon className="w-4 h-4" />
                  </>
                )}
              </Menu.Button>

              <Transition
                as={Fragment}
                show={isMenuOpen && !isChanging}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {localStatus !== "novo" && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("novo")}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block w-full px-4 py-2 text-left text-sm`}
                          >
                            Em Aberto
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {localStatus !== "em_andamento" && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("em_andamento")}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block w-full px-4 py-2 text-left text-sm`}
                          >
                            Em Andamento
                          </button>
                        )}
                      </Menu.Item>
                    )}

                    {localStatus !== "concluido" && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleStatusChange("concluido")}
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block w-full px-4 py-2 text-left text-sm`}
                          >
                            Concluído
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </div>
                </Menu.Items>
              </Transition>
            </>
          );
        }}
      </Menu>

      {/* Modal para informar o motivo do fechamento */}
      <ClosingReasonModal
        isOpen={isClosingModalOpen}
        onClose={() => {
          console.log("Modal fechado pelo usuário");
          setIsClosingModalOpen(false);
          setPendingStatus(null);
        }}
        onConfirm={handleConfirmClosing}
      />
    </>
  );
}
