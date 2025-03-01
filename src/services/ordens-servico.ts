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

// Interface que mapeia os dados da API para o formato esperado pelo frontend
export interface ServiceOrderAPI {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  organizationId: number;
  assignedToId: number;
  assignedByUserId: number;
  scheduledDate: string;
  customerId?: number;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  assignedBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  customer?: {
    id: number;
    name: string;
    email: string;
    document: string;
    phone: string;
  };
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

// Função para mapear os dados da API para o formato esperado pelo frontend
function mapApiResponseToOS(data: ServiceOrderAPI[]): OS[] {
  return data.map((order) => ({
    id: order.id,
    numero: `OS-${order.id.toString().padStart(4, "0")}`,
    titulo: order.title,
    descricao: order.description,
    status: mapStatus(order.status),
    cliente: {
      id: order.customer?.id || 0,
      nome: order.customer?.name || "Cliente não atribuído",
      email: order.customer?.email || "",
      telefone: order.customer?.phone || "",
    },
    responsavel: order.assignedTo
      ? {
          id: order.assignedTo.id,
          nome: order.assignedTo.name,
          email: order.assignedTo.email,
          cargo: order.assignedTo.role,
        }
      : null,
    prazo: new Date(order.scheduledDate).toLocaleDateString("pt-BR"),
    valorTotal: 0, // Este valor não está disponível na API atual
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));
}

// Função para mapear os status do backend para o frontend
function mapStatus(
  apiStatus: string
):
  | "novo"
  | "em_andamento"
  | "pausado"
  | "concluido"
  | "cancelado"
  | "faturado" {
  const statusMap: Record<string, any> = {
    pendente: "novo",
    em_andamento: "em_andamento",
    concluida: "concluido",
    reprovada: "cancelado",
    faturado: "faturado",
  };
  return statusMap[apiStatus] || "novo";
}

// Função para mapear os status do frontend para o backend
function mapStatusToApi(frontendStatus: string): string {
  const statusMap: Record<string, string> = {
    novo: "pendente",
    em_andamento: "em_andamento",
    concluido: "concluida",
    cancelado: "reprovada",
    faturado: "faturado",
  };
  return statusMap[frontendStatus] || "pendente";
}

export const OrdensServicoService = {
  async listar() {
    try {
      const response = await api.get<ServiceOrderAPI[]>("/service-orders");
      console.log("Resposta da API de ordens de serviço:", response.data);

      // Verificar se os dados estão vindo corretamente
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Dados inválidos retornados pela API:", response.data);
        return [];
      }

      // Mapear os dados para o formato esperado pelo frontend
      const mappedData = mapApiResponseToOS(response.data);
      console.log("Dados mapeados:", mappedData);

      return mappedData;
    } catch (error) {
      console.error("Erro ao listar ordens de serviço:", error);
      return [];
    }
  },

  async obter(id: number) {
    try {
      const response = await api.get<ServiceOrderAPI>(`/service-orders/${id}`);
      // Transformar o objeto único no mesmo formato que a lista
      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error("Erro ao obter detalhes da ordem de serviço:", error);
      throw error;
    }
  },

  async criar(dados: Partial<OS>) {
    try {
      // Transformar o formato para o que a API espera
      const apiData: any = {
        title: dados.titulo,
        description: dados.descricao,
        priority: "media", // Valor padrão
        assignedToId: dados.responsavel?.id,
        customerId: dados.cliente?.id,
      };

      // Adicionar scheduledDate apenas se estiver definido
      if (dados.prazo) {
        apiData.scheduledDate = new Date(dados.prazo).toISOString();
      } else {
        // Se não houver prazo definido, usar a data atual + 7 dias
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        apiData.scheduledDate = defaultDate.toISOString();
      }

      const response = await api.post<ServiceOrderAPI>(
        "/service-orders",
        apiData
      );
      console.log("Resposta da criação:", response.data);

      // Retornar a OS transformada
      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);
      throw error;
    }
  },

  async atualizar(id: number, dados: Partial<OS>) {
    try {
      // Transformar o formato para o que a API espera
      const apiData: any = {
        title: dados.titulo,
        description: dados.descricao,
        priority: "media", // Valor padrão ou manter o atual
        assignedToId: dados.responsavel?.id,
        customerId: dados.cliente?.id,
      };

      // Adicionar scheduledDate apenas se estiver definido
      if (dados.prazo) {
        apiData.scheduledDate = new Date(dados.prazo).toISOString();
      }

      const response = await api.put<ServiceOrderAPI>(
        `/service-orders/${id}`,
        apiData
      );

      // Retornar a OS transformada
      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);
      throw error;
    }
  },

  async mudarStatus(id: number, status: string) {
    try {
      const apiStatus = mapStatusToApi(status);
      const response = await api.patch<ServiceOrderAPI>(
        `/service-orders/${id}/status`,
        {
          status: apiStatus,
        }
      );

      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error("Erro ao mudar status da ordem de serviço:", error);
      throw error;
    }
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
