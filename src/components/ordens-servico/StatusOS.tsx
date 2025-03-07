import { Fragment, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface StatusOSProps {
  status: string;
  onChangeStatus?: (novoStatus: string) => void;
  tamanho?: "sm" | "md" | "lg";
  isChanging?: boolean;
}

// Mapeamento entre status da API e do frontend
const statusApiToFrontend = {
  pendente: "novo",
  em_andamento: "em_andamento",
  concluida: "concluido",
  reprovada: "cancelado"
};

// Adicionando um console.log para debug
console.log("StatusOS inicializado com mapeamento:", statusApiToFrontend);

// Configuração de exibição dos status do frontend
const statusConfig = {
  novo: { cor: "bg-yellow-100 text-yellow-800", texto: "Em Aberto" },
  em_andamento: { cor: "bg-blue-100 text-blue-800", texto: "Em Andamento" },
  pausado: { cor: "bg-orange-100 text-orange-800", texto: "Pausado" },
  concluido: { cor: "bg-green-100 text-green-800", texto: "Concluído" },
  cancelado: { cor: "bg-red-100 text-red-800", texto: "Cancelado" }
};

export function StatusOS({
  status,
  onChangeStatus,
  tamanho = "md",
  isChanging = false,
}: StatusOSProps) {
  // Normalizar o status para o formato do frontend
  const normalizedStatus = statusApiToFrontend[status as keyof typeof statusApiToFrontend] || status;
  
  const [localStatus, setLocalStatus] = useState(normalizedStatus);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Atualizar o status local quando o status das props mudar
  useEffect(() => {
    const newNormalizedStatus = statusApiToFrontend[status as keyof typeof statusApiToFrontend] || status;
    setLocalStatus(newNormalizedStatus);
  }, [status]);

  // Usar status local ou props de acordo com quem está mais atualizado
  const statusAtual = statusConfig[localStatus as keyof typeof statusConfig] || {
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
    console.log("Mudando status para:", novoStatus);
    // Atualizamos o estado local imediatamente para feedback instantâneo
    setLocalStatus(novoStatus);
    setIsMenuOpen(false);

    if (onChangeStatus) {
      onChangeStatus(novoStatus);
    }
  };

  return (
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <Menu.Item key={key}>
                      {({ active }) => (
                        <button
                          onClick={() => handleStatusChange(key)}
                          className={`${
                            active ? "bg-gray-50" : ""
                          } w-full text-left px-4 py-2 text-sm flex items-center`}
                          disabled={isChanging}
                        >
                          <span
                            className={`inline-block w-3 h-3 rounded-full mr-2 ${
                              value.cor.split(" ")[0]
                            }`}
                          />
                          {value.texto}
                          {key === localStatus && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        );
      }}
    </Menu>
  );
}
