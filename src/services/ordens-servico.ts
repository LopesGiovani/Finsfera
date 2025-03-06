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
  agendamento: string;
  valorTotal: number;
  createdAt: string;
  updatedAt: string;
  closingLink?: string; // Link externo opcional
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
  value?: number; // Campo atualizado para 'value' conforme o modelo
  closingLink?: string; // Link externo opcional
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

function mapApiResponseToOS(data: ServiceOrderAPI[]): OS[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map((order) => {
    if (!order) return null;
    
    return {
      id: order.id || 0,
      numero: order.id ? `OS-${order.id.toString().padStart(5, "0")}` : 'OS-00000',
      titulo: order.title || '',
      descricao: order.description || '',
      status: mapStatus(order.status || ''),
      cliente: order.customer
        ? {
            id: order.customer.id || 0,
            nome: order.customer.name || '',
            email: order.customer.email || '',
            telefone: order.customer.phone || '',
          }
        : {
            id: 0,
            nome: "Cliente não atribuído",
            email: "",
            telefone: "",
          },
      responsavel: order.assignedTo
        ? {
            id: order.assignedTo.id || 0,
            nome: order.assignedTo.name || '',
            email: order.assignedTo.email || '',
            cargo: order.assignedTo.role || '',
          }
        : null,
      agendamento: order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString("pt-BR") : '',
      valorTotal: order.value !== undefined ? Number(order.value) : 0,
      closingLink: order.closingLink || '',
      createdAt: order.createdAt || '',
      updatedAt: order.updatedAt || '',
    };
  }).filter(Boolean) as OS[];
}

function calculaValorTotal(order: ServiceOrderAPI): number {
  // Verificar se a API está enviando um campo de valor, e usar se disponível
  if (order.value !== undefined && order.value !== null) {
    return Number(order.value);
  }
  
  // Valor padrão se não houver valor definido
  return 0;
}

function mapStatus(
  apiStatus: string
):
  | "novo"
  | "em_andamento"
  | "pausado"
  | "concluido"
  | "cancelado"
  | "faturado" {
  switch (apiStatus) {
    case "pendente":
      return "novo";
    case "em_andamento":
      return "em_andamento";
    case "concluida":
      return "concluido";
    case "reprovada":
      return "cancelado";
    case "faturado": 
      return "faturado";
    default:
      return "novo";
  }
}

function mapStatusToApi(frontendStatus: string): string {
  switch (frontendStatus) {
    case "novo":
      return "pendente";
    case "em_andamento":
      return "em_andamento";
    case "concluido":
      return "concluida";
    case "cancelado":
      return "reprovada";
    default:
      return "pendente";
  }
}

export const OrdensServicoService = {
  async listar() {
    try {
      const response = await api.get("/service-orders");
      return mapApiResponseToOS(response.data);
    } catch (error) {
      console.error("Erro ao buscar ordens de serviço:", error);
      throw new Error("Não foi possível carregar as ordens de serviço");
    }
  },

  async obter(id: number) {
    try {
      const response = await api.get(`/service-orders/${id}`);
      const os = mapApiResponseToOS([response.data])[0];
      return os;
    } catch (error) {
      console.error(`Erro ao buscar ordem de serviço ${id}:`, error);
      throw new Error("Não foi possível carregar a ordem de serviço");
    }
  },

  async criar(dados: Partial<OS>) {
    try {
      // Mapeia os dados para o formato da API
      const dadosAPI = {
        title: dados.titulo,
        description: dados.descricao,
        scheduledDate: dados.agendamento,
        assignedToId: dados.responsavel?.id,
        customerId: dados.cliente?.id,
        value: dados.valorTotal || 0, // Garantir que sempre envie um valor
        status: "pendente", // Status inicial padrão
      };

      const response = await api.post("/service-orders", dadosAPI);
      
      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);
      throw new Error("Não foi possível criar a ordem de serviço");
    }
  },

  async atualizar(id: number, dados: Partial<OS>) {
    try {
      // Mapeia os dados para o formato da API
      const dadosAPI: any = {};
      
      if (dados.titulo !== undefined) dadosAPI.title = dados.titulo;
      if (dados.descricao !== undefined) dadosAPI.description = dados.descricao;
      if (dados.agendamento !== undefined) dadosAPI.scheduledDate = dados.agendamento;
      if (dados.responsavel?.id !== undefined) dadosAPI.assignedToId = dados.responsavel.id;
      if (dados.cliente?.id !== undefined) dadosAPI.customerId = dados.cliente.id;
      if (dados.valorTotal !== undefined) dadosAPI.value = dados.valorTotal;
      if (dados.closingLink !== undefined) dadosAPI.closingLink = dados.closingLink;

      const response = await api.put(`/service-orders/${id}`, dadosAPI);
      
      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error(`Erro ao atualizar ordem de serviço ${id}:`, error);
      throw new Error("Não foi possível atualizar a ordem de serviço");
    }
  },

  async mudarStatus(id: number, status: string) {
    try {
      // Converte o status do frontend para o formato da API
      const apiStatus = mapStatusToApi(status);
      
      const response = await api.patch(`/service-orders/${id}/status`, {
        status: apiStatus,
      });
      
      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error(`Erro ao mudar status da OS ${id}:`, error);
      throw new Error("Não foi possível atualizar o status da ordem de serviço");
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
    try {
      const response = await api.post(`/service-orders/${id}/time`, dados);
      return response.data;
    } catch (error) {
      console.error(`Erro ao registrar tempo na OS ${id}:`, error);
      throw new Error("Não foi possível registrar o tempo");
    }
  },

  async listarRegistrosTempo(id: number) {
    try {
      const response = await api.get(`/service-orders/${id}/time`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar registros de tempo da OS ${id}:`, error);
      throw new Error("Não foi possível listar os registros de tempo");
    }
  },

  async uploadArquivo(id: number, arquivo: File) {
    try {
      const formData = new FormData();
      formData.append("file", arquivo);
      
      const response = await api.post(
        `/service-orders/${id}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer upload de arquivo para OS ${id}:`, error);
      throw new Error("Não foi possível fazer upload do arquivo");
    }
  },

  async listarArquivos(id: number) {
    try {
      const response = await api.get(`/service-orders/${id}/attachments`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar arquivos da OS ${id}:`, error);
      throw new Error("Não foi possível listar os arquivos");
    }
  },

  async gerarFatura(
    id: number,
    dados: {
      vencimento: string;
      condicaoPagamento: string;
      observacoes: string;
    }
  ) {
    try {
      const response = await api.post(`/service-orders/${id}/invoice`, dados);
      return response.data;
    } catch (error) {
      console.error(`Erro ao gerar fatura para OS ${id}:`, error);
      throw new Error("Não foi possível gerar a fatura");
    }
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
    try {
      // Converter status de frontend para API
      let statusAPI: string[] | undefined;
      if (params.status && params.status.length > 0) {
        statusAPI = params.status.map(mapStatusToApi);
      }

      const response = await api.get("/service-orders", {
        params: {
          page: params.pagina,
          status: statusAPI ? statusAPI.join(",") : undefined,
          customer: params.cliente,
          assignedTo: params.responsavel,
          startDate: params.dataInicio,
          endDate: params.dataFim,
          search: params.busca,
        },
      });

      const total = parseInt(response.headers["x-total-count"] || "0");
      const data = mapApiResponseToOS(response.data);

      return {
        data,
        total,
        pagina: params.pagina,
        porPagina: 10, // Assumindo que a API retorna 10 itens por página
      };
    } catch (error) {
      console.error("Erro ao buscar ordens de serviço com filtros:", error);
      throw new Error("Não foi possível carregar as ordens de serviço");
    }
  },

  async listarComentarios(osId: number) {
    try {
      const response = await api.get(`/service-orders/${osId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar comentários da OS ${osId}:`, error);
      throw new Error("Não foi possível carregar os comentários");
    }
  },

  async adicionarComentario(osId: number, texto: string) {
    try {
      const response = await api.post(`/service-orders/${osId}/comments`, {
        text: texto,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar comentário à OS ${osId}:`, error);
      throw new Error("Não foi possível adicionar o comentário");
    }
  },

  async listarTemplates() {
    try {
      const response = await api.get("/service-orders/templates");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar templates:", error);
      throw new Error("Não foi possível carregar os templates");
    }
  },

  async aplicarTemplate(osId: number, templateId: number) {
    try {
      const response = await api.post(
        `/service-orders/${osId}/apply-template/${templateId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao aplicar template ${templateId} à OS ${osId}:`, error);
      throw new Error("Não foi possível aplicar o template");
    }
  },

  async obterMetricas(params?: { dataInicio?: string; dataFim?: string }) {
    try {
      const response = await api.get("/service-orders/metrics", {
        params: {
          startDate: params?.dataInicio,
          endDate: params?.dataFim,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao obter métricas:", error);
      throw new Error("Não foi possível carregar as métricas");
    }
  },

  async gerarRelatorio(params: {
    tipo: string;
    dataInicio: string;
    dataFim: string;
    formato?: "pdf" | "excel";
  }) {
    try {
      const response = await api.get("/service-orders/report", {
        params: {
          type: params.tipo,
          startDate: params.dataInicio,
          endDate: params.dataFim,
          format: params.formato || "pdf",
        },
        responseType: "blob",
      });
      
      return response.data;
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw new Error("Não foi possível gerar o relatório");
    }
  },

  async listarNotificacoes() {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar notificações:", error);
      throw new Error("Não foi possível carregar as notificações");
    }
  },

  async marcarNotificacaoComoLida(id: number) {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error);
      throw new Error("Não foi possível atualizar a notificação");
    }
  },

  async listarEventos(osId: number) {
    try {
      const response = await api.get(`/service-orders/${osId}/events`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao listar eventos da OS ${osId}:`, error);
      throw new Error("Não foi possível carregar os eventos");
    }
  },

  async verificarIntegridadeDados() {
    try {
      // Como não estamos mais usando o sistema de sincronização,
      // este método agora apenas retorna um resultado vazio
      return {
        sincronizados: 0,
        total: 0,
        success: true
      };
    } catch (error) {
      console.error("Erro ao verificar integridade dos dados:", error);
      throw new Error("Erro ao verificar integridade dos dados");
    }
  },

  async limparDadosMock() {
    try {
      // Como não estamos mais usando o sistema de cache local,
      // este método agora apenas retorna um resultado de sucesso
      return {
        success: true,
        message: "Dados limpos com sucesso"
      };
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw new Error("Erro ao limpar dados");
    }
  },
};
