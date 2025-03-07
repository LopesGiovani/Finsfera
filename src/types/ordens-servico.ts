export interface Filtros {
  status?: string[];
  cliente?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
}

export interface Template {
  id: number;
  nome: string;
  descricao: string;
}
