export enum StatusOS {
  EM_ABERTO = "em_aberto",
  EM_ANDAMENTO = "em_andamento",
  CONCLUIDA = "concluida",
  FATURADA = "faturada",
  REPROVADA = "reprovada",
}

export interface Arquivo {
  id: number;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
  dataUpload: Date;
}

export interface Justificativa {
  id: number;
  texto: string;
  dataRegistro: Date;
  usuarioId: number;
  usuarioNome: string;
}

export interface OrdemServico {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusOS;
  dataCriacao: Date;
  dataAgendada: Date; // Data programada para execução
  dataInicio?: Date;
  dataFim?: Date;
  responsavelId?: number;
  responsavelNome?: string;
  criadoPorId: number;
  criadoPorNome: string;
  prioridade: "baixa" | "media" | "alta" | "urgente";
  arquivos: Arquivo[];
  justificativas: Justificativa[];
  linkEvidencia?: string; // Link obrigatório para conclusão da OS
  motivoReprovacao?: string;
}

export interface FiltrosOS {
  status?: StatusOS[];
  responsavelId?: number;
  dataDe?: Date;
  dataAte?: Date;
  prioridade?: string[];
  pendentesJustificativa?: boolean;
  busca?: string;
}
