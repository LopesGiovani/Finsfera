import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdensServicoService } from "@/services/ordens-servico";

export function useComentariosOS(osId: number) {
  const queryClient = useQueryClient();

  const { data: comentarios, isLoading } = useQuery({
    queryKey: ["comentarios-os", osId],
    queryFn: () => OrdensServicoService.listarComentarios(osId),
    enabled: !!osId,
  });

  const { mutate: adicionarComentario } = useMutation({
    mutationFn: (texto: string) =>
      OrdensServicoService.adicionarComentario(osId, texto),
    onSuccess: () => {
      queryClient.invalidateQueries(["comentarios-os", osId]);
    },
  });

  return {
    comentarios,
    isLoading,
    adicionarComentario,
  };
}
