import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export interface OS {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  status:
    | "novo"
    | "em_andamento"
    | "pausado"
    | "concluido"
    | "cancelado"
    | "faturado";
  cliente: Cliente;
  responsavel: Usuario | null;
  prazo: string;
  valorTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export interface RegistroTempo {
  id: number;
  horas: number;
  minutos: number;
  descricao: string;
  usuario: {
    id: number;
    nome: string;
  };
  createdAt: string;
}

export interface Arquivo {
  id: number;
  nome: string;
  tamanho: number;
  tipo: string;
  url: string;
  createdAt: string;
}

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

export const OrdensServicoService = {
  async listar() {
    const response = await api.get<OS[]>("/ordens-servico");
    return response.data;
  },

  async obter(id: number) {
    const response = await api.get<OS>(`/ordens-servico/${id}`);
    return response.data;
  },

  async criar(dados: Partial<OS>) {
    const response = await api.post<OS>("/ordens-servico", dados);
    return response.data;
  },

  async atualizar(id: number, dados: Partial<OS>) {
    const response = await api.put<OS>(`/ordens-servico/${id}`, dados);
    return response.data;
  },

  async mudarStatus(id: number, status: string) {
    const response = await api.patch<OS>(`/ordens-servico/${id}/status`, {
      status,
    });
    return response.data;
  },

  async registrarTempo(
    id: number,
    dados: {
      horas: number;
      minutos: number;
      descricao: string;
    }
  ) {
    const response = await api.post<RegistroTempo>(
      `/ordens-servico/${id}/tempo`,
      dados
    );
    return response.data;
  },

  async listarRegistrosTempo(id: number) {
    const response = await api.get<RegistroTempo[]>(
      `/ordens-servico/${id}/tempo`
    );
    return response.data;
  },

  async uploadArquivo(id: number, arquivo: File) {
    const formData = new FormData();
    formData.append("arquivo", arquivo);

    const response = await api.post<Arquivo>(
      `/ordens-servico/${id}/arquivos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async listarArquivos(id: number) {
    const response = await api.get<Arquivo[]>(`/ordens-servico/${id}/arquivos`);
    return response.data;
  },

  async gerarFatura(
    id: number,
    dados: {
      vencimento: string;
      condicaoPagamento: string;
      observacoes: string;
    }
  ) {
    const response = await api.post(`/ordens-servico/${id}/fatura`, dados);
    return response.data;
  },

  async listarComFiltros(params: {
    pagina: number;
    status?: string[];
    cliente?: string;
    responsavel?: string;
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
  }) {
    const response = await api.get<{
      data: OS[];
      total: number;
      paginas: number;
    }>("/ordens-servico", { params });
    return response.data;
  },

  async listarComentarios(osId: number) {
    const response = await api.get(`/ordens-servico/${osId}/comentarios`);
    return response.data;
  },

  async adicionarComentario(osId: number, texto: string) {
    const response = await api.post(`/ordens-servico/${osId}/comentarios`, {
      texto,
    });
    return response.data;
  },

  async listarTemplates() {
    const response = await api.get("/ordens-servico/templates");
    return response.data;
  },

  async aplicarTemplate(osId: number, templateId: number) {
    const response = await api.post(
      `/ordens-servico/${osId}/aplicar-template/${templateId}`
    );
    return response.data;
  },

  async obterMetricas(params?: { dataInicio?: string; dataFim?: string }) {
    const response = await api.get("/ordens-servico/metricas", { params });
    return response.data;
  },

  async gerarRelatorio(params: {
    tipo: string;
    dataInicio: string;
    dataFim: string;
    formato?: "pdf" | "excel";
  }) {
    const response = await api.get("/ordens-servico/relatorios", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async listarNotificacoes() {
    const response = await api.get<Notificacao[]>(
      "/ordens-servico/notificacoes"
    );
    return response.data;
  },

  async marcarNotificacaoComoLida(id: number) {
    const response = await api.put(`/ordens-servico/notificacoes/${id}/lida`);
    return response.data;
  },
};
