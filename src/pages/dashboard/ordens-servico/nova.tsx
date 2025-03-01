import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ItemServico } from "@/components/ordens-servico/ItemServico";
import { AtribuirResponsavelModal } from "@/components/ordens-servico/AtribuirResponsavelModal";
import axios from "axios";
import { useRouter } from "next/router";

// Interface para os clientes
interface Cliente {
  id: number;
  name: string;
  document: string;
  email: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function NovaOS() {
  const router = useRouter();
  const [itens, setItens] = useState<number[]>([]);
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
  const [responsavel, setResponsavel] = useState<string | null>(null);
  const [responsavelDados, setResponsavelDados] = useState<TeamMember | null>(
    null
  );
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | "">("");
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [erroClientes, setErroClientes] = useState("");

  // Estados para os campos do formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [prazo, setPrazo] = useState("");
  const [horasEstimadas, setHorasEstimadas] = useState("");

  // Estado para indicar quando estamos enviando o formulário
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  // Carregar clientes ao montar o componente
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        setCarregandoClientes(true);
        setErroClientes("");

        // Buscar apenas clientes ativos
        const response = await axios.get("/api/customers?active=true");

        if (response.data && Array.isArray(response.data)) {
          setClientes(response.data);
        } else {
          setErroClientes("Formato de resposta inválido");
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        setErroClientes("Não foi possível carregar a lista de clientes");
      } finally {
        setCarregandoClientes(false);
      }
    };

    carregarClientes();
  }, []);

  const adicionarItem = () => {
    setItens([...itens, itens.length]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleAtribuirResponsavel = (userId: string, userData: TeamMember) => {
    setResponsavel(userId);
    setResponsavelDados(userData);
    setIsAtribuirModalOpen(false);
  };

  // Função para criar a ordem de serviço
  const handleCriarOS = async () => {
    // Validação dos campos obrigatórios
    if (!titulo) {
      setErro("O título é obrigatório");
      return;
    }

    if (!descricao) {
      setErro("A descrição é obrigatória");
      return;
    }

    if (!responsavel) {
      setErro("É necessário atribuir um responsável");
      return;
    }

    if (!prazo) {
      setErro("O prazo é obrigatório");
      return;
    }

    try {
      setEnviando(true);
      setErro("");

      // Preparar dados da ordem de serviço
      const dadosOS = {
        title: titulo,
        description: descricao,
        priority: prioridade,
        assignedToId: parseInt(responsavel),
        scheduledDate: prazo,
        ...(clienteSelecionado ? { customerId: clienteSelecionado } : {}),
      };

      // Enviar para a API
      const response = await axios.post("/api/service-orders", dadosOS);

      // Redirecionar para a lista de ordens de serviço após criação bem-sucedida
      if (response.status === 201) {
        router.push("/dashboard/ordens-servico");
      }
    } catch (error: any) {
      console.error("Erro ao criar ordem de serviço:", error);
      setErro(
        error.response?.data?.message ||
          "Não foi possível criar a ordem de serviço. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

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
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/ordens-servico"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-medium">Nova Ordem de Serviço</h1>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Informações Básicas</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Cliente
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    value={clienteSelecionado}
                    onChange={(e) =>
                      setClienteSelecionado(
                        e.target.value ? parseInt(e.target.value) : ""
                      )
                    }
                    disabled={carregandoClientes}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.name} ({cliente.document})
                      </option>
                    ))}
                  </select>
                  {carregandoClientes && (
                    <p className="text-sm text-gray-500 mt-1">
                      Carregando clientes...
                    </p>
                  )}
                  {erroClientes && (
                    <p className="text-sm text-red-500 mt-1">{erroClientes}</p>
                  )}
                  {!carregandoClientes &&
                    !erroClientes &&
                    clientes.length === 0 && (
                      <p className="text-sm text-orange-500 mt-1">
                        Nenhum cliente encontrado.{" "}
                        <Link
                          href="/dashboard/clientes/novo"
                          className="text-blue-500 underline"
                        >
                          Adicionar um cliente
                        </Link>
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    placeholder="Digite o título da OS"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Descrição
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    rows={4}
                    placeholder="Descreva o serviço a ser realizado"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Prioridade
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value)}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Itens do Serviço</h2>
                <button
                  onClick={adicionarItem}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Adicionar Item
                </button>
              </div>

              {itens.map((item, index) => (
                <ItemServico key={index} index={index} onRemove={removerItem} />
              ))}

              {itens.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Nenhum item adicionado
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Atribuição</h2>
              {responsavel ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {responsavelDados?.name
                      ? responsavelDados.name.substring(0, 2).toUpperCase()
                      : "??"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {responsavelDados?.name || `Funcionário ${responsavel}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {responsavelDados?.role
                        ? traduzirPapel(responsavelDados.role)
                        : `Departamento ${responsavel}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAtribuirModalOpen(true)}
                    className="ml-auto text-sm text-blue-500"
                  >
                    Alterar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAtribuirModalOpen(true)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-blue-500"
                >
                  Atribuir Responsável
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Datas</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Prazo
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Previsão de Horas
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    value={horasEstimadas}
                    onChange={(e) => setHorasEstimadas(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t">
          <Link
            href="/dashboard/ordens-servico"
            className="px-4 py-2 text-gray-600 text-sm"
          >
            Cancelar
          </Link>
          <button
            onClick={handleCriarOS}
            disabled={enviando}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg text-sm ${
              enviando ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {enviando ? "Criando..." : "Criar OS"}
          </button>
        </div>

        <AtribuirResponsavelModal
          isOpen={isAtribuirModalOpen}
          onClose={() => setIsAtribuirModalOpen(false)}
          onAtribuir={handleAtribuirResponsavel}
        />
      </div>
    </DashboardLayout>
  );
}
