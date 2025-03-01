import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AtribuirResponsavelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAtribuir: (userId: string, userData: TeamMember) => void;
}

export function AtribuirResponsavelModal({
  isOpen,
  onClose,
  onAtribuir,
}: AtribuirResponsavelModalProps) {
  const [membros, setMembros] = useState<TeamMember[]>([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Carregar os membros da equipe quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarMembros();
    }
  }, [isOpen]);

  // Função para carregar os membros da equipe
  const carregarMembros = async () => {
    try {
      setCarregando(true);
      setErro("");

      // Buscar membros da equipe
      const response = await axios.get("/api/team");

      if (response.data && Array.isArray(response.data)) {
        // Filtrar apenas membros ativos
        const membrosAtivos = response.data.filter(
          (membro: TeamMember) => membro.id
        );
        setMembros(membrosAtivos);
      } else {
        setErro("Formato de resposta inválido");
      }
    } catch (error) {
      console.error("Erro ao carregar membros da equipe:", error);
      setErro("Não foi possível carregar a lista de membros da equipe");
    } finally {
      setCarregando(false);
    }
  };

  // Filtrar membros por nome
  const membrosFiltrados = membros.filter((membro) =>
    filtroNome
      ? membro.name.toLowerCase().includes(filtroNome.toLowerCase())
      : true
  );

  // Função para traduzir o papel do usuário para português
  const traduzirPapel = (role: string): string => {
    const papeis: Record<string, string> = {
      owner: "Proprietário",
      manager: "Gerente",
      technician: "Técnico",
      assistant: "Assistente",
    };

    return papeis[role] || role;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Atribuir Responsável
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar funcionário"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                  />
                </div>

                {erro && (
                  <div className="text-red-500 text-sm mb-4">{erro}</div>
                )}

                {carregando ? (
                  <div className="text-center py-4 text-gray-500">
                    Carregando membros da equipe...
                  </div>
                ) : membrosFiltrados.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {membrosFiltrados.map((membro) => (
                      <button
                        key={membro.id}
                        onClick={() => onAtribuir(membro.id.toString(), membro)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {membro.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{membro.name}</div>
                          <div className="text-sm text-gray-500">
                            {traduzirPapel(membro.role)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {filtroNome
                      ? "Nenhum membro encontrado com este nome."
                      : "Nenhum membro da equipe disponível."}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
