import api from "@/utils/api";

export interface OS {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  status: "novo" | "em_andamento" | "concluido";
  cliente: Cliente;
  responsavel: Usuario | null;
  agendamento: string;
  createdAt: string;
  updatedAt: string;
  closingLink?: string; // Link externo opcional
  closingReason?: string; // Motivo do fechamento
  reopenReason?: string; // Motivo da reabertura
  closedAt?: string; // Data de fechamento
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
  closingLink?: string; // Link externo opcional
  closingReason?: string; // Motivo do fechamento
  reopenReason?: string; // Motivo da reabertura
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
  closedAt?: string; // Data de fechamento
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

function mapApiResponseToOS(apiResponse: ServiceOrderAPI[]): OS[] {
  console.log(
    "Resposta da API (antes do mapeamento):",
    JSON.stringify(apiResponse, null, 2)
  );

  const result = apiResponse
    .map((order) => {
      if (!order) return null;

      const mappedOrder = {
        id: order.id,
        numero: `OS-${order.id.toString().padStart(4, "0")}`,
        titulo: order.title,
        descricao: order.description,
        status: mapStatus(order.status),
        cliente: order.customer
          ? {
              id: order.customer.id,
              nome: order.customer.name,
              email: order.customer.email,
              telefone: order.customer.phone,
            }
          : {
              id: 0,
              nome: "Cliente não atribuído",
              email: "",
              telefone: "",
            },
        responsavel: order.assignedTo
          ? {
              id: order.assignedTo.id,
              nome: order.assignedTo.name,
              email: order.assignedTo.email,
              cargo: order.assignedTo.role,
            }
          : null,
        agendamento: order.scheduledDate
          ? new Date(order.scheduledDate).toLocaleDateString("pt-BR")
          : "",
        createdAt: order.createdAt || "",
        updatedAt: order.updatedAt || "",
        closingLink: order.closingLink || "",
        closingReason: order.closingReason || "",
        reopenReason: order.reopenReason || "",
        closedAt: order.closedAt || "",
      };

      console.log(
        `OS ID ${order.id} com status "${order.status}" mapeada para status "${mappedOrder.status}"`
      );

      return mappedOrder;
    })
    .filter(Boolean) as OS[];

  console.log("Dados após mapeamento:", JSON.stringify(result, null, 2));

  return result;
}

function mapStatus(apiStatus: string): "novo" | "em_andamento" | "concluido" {
  // Log para debug
  console.log(`Mapeando status da API: "${apiStatus}"`);

  // Normalizar o status (remover espaços, converter para minúsculas)
  const normalizedStatus = apiStatus?.toLowerCase()?.trim() || "";

  const statusMap: Record<string, any> = {
    pendente: "novo",
    em_andamento: "em_andamento",
    concluida: "concluido",
    reprovada: "novo", // Agora mapeia reprovada para novo
  };

  // Se o status já estiver no formato do frontend, retorná-lo diretamente
  if (["novo", "em_andamento", "concluido"].includes(normalizedStatus)) {
    console.log(
      `  - Status já está no formato do frontend: "${normalizedStatus}"`
    );
    return normalizedStatus as any;
  }

  // Adiciona log para debug
  const mappedStatus = statusMap[normalizedStatus] || "novo";
  console.log(`  - Status mapeado: "${normalizedStatus}" -> "${mappedStatus}"`);

  return mappedStatus;
}

function mapStatusToApi(frontendStatus: string): string {
  switch (frontendStatus) {
    case "novo":
      return "pendente";
    case "em_andamento":
      return "em_andamento";
    case "concluido":
      return "concluida";
    default:
      return "pendente"; // Por padrão retorna pendente
  }
}

export const OrdensServicoService = {
  async listar() {
    try {
      const response = await api.get("/service-orders");
      console.log("Resposta da API ordens de serviço (listar):", response.data);
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

  async criar(dados: {
    titulo: string;
    descricao: string;
    responsavelId: number;
    agendamento: string;
    clienteId?: number;
  }) {
    try {
      // Mapeia os dados para o formato da API
      const dadosAPI = {
        title: dados.titulo,
        description: dados.descricao,
        assignedToId: dados.responsavelId,
        scheduledDate: dados.agendamento,
        customerId: dados.clienteId,
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
      console.log(`Atualizando OS ${id} com dados:`, dados);

      // Preparar dados para envio à API
      const dadosParaAPI: any = { ...dados };

      // Converter agendamento para o formato da API se estiver presente
      if (dados.agendamento) {
        // Verificar se a data já está no formato ISO
        if (!/^\d{4}-\d{2}-\d{2}/.test(dados.agendamento)) {
          // Converter de DD/MM/YYYY para YYYY-MM-DD
          const partes = dados.agendamento.split("/");
          if (partes.length === 3) {
            dadosParaAPI.scheduledDate = `${partes[2]}-${partes[1]}-${partes[0]}`;
          }
        } else {
          dadosParaAPI.scheduledDate = dados.agendamento;
        }

        // Remover o campo agendamento para não confundir a API
        delete dadosParaAPI.agendamento;
      }

      // Mapear outros campos do frontend para a API
      if (dados.titulo !== undefined) dadosParaAPI.title = dados.titulo;
      if (dados.descricao !== undefined)
        dadosParaAPI.description = dados.descricao;

      // Remover campos que não existem na API
      delete dadosParaAPI.titulo;
      delete dadosParaAPI.descricao;
      delete dadosParaAPI.numero;
      delete dadosParaAPI.cliente;
      delete dadosParaAPI.responsavel;

      console.log("Dados formatados para API:", dadosParaAPI);

      const response = await api.put(`/service-orders/${id}`, dadosParaAPI);

      return mapApiResponseToOS([response.data])[0];
    } catch (error) {
      console.error(`Erro ao atualizar ordem de serviço ${id}:`, error);
      throw new Error("Não foi possível atualizar a ordem de serviço");
    }
  },

  async mudarStatus(
    id: number,
    status: string,
    closingReason?: string,
    reopenReason?: string
  ) {
    try {
      console.log(`Tentando mudar status da OS ${id}`);
      console.log(`  - Novo status: ${status}`);
      if (closingReason)
        console.log(`  - Motivo do fechamento: ${closingReason}`);
      if (reopenReason)
        console.log(`  - Motivo da reabertura: ${reopenReason}`);

      // Mapear o status do frontend para o formato da API
      const statusAPI = mapStatusToApi(status);

      // Preparar os dados a serem enviados para a API
      const dados: any = {
        status: statusAPI,
      };

      // Incluir motivo de fechamento se fornecido
      if (closingReason) {
        dados.closingReason = closingReason;
      }

      // Incluir motivo de reabertura se fornecido
      if (reopenReason) {
        dados.reopenReason = reopenReason;
      }

      // Enviar requisição para a API
      const response = await api.patch(`/service-orders/${id}/status`, dados);
      return mapApiResponseToOS([response.data])[0];
    } catch (error: any) {
      console.error(`Erro ao mudar status da OS ${id}:`, error);

      // Melhorar a mensagem de erro para o usuário
      let mensagem = "Não foi possível alterar o status";

      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.message) {
            mensagem = `Erro: ${error.response.data.message}`;
          } else {
            mensagem = "Dados inválidos para alteração de status";
          }
        } else if (error.response.status === 403) {
          mensagem = "Você não tem permissão para alterar esta OS";
        } else if (error.response.status === 404) {
          mensagem = "Ordem de serviço não encontrada";
        } else if (error.response.status === 500) {
          mensagem = "Erro interno do servidor";
        }
      }

      throw new Error(mensagem);
    }
  },

  async reabrirOS(id: number, reopenReason: string) {
    try {
      console.log(`Reabrindo OS ${id} com motivo: ${reopenReason}`);

      const dadosParaAPI = {
        status: "pendente",
        reopenReason,
      };

      const response = await api.patch(
        `/service-orders/${id}/status`,
        dadosParaAPI
      );
      return mapApiResponseToOS([response.data])[0];
    } catch (error: any) {
      console.error(`Erro ao reabrir OS ${id}:`, error);

      // Melhorar a mensagem de erro para o usuário
      let mensagem = "Não foi possível reabrir a ordem de serviço";

      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data && error.response.data.message) {
            mensagem = `Erro: ${error.response.data.message}`;
          } else {
            mensagem = "Dados inválidos para reabertura";
          }
        } else if (error.response.status === 403) {
          mensagem = "Você não tem permissão para reabrir esta OS";
        } else if (error.response.status === 404) {
          mensagem = "Ordem de serviço não encontrada";
        } else if (error.response.status === 500) {
          mensagem = "Erro interno do servidor";
        }
      }

      throw new Error(mensagem);
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
      console.error(
        `Erro ao aplicar template ${templateId} à OS ${osId}:`,
        error
      );
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
      // Usar o novo endpoint simplificado sem dependência de estrutura de pasta com colchetes
      const response = await api.get("/timeline-events", {
        params: { orderId: osId },
      });
      console.log("Resposta da API de eventos:", response.data);
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
        success: true,
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
        message: "Dados limpos com sucesso",
      };
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw new Error("Erro ao limpar dados");
    }
  },
};
