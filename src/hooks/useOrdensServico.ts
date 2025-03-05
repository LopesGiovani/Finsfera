import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdensServicoService, OS } from "@/services/ordens-servico";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Filtros {
  status?: string[];
  cliente?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

export function useOrdensServico() {
  const queryClient = useQueryClient();

  // Efeito para verificar integridade de dados ao montar o componente
  useEffect(() => {
    const verificarIntegridade = async () => {
      try {
        const resultado =
          await OrdensServicoService.verificarIntegridadeDados();
        if (resultado.sincronizados > 0) {
          toast.success(
            `${resultado.sincronizados} ordens de serviço sincronizadas com sucesso!`
          );
          // Invalidar consultas para garantir dados atualizados
          queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
        }
      } catch (error) {
        console.error("Erro ao verificar integridade dos dados:", error);
      }
    };

    verificarIntegridade();
  }, [queryClient]);

  return useQuery({
    queryKey: ["ordens-servico"],
    queryFn: async () => {
      try {
        // Verifica se há token no localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("Token não encontrado no localStorage");
        } else {
          console.log("Token encontrado, comprimento:", token.length);
        }

        const resultado = await OrdensServicoService.listar();
        console.log("Resultado da query de ordens de serviço:", resultado);
        return resultado;
      } catch (error) {
        console.error("Erro ao buscar ordens de serviço:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 segundos
  });
}

export function useOrdemServico(id: number) {
  return useQuery({
    queryKey: ["ordens-servico", id],
    queryFn: () => OrdensServicoService.obter(id),
    enabled: !!id,
    // Aumentar o staleTime para manter o cache válido por mais tempo
    staleTime: 60000, // 1 minuto
  });
}

export function useMudarStatusOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      console.log(
        `Hook useMudarStatusOS chamando mudarStatus com id=${id}, status=${status}`
      );
      return OrdensServicoService.mudarStatus(id, status);
    },
    onMutate: async (variables) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({
        queryKey: ["ordens-servico", variables.id],
      });

      // Obter o estado anterior da OS
      const previousOS = queryClient.getQueryData<OS>([
        "ordens-servico",
        variables.id,
      ]);

      // Otimisticamente atualizar o cache (interface responde imediatamente)
      if (previousOS) {
        const updatedOS = {
          ...previousOS,
          status: variables.status as any,
          updatedAt: new Date().toISOString(),
          _atualizandoStatus: true, // Flag para indicar que está atualizando
        };

        queryClient.setQueryData(["ordens-servico", variables.id], updatedOS);

        // Também atualizar a lista se estiver em cache
        const ordensLista = queryClient.getQueryData<any>(["ordens-servico"]);
        if (Array.isArray(ordensLista)) {
          const updatedList = ordensLista.map((os) =>
            os.id === variables.id ? updatedOS : os
          );
          queryClient.setQueryData(["ordens-servico"], updatedList);
        }
      }

      return { previousOS };
    },
    onSuccess: (data, variables, context) => {
      console.log("Mutação de status completada com sucesso:", data);

      // Atualizar os dados da OS específica no cache
      queryClient.setQueryData(["ordens-servico", data.id], data);

      // Invalidar a consulta da lista para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });

      // Invalidar a consulta de eventos para atualizar a timeline
      queryClient.invalidateQueries({ queryKey: ["eventos-os", data.id] });

      // Notificar usuário sobre o sucesso
      toast.success(
        `Status da OS ${data.numero} alterado para ${traduzirStatus(
          data.status
        )}`
      );
    },
    onError: (error, variables, context) => {
      console.error(
        "Erro na mutação de status:",
        error,
        "Variáveis:",
        variables
      );

      // Restaurar estado anterior em caso de erro
      if (context?.previousOS) {
        queryClient.setQueryData(
          ["ordens-servico", variables.id],
          context.previousOS
        );
      }

      // Notificar usuário sobre o erro, mas informar que os dados foram salvos localmente
      toast.error(
        `Erro ao atualizar status no servidor. Os dados foram salvos localmente e serão sincronizados quando possível.`
      );

      // Mesmo com erro, tentamos atualizar o cache com o mock
      try {
        // Tenta obter a OS atual do cache
        const currentOS = queryClient.getQueryData<any>([
          "ordens-servico",
          variables.id,
        ]);

        if (currentOS) {
          // Cria uma cópia atualizada
          const updatedOS = {
            ...currentOS,
            status: variables.status,
            updatedAt: new Date().toISOString(),
            _statusAlteradoOffline: true,
          };

          // Atualiza o cache mesmo com falha na API
          console.log("Atualizando cache com dados locais:", updatedOS);
          queryClient.setQueryData(["ordens-servico", variables.id], updatedOS);

          // Tenta atualizar a lista de ordens também
          const ordensLista = queryClient.getQueryData<any>(["ordens-servico"]);
          if (Array.isArray(ordensLista)) {
            const updatedList = ordensLista.map((os) =>
              os.id === variables.id ? updatedOS : os
            );
            queryClient.setQueryData(["ordens-servico"], updatedList);
          }

          // Invalidar a consulta de eventos mesmo com erro
          queryClient.invalidateQueries({
            queryKey: ["eventos-os", variables.id],
          });
        }
      } catch (cacheError) {
        console.error("Erro ao tentar atualizar o cache:", cacheError);
      }
    },
    onSettled: () => {
      // Invalidar queries para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
    },
  });
}

// Função auxiliar para traduzir status para português
function traduzirStatus(status: string): string {
  const traducoes: Record<string, string> = {
    novo: "Novo",
    em_andamento: "Em Andamento",
    pausado: "Pausado",
    concluido: "Concluído",
    cancelado: "Cancelado",
    faturado: "Faturado",
  };

  return traducoes[status] || status;
}

export function useRegistrarTempo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id: number;
      dados: { horas: number; minutos: number; descricao: string };
    }) => OrdensServicoService.registrarTempo(id, dados),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ordens-servico", id] });
      queryClient.invalidateQueries({ queryKey: ["registros-tempo", id] });
    },
  });
}

export function useRegistrosTempo(osId: number) {
  return useQuery({
    queryKey: ["registros-tempo", osId],
    queryFn: () => OrdensServicoService.listarRegistrosTempo(osId),
    enabled: !!osId,
  });
}

export function useArquivosOS(osId: number) {
  return useQuery({
    queryKey: ["arquivos-os", osId],
    queryFn: () => OrdensServicoService.listarArquivos(osId),
    enabled: !!osId,
  });
}

export function useUploadArquivoOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, arquivo }: { id: number; arquivo: File }) =>
      OrdensServicoService.uploadArquivo(id, arquivo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["arquivos-os", id] });
    },
  });
}

export function useGerarFatura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id: number;
      dados: {
        vencimento: string;
        condicaoPagamento: string;
        observacoes: string;
      };
    }) => OrdensServicoService.gerarFatura(id, dados),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ordens-servico", id] });
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
    },
  });
}

export function useOrdensServicoFiltros() {
  const [filtros, setFiltros] = useState<Filtros>({});
  const [pagina, setPagina] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ordens-servico", filtros, pagina],
    queryFn: () =>
      OrdensServicoService.listarComFiltros({ pagina, ...filtros }),
    placeholderData: (previousData) => previousData,
  });

  const atualizarFiltros = (novosFiltros: Partial<Filtros>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
    setPagina(1); // Reset da paginação ao filtrar
  };

  return {
    data,
    isLoading,
    error,
    filtros,
    atualizarFiltros,
    pagina,
    setPagina,
  };
}

export function useNotificacoesOS() {
  const { data: notificacoes, refetch } = useQuery({
    queryKey: ["notificacoes-os"],
    queryFn: () => OrdensServicoService.listarNotificacoes(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  return {
    notificacoes,
    refetch,
  };
}

export function useEventosOS(osId: number) {
  return useQuery({
    queryKey: ["eventos-os", osId],
    queryFn: () => OrdensServicoService.listarEventos(osId),
    enabled: !!osId,
  });
}

export function useComentariosOS(osId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["comentarios-os", osId],
    queryFn: () => OrdensServicoService.listarComentarios(osId),
    enabled: !!osId,
  });

  const { mutate: adicionarComentario, isPending: isAdicionando } = useMutation(
    {
      mutationFn: (texto: string) =>
        OrdensServicoService.adicionarComentario(osId, texto),
      onSuccess: () => {
        // Invalidar a consulta de comentários para recarregar
        queryClient.invalidateQueries({ queryKey: ["comentarios-os", osId] });
        // Invalidar a consulta de eventos para atualizar a timeline
        queryClient.invalidateQueries({ queryKey: ["eventos-os", osId] });
      },
    }
  );

  return {
    data,
    isLoading,
    error,
    refetch,
    adicionarComentario,
    isAdicionando,
  };
}

export function useLimparDadosOS() {
  const queryClient = useQueryClient();

  const limparDados = async () => {
    try {
      // Limpar todos os dados em cache e no localStorage
      const resultado = await OrdensServicoService.limparDadosMock();

      // Invalidar consultas no cache do React Query
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });

      // Limpar todas as chaves relacionadas a OS
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          if (Array.isArray(queryKey)) {
            return (
              queryKey[0] === "ordens-servico" ||
              queryKey[0] === "eventos-os" ||
              queryKey[0] === "comentarios-os" ||
              queryKey[0] === "arquivos-os"
            );
          }
          return false;
        },
      });

      console.log("Dados limpos:", resultado);
      return resultado;
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      return { success: false, message: "Erro ao limpar dados" };
    }
  };

  return { limparDados };
}

// Hook para verificar integridade de dados manualmente
export function useVerificarIntegridadeDados() {
  const queryClient = useQueryClient();
  const [isVerificando, setIsVerificando] = useState(false);

  const verificarIntegridade = async () => {
    setIsVerificando(true);
    try {
      const resultado = await OrdensServicoService.verificarIntegridadeDados();

      if (resultado.sincronizados > 0) {
        toast.success(
          `${resultado.sincronizados} ordens de serviço sincronizadas com sucesso!`
        );
        // Invalidar consultas para garantir dados atualizados
        queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
      } else if (resultado.total > 0) {
        toast(
          `Encontradas ${resultado.total} ordens de serviço modificadas, mas nenhuma precisava ser sincronizada.`,
          {
            icon: "📊",
          }
        );
      } else {
        toast.success("Nenhuma ordem de serviço precisava ser sincronizada.");
      }

      return resultado;
    } catch (error) {
      console.error("Erro ao verificar integridade dos dados:", error);
      toast.error("Erro ao verificar integridade dos dados");
      return { sincronizados: 0, success: false, error };
    } finally {
      setIsVerificando(false);
    }
  };

  return { verificarIntegridade, isVerificando };
}
