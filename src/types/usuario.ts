export enum NivelAcesso {
  PADRAO = "padrao", // Acesso apenas às OS designadas
  ADMINISTRADOR = "administrador", // Acesso a todas as OS
  SUPERVISOR = "supervisor", // Pode criar e aprovar/reprovar OS
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string; // Na prática, seria um hash
  nivel: NivelAcesso;
  avatar?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  dataCadastro: Date;
  ativo: boolean;
}

export interface UsuarioSimplificado {
  id: number;
  nome: string;
  nivel: NivelAcesso;
  avatar?: string;
}
