import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdensServicoService } from "@/services/ordens-servico";

export function useNotificacoesOS() {
  const queryClient = useQueryClient();

  const { data: notificacoes } = useQuery({
    queryKey: ["notificacoes-os"],
    queryFn: () => OrdensServicoService.listarNotificacoes(),
  });

  const { mutate: marcarComoLida } = useMutation({
    mutationFn: (id: number) =>
      OrdensServicoService.marcarNotificacaoComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notificacoes-os"]);
    },
  });

  return {
    notificacoes,
    marcarComoLida,
  };
}
