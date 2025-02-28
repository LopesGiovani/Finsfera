import { useState, useEffect, useRef } from "react";
import {
  OrdemServico,
  StatusOS,
  Arquivo,
  Justificativa,
} from "@/types/ordem-servico";
import { OrdemServicoService } from "@/services/OrdemServicoService";
import { NivelAcesso } from "@/types/usuario";
import { useRouter } from "next/router";
import {
  PaperClipIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface DetalhesOSProps {
  osId: number;
}

export function DetalhesOS({ osId }: DetalhesOSProps) {
  const router = useRouter();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [os, setOS] = useState<OrdemServico | null>(null);
  const [linkEvidencia, setLinkEvidencia] = useState("");
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [showPopUp, setShowPopUp] = useState(false);

  // Simular usuário logado para development
  const usuarioLogado = {
    id: 1,
    nome: "Administrador",
    nivel: NivelAcesso.ADMINISTRADOR,
  };

  // Carregar dados da OS
  useEffect(() => {
    const carregarOS = async () => {
      if (!osId) return;

      setLoading(true);
      setErro(null);

      try {
        const ordem = await OrdemServicoService.obterOrdem(
          osId,
          usuarioLogado.id,
          usuarioLogado.nivel
        );

        if (!ordem) {
          setErro("Ordem de serviço não encontrada ou sem permissão de acesso");
          return;
        }

        setOS(ordem);
      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar dados da OS");
      } finally {
        setLoading(false);
      }
    };

    carregarOS();
  }, [osId]);

  const atualizarStatus = async (novoStatus: StatusOS) => {
    if (!os) return;

    setAtualizando(true);
    setErro(null);

    try {
      const dadosAdicionais: {
        linkEvidencia?: string;
        motivoReprovacao?: string;
      } = {};

      // Validações específicas por status
      if (novoStatus === StatusOS.CONCLUIDA) {
        if (!linkEvidencia && !os.linkEvidencia) {
          setErro(
            "É necessário fornecer um link de evidência para concluir a OS"
          );
          setAtualizando(false);
          return;
        }

        dadosAdicionais.linkEvidencia = linkEvidencia;
      } else if (novoStatus === StatusOS.REPROVADA) {
        if (!motivoReprovacao) {
          setErro("É necessário fornecer um motivo para reprovar a OS");
          setAtualizando(false);
          return;
        }

        dadosAdicionais.motivoReprovacao = motivoReprovacao;
      }

      const osAtualizada = await OrdemServicoService.atualizarStatus(
        os.id,
        novoStatus,
        dadosAdicionais
      );

      if (osAtualizada) {
        setOS(osAtualizada);
      }
    } catch (error: any) {
      setErro(error.message || "Erro ao atualizar status da OS");
    } finally {
      setAtualizando(false);
    }
  };

  const adicionarJustificativa = async () => {
    if (!os || !justificativa) return;

    setAtualizando(true);
    setErro(null);

    try {
      await OrdemServicoService.adicionarJustificativa(
        os.id,
        justificativa,
        usuarioLogado.id,
        usuarioLogado.nome
      );

      // Recarregar dados da OS
      const osAtualizada = await OrdemServicoService.obterOrdem(
        os.id,
        usuarioLogado.id,
        usuarioLogado.nivel
      );

      if (osAtualizada) {
        setOS(osAtualizada);
      }

      setJustificativa("");
      setShowPopUp(false);
    } catch (error) {
      console.error(error);
      setErro("Erro ao adicionar justificativa");
    } finally {
      setAtualizando(false);
    }
  };

  const handleArquivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      setArquivosSelecionados((prev) => [...prev, ...arquivos]);
    }
  };

  const uploadArquivos = async () => {
    if (!os || arquivosSelecionados.length === 0) return;

    setAtualizando(true);
    setErro(null);

    try {
      await OrdemServicoService.adicionarArquivos(os.id, arquivosSelecionados);

      // Recarregar dados da OS
      const osAtualizada = await OrdemServicoService.obterOrdem(
        os.id,
        usuarioLogado.id,
        usuarioLogado.nivel
      );

      if (osAtualizada) {
        setOS(osAtualizada);
      }

      setArquivosSelecionados([]);
    } catch (error) {
      console.error(error);
      setErro("Erro ao fazer upload dos arquivos");
    } finally {
      setAtualizando(false);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarDataHora = (data: Date) => {
    return new Date(data).toLocaleString("pt-BR");
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

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return "Baixa";
      case "media":
        return "Média";
      case "alta":
        return "Alta";
      case "urgente":
        return "Urgente";
      default:
        return prioridade;
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

  // Verificar se o usuário pode atuar na OS
  const podeAtuar = () => {
    if (!os) return false;

    // Administradores sempre podem atuar
    if (usuarioLogado.nivel === NivelAcesso.ADMINISTRADOR) return true;

    // Supervisores podem aprovar/reprovar
    if (
      usuarioLogado.nivel === NivelAcesso.SUPERVISOR &&
      os.status === StatusOS.CONCLUIDA
    )
      return true;

    // Responsável pela OS pode atualizar status
    return os.responsavelId === usuarioLogado.id;
  };

  // Verificar se o usuário é o responsável pela OS
  const isResponsavel = () => {
    if (!os) return false;
    return os.responsavelId === usuarioLogado.id;
  };

  // Verificar se supervisor pode aprovar/reprovar
  const podeSupervisionar = () => {
    if (!os) return false;

    return (
      (usuarioLogado.nivel === NivelAcesso.SUPERVISOR ||
        usuarioLogado.nivel === NivelAcesso.ADMINISTRADOR) &&
      os.status === StatusOS.CONCLUIDA
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{erro}</p>
          <button
            onClick={() => router.push("/dashboard/ordens-servico")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  if (!os) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p>OS não encontrada ou sem permissão para visualizá-la.</p>
        <button
          onClick={() => router.push("/dashboard/ordens-servico")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Cabeçalho com informações principais */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{os.titulo}</h2>
            <div className="mt-2 flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  os.status
                )}`}
              >
                {getStatusLabel(os.status)}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPrioridadeColor(
                  os.prioridade
                )}`}
              >
                {getPrioridadeLabel(os.prioridade)}
              </span>

              <span className="text-sm text-gray-500 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatarData(os.dataAgendada)}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => router.push("/dashboard/ordens-servico")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </button>

            {/* Ações condicinais por status */}
            {podeAtuar() && (
              <>
                {os.status === StatusOS.EM_ABERTO && (
                  <button
                    onClick={() => atualizarStatus(StatusOS.EM_ANDAMENTO)}
                    disabled={atualizando}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Iniciar OS
                  </button>
                )}

                {os.status === StatusOS.EM_ANDAMENTO && isResponsavel() && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      ref={linkInputRef}
                      placeholder="Link da evidência"
                      value={linkEvidencia}
                      onChange={(e) => setLinkEvidencia(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />

                    <button
                      onClick={() => atualizarStatus(StatusOS.CONCLUIDA)}
                      disabled={
                        atualizando || (!linkEvidencia && !os.linkEvidencia)
                      }
                      className={`px-4 py-2 text-white rounded-lg ${
                        !linkEvidencia && !os.linkEvidencia
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      Concluir OS
                    </button>
                  </div>
                )}

                {podeSupervisionar() && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => atualizarStatus(StatusOS.FATURADA)}
                      disabled={atualizando}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Aprovar e Faturar
                    </button>

                    <button
                      onClick={() => {
                        const motivo = prompt(
                          "Informe o motivo da reprovação:"
                        );
                        if (motivo) {
                          setMotivoReprovacao(motivo);
                          atualizarStatus(StatusOS.REPROVADA);
                        }
                      }}
                      disabled={atualizando}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reprovar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detalhes da OS */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Descrição</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {os.descricao || <em className="text-gray-500">Sem descrição</em>}
            </div>
          </div>

          {os.status === StatusOS.REPROVADA && os.motivoReprovacao && (
            <div>
              <h3 className="text-lg font-medium mb-2 text-red-600">
                Motivo da Reprovação
              </h3>
              <div className="bg-red-50 p-4 rounded-lg text-red-700">
                {os.motivoReprovacao}
              </div>
            </div>
          )}

          {(os.status === StatusOS.CONCLUIDA ||
            os.status === StatusOS.FATURADA) &&
            os.linkEvidencia && (
              <div>
                <h3 className="text-lg font-medium mb-2">Link da Evidência</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <a
                    href={os.linkEvidencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {os.linkEvidencia}
                  </a>
                </div>
              </div>
            )}

          {/* Arquivos anexados */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Anexos</h3>

              {podeAtuar() && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Adicionar arquivo
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleArquivoChange}
                className="hidden"
                multiple
              />
            </div>

            {os.arquivos.length === 0 && arquivosSelecionados.length === 0 ? (
              <p className="text-gray-500">Nenhum arquivo anexado</p>
            ) : (
              <div className="space-y-2">
                {os.arquivos.map((arquivo, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{arquivo.nome}</p>
                        <p className="text-xs text-gray-500">
                          {(arquivo.tamanho / 1024).toFixed(1)} KB •{" "}
                          {formatarDataHora(arquivo.dataUpload)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={arquivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Baixar
                    </a>
                  </div>
                ))}

                {arquivosSelecionados.length > 0 && (
                  <>
                    {arquivosSelecionados.map((arquivo, index) => (
                      <div
                        key={`new-${index}`}
                        className="bg-blue-50 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <PaperClipIcon className="h-5 w-5 text-blue-400 mr-2" />
                          <div>
                            <p className="font-medium">{arquivo.name}</p>
                            <p className="text-xs text-blue-500">
                              {(arquivo.size / 1024).toFixed(1)} KB • Novo
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="mt-3">
                      <button
                        onClick={uploadArquivos}
                        disabled={atualizando}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {atualizando ? "Enviando..." : "Enviar Arquivos"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Justificativas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Justificativas</h3>

              {isResponsavel() &&
                (os.status === StatusOS.EM_ABERTO ||
                  os.status === StatusOS.EM_ANDAMENTO) && (
                  <button
                    onClick={() => setShowPopUp(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Adicionar justificativa
                  </button>
                )}
            </div>

            {os.justificativas.length === 0 ? (
              <p className="text-gray-500">Nenhuma justificativa registrada</p>
            ) : (
              <div className="space-y-3">
                {os.justificativas.map((justificativa, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{justificativa.usuarioNome}</p>
                      <p className="text-sm text-gray-500">
                        {formatarDataHora(justificativa.dataRegistro)}
                      </p>
                    </div>
                    <p className="mt-2">{justificativa.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Informações</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Responsável</p>
                <div className="flex items-center mt-1">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{os.responsavelNome || "Não atribuído"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Criado por</p>
                <div className="flex items-center mt-1">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{os.criadoPorNome}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Data de Criação</p>
                <div className="flex items-center mt-1">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{formatarDataHora(os.dataCriacao)}</p>
                </div>
              </div>

              {os.dataInicio && (
                <div>
                  <p className="text-sm text-gray-500">Data de Início</p>
                  <div className="flex items-center mt-1">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{formatarDataHora(os.dataInicio)}</p>
                  </div>
                </div>
              )}

              {os.dataFim && (
                <div>
                  <p className="text-sm text-gray-500">Data de Conclusão</p>
                  <div className="flex items-center mt-1">
                    <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p>{formatarDataHora(os.dataFim)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de justificativa */}
      {showPopUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Adicionar Justificativa
            </h3>
            <p className="text-gray-600 mb-4">
              Por favor, explique o motivo da OS ainda estar pendente.
            </p>

            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={4}
              placeholder="Digite sua justificativa..."
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPopUp(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={adicionarJustificativa}
                disabled={!justificativa.trim() || atualizando}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                  !justificativa.trim() || atualizando
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {atualizando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
