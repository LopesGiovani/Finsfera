import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrdensServicoService } from "@/services/ordens-servico";

interface Filtros {
  status?: string[];
  cliente?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

export function useOrdensServicoFiltros() {
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<Filtros>({});

  const { data, isLoading } = useQuery({
    queryKey: ["ordens-servico", pagina, filtros],
    queryFn: () =>
      OrdensServicoService.listarComFiltros({
        pagina,
        ...filtros,
      }),
  });

  return {
    data,
    isLoading,
    pagina,
    setPagina,
    filtros,
    setFiltros,
  };
}
