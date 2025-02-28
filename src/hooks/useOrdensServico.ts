import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdensServicoService, OS } from "@/services/ordens-servico";
import { useState } from "react";

interface Filtros {
  status?: string[];
  cliente?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

export function useOrdensServico() {
  return useQuery({
    queryKey: ["ordens-servico"],
    queryFn: () => OrdensServicoService.listar(),
  });
}

export function useOrdemServico(id: number) {
  return useQuery({
    queryKey: ["ordens-servico", id],
    queryFn: () => OrdensServicoService.obter(id),
    enabled: !!id,
  });
}

export function useMudarStatusOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      OrdensServicoService.mudarStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(["ordens-servico", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
    },
  });
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
