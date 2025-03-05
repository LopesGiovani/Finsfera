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
  // Propriedades de metadados para controle do estado offline
  _statusAlteradoOffline?: boolean;
  _atualizandoStatus?: boolean;
  _timestampLocal?: number;
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
  amount?: number; // Voltando para opcional já que não existe no banco
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
  return data.map((order) => {
    // Recuperar valor do localStorage se existir
    let valorArmazenado = null;
    try {
      const osLocal = localStorage.getItem(`os_${order.id}`);
      if (osLocal) {
        const dadosLocal = JSON.parse(osLocal);
        valorArmazenado = dadosLocal.valorTotal;
      }
    } catch (error) {
      console.error("Erro ao recuperar valor do localStorage:", error);
    }

    return {
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
      valorTotal:
        order.amount !== undefined ? order.amount : valorArmazenado || 0,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  });
}

// Função para calcular um valor total baseado nos dados da ordem de serviço
function calculaValorTotal(order: ServiceOrderAPI): number {
  // Verificar se a API está enviando um campo de valor, e usar se disponível
  if (order.amount !== undefined && order.amount !== null) {
    return Number(order.amount);
  }

  // Caso contrário, usar um valor simulado baseado no ID e no título
  // Isso garante que cada OS tenha um valor consistente
  try {
    // Usar um valor entre 800 e 5000 com base no ID da ordem
    const baseValue = 800 + (order.id % 10) * 420;

    // Adicionar mais valor se o título tiver palavras-chave de alto valor
    const titulo = order.title.toLowerCase();
    let multiplicador = 1.0;

    if (titulo.includes("instalação") || titulo.includes("implementação")) {
      multiplicador = 1.5;
    } else if (titulo.includes("consultoria") || titulo.includes("auditoria")) {
      multiplicador = 2.0;
    } else if (titulo.includes("urgente") || titulo.includes("emergência")) {
      multiplicador = 1.8;
    }

    return Math.round(baseValue * multiplicador * 100) / 100; // Arredonda para 2 casas decimais
  } catch (error) {
    console.error("Erro ao calcular valor simulado:", error);
    return 1000; // Valor padrão seguro
  }
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

// Implementando a função de mock de eventos para a Timeline
function mockEventos(osId?: number) {
  const mockDefaultEventos = [
    {
      id: 1,
      tipo: "criacao",
      descricao: "criou a ordem de serviço",
      data: "2023-11-15T10:30:00Z",
      usuario: {
        id: 1,
        nome: "João Silva",
      },
    },
    {
      id: 2,
      tipo: "status",
      descricao: "alterou o status para",
      data: "2023-11-16T14:45:00Z",
      usuario: {
        id: 1,
        nome: "João Silva",
      },
      metadados: {
        status: "em_andamento",
      },
    },
    {
      id: 3,
      tipo: "comentario",
      descricao: "adicionou um comentário",
      data: "2023-11-17T09:20:00Z",
      usuario: {
        id: 2,
        nome: "Maria Oliveira",
      },
      metadados: {
        texto:
          "Iniciamos os trabalhos no cliente. Precisamos de peças adicionais.",
      },
    },
    {
      id: 4,
      tipo: "arquivo",
      descricao: "anexou um arquivo",
      data: "2023-11-18T16:30:00Z",
      usuario: {
        id: 1,
        nome: "João Silva",
      },
      metadados: {
        arquivo: {
          nome: "relatorio-tecnico.pdf",
          url: "#",
        },
      },
    },
    {
      id: 5,
      tipo: "tempo",
      descricao: "registrou tempo trabalhado",
      data: "2023-11-20T10:15:00Z",
      usuario: {
        id: 1,
        nome: "João Silva",
      },
      metadados: {
        tempo: "2h 30min",
      },
    },
  ];

  // Tentar recuperar eventos armazenados localmente para este osId
  try {
    if (osId) {
      const storedEventsKey = `os_eventos_${osId}`;
      const storedEvents = localStorage.getItem(storedEventsKey);
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        console.log(
          `Encontrados eventos armazenados para OS ${osId}:`,
          parsedEvents
        );
        return parsedEvents;
      }
    }
  } catch (error) {
    console.error("Erro ao buscar eventos do localStorage:", error);
  }

  return mockDefaultEventos;
}

// Função para salvar eventos no localStorage
function salvarEventosLocalmente(osId: number, eventos: any[]) {
  try {
    const storedEventsKey = `os_eventos_${osId}`;
    localStorage.setItem(storedEventsKey, JSON.stringify(eventos));
    console.log(`Eventos da OS ${osId} salvos localmente.`);
  } catch (error) {
    console.error("Erro ao salvar eventos no localStorage:", error);
  }
}

function mockComentarios(osId?: number) {
  const defaultComentarios = [
    {
      id: 1,
      texto:
        "<p>Iniciamos a análise do equipamento. Identificamos problemas na placa principal.</p>",
      osId: 1,
      usuario: {
        id: 1,
        nome: "João Silva",
      },
      createdAt: "2023-12-01T10:30:00Z",
    },
    {
      id: 2,
      texto: "<p>Cliente autoriza a substituição da peça danificada.</p>",
      osId: 1,
      usuario: {
        id: 3,
        nome: "Carlos Mendes",
      },
      createdAt: "2023-12-02T14:45:00Z",
    },
    {
      id: 3,
      texto:
        "<p>Reparo concluído com sucesso. Equipamento funcionando normalmente.</p>",
      osId: 1,
      usuario: {
        id: 1,
        nome: "João Silva",
      },
      createdAt: "2023-12-03T16:20:00Z",
    },
  ];

  // Tentar recuperar comentários armazenados localmente para este osId
  try {
    if (osId) {
      const storedCommentsKey = `os_comentarios_${osId}`;
      const storedComments = localStorage.getItem(storedCommentsKey);
      if (storedComments) {
        const parsedComments = JSON.parse(storedComments);
        console.log(
          `Encontrados comentários armazenados para OS ${osId}:`,
          parsedComments
        );
        return parsedComments;
      }

      // Se não houver comentários armazenados, mas o osId foi fornecido,
      // filtramos os comentários padrão para este osId (ou retornamos vazio)
      if (osId !== 1) {
        return []; // Retorna vazio para outras OSs que não a 1 (exemplo)
      }
    }
  } catch (error) {
    console.error("Erro ao buscar comentários do localStorage:", error);
  }

  return defaultComentarios;
}

// Função para salvar comentários no localStorage
function salvarComentariosLocalmente(osId: number, comentarios: any[]) {
  try {
    const storedCommentsKey = `os_comentarios_${osId}`;
    localStorage.setItem(storedCommentsKey, JSON.stringify(comentarios));
    console.log(`Comentários da OS ${osId} salvos localmente.`);
  } catch (error) {
    console.error("Erro ao salvar comentários no localStorage:", error);
  }
}

// Função para salvar a OS no localStorage
function salvarOSLocalmente(os: OS) {
  try {
    console.log(`Salvando OS ${os.id} localmente com status ${os.status}`);

    // Adicionar metadados de timestamp e controle offline
    const osComMetadados = {
      ...os,
      _timestampLocal: Date.now(),
    };

    // Salvar a OS no localStorage
    localStorage.setItem(`os_${os.id}`, JSON.stringify(osComMetadados));

    // Adicionar ao registro de OS modificadas
    const osModificadasKey = "os_modificadas_ids";
    const idsString = localStorage.getItem(osModificadasKey) || "[]";
    const ids = JSON.parse(idsString);

    if (!ids.includes(os.id)) {
      ids.push(os.id);
      localStorage.setItem(osModificadasKey, JSON.stringify(ids));
      console.log(`OS ${os.id} adicionada à lista de modificadas:`, ids);
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar OS localmente:", error);
    return false;
  }
}

// Função para recuperar a OS do localStorage
function recuperarOSLocalmenteSeExistir(id: number): OS | null {
  try {
    const osKey = `os_${id}`;
    const osString = localStorage.getItem(osKey);

    if (!osString) {
      return null;
    }

    const osLocal = JSON.parse(osString) as OS;

    // Verificar se a OS tem mais de 24h (para evitar dados muito antigos)
    if (osLocal._timestampLocal) {
      const agora = Date.now();
      const idadeEmHoras = (agora - osLocal._timestampLocal) / (1000 * 60 * 60);

      // Se a OS não foi alterada localmente e tem mais de 24h, ignorar
      if (idadeEmHoras > 24 && !osLocal._statusAlteradoOffline) {
        console.log(
          `OS ${id} está com dados locais antigos (${idadeEmHoras.toFixed(
            2
          )}h), ignorando`
        );
        return null;
      }

      // Se a OS tem mais de 72h mesmo com alterações, remover para evitar problemas
      if (idadeEmHoras > 72) {
        console.log(
          `OS ${id} tem dados muito antigos (${idadeEmHoras.toFixed(
            2
          )}h), removendo`
        );
        localStorage.removeItem(osKey);

        // Remover da lista de OS modificadas
        try {
          const osModificadasKey = "os_modificadas_ids";
          const idsString = localStorage.getItem(osModificadasKey) || "[]";
          const ids = JSON.parse(idsString);
          const newIds = ids.filter((idItem: number) => idItem !== id);
          localStorage.setItem(osModificadasKey, JSON.stringify(newIds));
        } catch (err) {
          console.error("Erro ao atualizar lista de IDs modificados:", err);
        }

        return null;
      }
    }

    console.log(`OS ${id} recuperada do localStorage:`, osLocal);
    return osLocal;
  } catch (error) {
    console.error(`Erro ao recuperar OS ${id} do localStorage:`, error);
    return null;
  }
}

// Função para limpar os dados do localStorage quando necessário
function limparDadosOS() {
  try {
    console.log("Iniciando limpeza de dados no localStorage...");

    const prefixos = ["os_", "os_eventos_", "os_comentarios_"];
    const resultado = {
      total: 0,
      detalhes: {
        os: 0,
        eventos: 0,
        comentarios: 0,
        outros: 0,
      },
    };

    // Buscar todas as chaves para limpar
    const keysParaRemover = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key.startsWith("os_") && !key.includes("modificadas")) {
          keysParaRemover.push(key);

          // Contabilizar por tipo
          if (key.startsWith("os_eventos_")) {
            resultado.detalhes.eventos++;
          } else if (key.startsWith("os_comentarios_")) {
            resultado.detalhes.comentarios++;
          } else if (key.startsWith("os_")) {
            resultado.detalhes.os++;
          } else {
            resultado.detalhes.outros++;
          }

          resultado.total++;
        }
      }
    }

    // Remover a lista de OS modificadas
    if (localStorage.getItem("os_modificadas_ids")) {
      keysParaRemover.push("os_modificadas_ids");
      resultado.total++;
    }

    // Remover todas as chaves encontradas
    keysParaRemover.forEach((key) => {
      console.log(`Removendo chave: ${key}`);
      localStorage.removeItem(key);
    });

    console.log(
      `Limpeza concluída. ${resultado.total} itens removidos:`,
      resultado.detalhes
    );
    return resultado;
  } catch (error) {
    console.error("Erro ao limpar dados no localStorage:", error);
    return { total: 0, error: String(error) };
  }
}

export const OrdensServicoService = {
  async listar() {
    try {
      const response = await api.get<ServiceOrderAPI[]>("/service-orders");
      const listaOS = mapApiResponseToOS(response.data);

      // Verificar se existem versões mais recentes no localStorage
      const listaAtualizada = listaOS.map((os) => {
        const osLocal = recuperarOSLocalmenteSeExistir(os.id);
        if (osLocal && new Date(osLocal.updatedAt) > new Date(os.updatedAt)) {
          console.log(
            `OS ${os.id} encontrada no localStorage com versão mais recente`
          );
          return osLocal;
        }
        return os;
      });

      return listaAtualizada;
    } catch (error) {
      console.error("Erro ao listar ordens de serviço:", error);

      // Mock de dados caso a API falhe
      let mockOSs = mockOrdensServico();

      // Verificar atualizações no localStorage para cada mock
      mockOSs = mockOSs.map((os) => {
        const osLocal = recuperarOSLocalmenteSeExistir(os.id);
        if (osLocal) {
          console.log(
            `OS ${os.id} mockada substituída pela versão do localStorage`
          );
          return osLocal;
        }
        return os;
      });

      return mockOSs;
    }
  },

  async obter(id: number) {
    console.log(`Buscando OS ${id}...`);

    try {
      // Verificar se temos uma versão local da OS
      const osLocal = recuperarOSLocalmenteSeExistir(id);

      // Tentar obter da API
      try {
        const response = await api.get<ServiceOrderAPI>(
          `/service-orders/${id}`
        );
        console.log(`OS ${id} obtida da API:`, response.data);

        // Mapear para o formato interno
        const osApi = mapApiResponseToOS([response.data])[0];

        // Se temos uma versão local que foi modificada offline, mantê-la
        if (osLocal && osLocal._statusAlteradoOffline) {
          console.log(
            `OS ${id} tem alterações offline. Mantendo status local: ${osLocal.status}`
          );

          // Mesclar dados da API com status local
          const osMesclada = {
            ...osApi,
            status: osLocal.status,
            _statusAlteradoOffline: true,
          };

          // Atualizar a versão local
          salvarOSLocalmente(osMesclada);

          return osMesclada;
        }

        // Caso contrário, usar versão da API e salvar localmente
        salvarOSLocalmente(osApi);
        return osApi;
      } catch (error) {
        console.error(`Erro ao obter OS ${id} da API:`, error);

        // Se temos uma versão local, usá-la
        if (osLocal) {
          console.log(`Usando versão local da OS ${id}`);
          return osLocal;
        }

        // Se não temos nem API nem local, usar mock
        console.log(`Usando mock para OS ${id}`);
        const osMock = mockOrdemServico(id);
        salvarOSLocalmente(osMock);
        return osMock;
      }
    } catch (error) {
      console.error(`Erro ao processar obtenção da OS ${id}:`, error);
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
        amount: dados.valorTotal || 0, // Garantir que sempre envie um valor
        status: "pendente", // Status inicial padrão
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

      // Salvar localmente a OS criada
      const osCriada = mapApiResponseToOS([response.data])[0];
      salvarOSLocalmente(osCriada);

      return osCriada;
    } catch (error) {
      console.error("Erro ao criar ordem de serviço:", error);

      // Em caso de erro, criar uma versão local
      const osLocal: OS = {
        id: Date.now(), // ID temporário
        numero: `OS-${Date.now().toString().slice(-4)}`,
        titulo: dados.titulo || "",
        descricao: dados.descricao || "",
        status: "novo",
        cliente: dados.cliente || {
          id: 0,
          nome: "Cliente não especificado",
          email: "",
          telefone: "",
        },
        responsavel: dados.responsavel || null,
        prazo:
          dados.prazo ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        valorTotal: dados.valorTotal || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _statusAlteradoOffline: true,
      };

      // Salvar a versão local
      salvarOSLocalmente(osLocal);

      return osLocal;
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
        amount: dados.valorTotal, // Incluir o valor na atualização
      };

      // Adicionar scheduledDate apenas se estiver definido
      if (dados.prazo) {
        apiData.scheduledDate = new Date(dados.prazo).toISOString();
      }

      const response = await api.put<ServiceOrderAPI>(
        `/service-orders/${id}`,
        apiData
      );

      // Mapear a resposta e salvar localmente
      const osAtualizada = mapApiResponseToOS([response.data])[0];
      salvarOSLocalmente(osAtualizada);

      // Adicionar evento de atualização na timeline
      try {
        const eventos = await this.listarEventos(id);
        const novoEvento = {
          id: Date.now(),
          tipo: "atualizacao",
          descricao: "atualizou os dados da OS",
          data: new Date().toISOString(),
          usuario: {
            id: 1,
            nome: localStorage.getItem("userName") || "Usuário",
          },
          metadados: {
            valorAtualizado: dados.valorTotal !== undefined,
            valorTotal: dados.valorTotal,
          },
        };
        salvarEventosLocalmente(id, [novoEvento, ...eventos]);
      } catch (eventError) {
        console.error(
          "Erro ao adicionar evento de atualização na timeline:",
          eventError
        );
      }

      return osAtualizada;
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);

      // Em caso de erro, salvar localmente com flag de modificação
      const osAtual = await this.obter(id);
      const osModificada = {
        ...osAtual,
        ...dados,
        updatedAt: new Date().toISOString(),
        _statusAlteradoOffline: true,
      };

      salvarOSLocalmente(osModificada);

      // Adicionar evento offline de atualização
      try {
        const eventos = await this.listarEventos(id);
        const novoEvento = {
          id: Date.now(),
          tipo: "atualizacao",
          descricao: "atualizou os dados da OS (offline)",
          data: new Date().toISOString(),
          usuario: {
            id: 1,
            nome: localStorage.getItem("userName") || "Usuário",
          },
          metadados: {
            valorAtualizado: dados.valorTotal !== undefined,
            valorTotal: dados.valorTotal,
            offline: true,
          },
        };
        salvarEventosLocalmente(id, [novoEvento, ...eventos]);
      } catch (eventError) {
        console.error(
          "Erro ao adicionar evento offline de atualização na timeline:",
          eventError
        );
      }

      return osModificada;
    }
  },

  async mudarStatus(id: number, status: string) {
    console.log(`Mudando status da OS ${id} para ${status}`);

    try {
      // Se não for um dos status suportados, retornar erro
      if (
        ![
          "novo",
          "em_andamento",
          "pausado",
          "concluido",
          "cancelado",
          "faturado",
        ].includes(status)
      ) {
        throw new Error(`Status inválido: ${status}`);
      }

      // Buscar a OS atual para ter uma base para atualização
      const osAtual = await this.obter(id);

      // Criar versão temporária com o novo status
      const osTemporaria: OS = {
        ...osAtual,
        status: status as any,
        updatedAt: new Date().toISOString(),
        _atualizandoStatus: true, // Flag para indicar que está em processo de atualização
      };

      // Salvar versão temporária localmente antes de tentar API
      salvarOSLocalmente(osTemporaria);

      try {
        // Tentar fazer a atualização na API
        const apiStatus = mapStatusToApi(status);
        const response = await api.patch<ServiceOrderAPI>(
          `/service-orders/${id}/status`,
          {
            status: apiStatus,
            // Enviar o valor apenas se ele existir
            ...(osAtual.valorTotal ? { amount: osAtual.valorTotal } : {}),
          }
        );

        // Se a API retornou com sucesso, mapear para o formato interno e salvar localmente
        const osAtualizada = {
          ...osAtual,
          status: mapStatus(response.data.status),
          updatedAt: response.data.updatedAt,
          valorTotal:
            response.data.amount !== undefined
              ? response.data.amount
              : osAtual.valorTotal,
          _statusAlteradoOffline: false, // Limpar flag de alteração offline
          _atualizandoStatus: false, // Limpar flag de em atualização
        };

        // Salvar versão atualizada localmente
        salvarOSLocalmente(osAtualizada);

        // Adicionar evento na timeline
        try {
          const eventos = await this.listarEventos(id);
          const novoEvento = {
            id: Date.now(),
            tipo: "status",
            descricao: "alterou o status para",
            data: new Date().toISOString(),
            usuario: {
              id: 1,
              nome: localStorage.getItem("userName") || "Usuário",
            },
            metadados: {
              status,
              valorTotal: osAtualizada.valorTotal,
            },
          };
          salvarEventosLocalmente(id, [novoEvento, ...eventos]);
        } catch (eventError) {
          console.error("Erro ao adicionar evento na timeline:", eventError);
        }

        console.log(`Status da OS ${id} alterado com sucesso para ${status}`);
        return osAtualizada;
      } catch (error) {
        console.error(
          `Erro ao mudar status da OS ${id} para ${status}:`,
          error
        );

        // Mesmo com erro na API, manter o status alterado localmente com flag de alteração offline
        const osOffline = {
          ...osTemporaria,
          _statusAlteradoOffline: true, // Marcar que foi alterado offline
          _atualizandoStatus: false, // Limpar flag de em atualização
        };

        // Salvar versão offline
        salvarOSLocalmente(osOffline);

        // Adicionar evento offline na timeline
        try {
          const eventos = await this.listarEventos(id);
          const novoEvento = {
            id: Date.now(),
            tipo: "status",
            descricao: "alterou o status para (offline)",
            data: new Date().toISOString(),
            usuario: {
              id: 1,
              nome: localStorage.getItem("userName") || "Usuário",
            },
            metadados: {
              status,
              valorTotal: osOffline.valorTotal,
              offline: true,
            },
          };
          salvarEventosLocalmente(id, [novoEvento, ...eventos]);
        } catch (eventError) {
          console.error(
            "Erro ao adicionar evento offline na timeline:",
            eventError
          );
        }

        // Retornar a versão offline para a UI mostrar corretamente
        return osOffline;
      }
    } catch (error) {
      console.error(`Erro ao processar mudança de status da OS ${id}:`, error);
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
    try {
      const response = await api.post<RegistroTempo>(
        `/service-orders/${id}/tempo`,
        dados
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar tempo:", error);
      throw error;
    }
  },

  async listarRegistrosTempo(id: number) {
    try {
      const response = await api.get<RegistroTempo[]>(
        `/service-orders/${id}/tempo`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar registros de tempo:", error);
      return [];
    }
  },

  async uploadArquivo(id: number, arquivo: File) {
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);

      const response = await api.post<Arquivo>(
        `/service-orders/${id}/arquivos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer upload de arquivo:", error);
      throw error;
    }
  },

  async listarArquivos(id: number) {
    try {
      const response = await api.get<Arquivo[]>(
        `/service-orders/${id}/arquivos`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar arquivos:", error);
      // Mock de arquivos caso a API falhe
      return mockArquivos();
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
      const response = await api.post(`/service-orders/${id}/fatura`, dados);
      return response.data;
    } catch (error) {
      console.error("Erro ao gerar fatura:", error);
      throw error;
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
      // Converter os parâmetros para o formato da nova API
      const apiParams: any = {
        page: params.pagina,
        search: params.busca,
      };

      if (params.status) {
        apiParams.status = params.status.map(mapStatusToApi);
      }

      if (params.dataInicio) {
        apiParams.scheduledDateStart = params.dataInicio;
      }

      if (params.dataFim) {
        apiParams.scheduledDateEnd = params.dataFim;
      }

      const response = await api.get<ServiceOrderAPI[]>("/service-orders", {
        params: apiParams,
      });

      let mappedData = mapApiResponseToOS(response.data);

      // Verificar se existem versões mais recentes no localStorage
      mappedData = mappedData.map((os) => {
        const osLocal = recuperarOSLocalmenteSeExistir(os.id);
        if (osLocal && new Date(osLocal.updatedAt) > new Date(os.updatedAt)) {
          console.log(
            `OS ${os.id} encontrada no localStorage com versão mais recente durante filtro`
          );
          return osLocal;
        }
        return os;
      });

      // Reaplica o filtro de status no lado do cliente com as versões atualizadas
      if (params.status && params.status.length > 0) {
        console.log(
          "Reaplicando filtro de status para versões do localStorage:",
          params.status
        );
        mappedData = mappedData.filter((os) =>
          params.status!.includes(os.status)
        );
      }

      return {
        data: mappedData,
        total: mappedData.length,
        paginas: 1, // A nova API não suporta paginação ainda
      };
    } catch (error) {
      console.error("Erro ao listar ordens de serviço com filtros:", error);
      // Mock de dados caso a API falhe
      let mockData = mockOrdensServico();

      // Verificar se existem versões no localStorage
      mockData = mockData.map((os) => {
        const osLocal = recuperarOSLocalmenteSeExistir(os.id);
        if (osLocal) {
          console.log(
            `OS mockada ${os.id} substituída pela versão do localStorage durante filtro`
          );
          return osLocal;
        }
        return os;
      });

      // Aplicar filtros simulados
      let filteredData = [...mockData];

      if (params.busca) {
        filteredData = filteredData.filter(
          (os) =>
            os.titulo.toLowerCase().includes(params.busca!.toLowerCase()) ||
            os.cliente.nome.toLowerCase().includes(params.busca!.toLowerCase())
        );
      }

      if (params.status && params.status.length > 0) {
        filteredData = filteredData.filter((os) =>
          params.status!.includes(os.status)
        );
      }

      return {
        data: filteredData,
        total: filteredData.length,
        paginas: 1,
      };
    }
  },

  async listarComentarios(osId: number) {
    try {
      console.log(`Buscando comentários para a OS ${osId}`);
      // Alterado o endpoint para seguir o padrão dos outros (adicionado 's' no final de order)
      const response = await api.get(`/service-orders/${osId}/comments`);

      // Salvar os comentários da API localmente para uso offline
      try {
        salvarComentariosLocalmente(osId, response.data);
      } catch (e) {
        console.error("Erro ao salvar comentários da API localmente:", e);
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao listar comentários da OS ${osId}:`, error);
      console.log("Usando comentários mockados");
      // Mock de comentários caso a API falhe
      return mockComentarios(osId);
    }
  },

  async adicionarComentario(osId: number, texto: string) {
    try {
      console.log(`Adicionando comentário à OS ${osId}:`, texto);
      // Alterado o endpoint para seguir o padrão dos outros (adicionado 's' no final de order)
      const response = await api.post(`/service-orders/${osId}/comments`, {
        texto,
      });

      // Adicionar o comentário localmente após sucesso na API
      try {
        const comentariosAtuais = mockComentarios(osId);
        const novoComentario = response.data;
        salvarComentariosLocalmente(osId, [
          novoComentario,
          ...comentariosAtuais,
        ]);
      } catch (e) {
        console.error("Erro ao salvar novo comentário localmente após API:", e);
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);

      // Criar um comentário mockado e salvá-lo localmente
      const novoComentario = {
        id: Date.now(),
        texto,
        osId,
        usuario: {
          id: 1,
          nome: localStorage.getItem("userName") || "Usuário Atual",
        },
        createdAt: new Date().toISOString(),
      };

      try {
        const comentariosAtuais = mockComentarios(osId);
        salvarComentariosLocalmente(osId, [
          novoComentario,
          ...comentariosAtuais,
        ]);
      } catch (e) {
        console.error("Erro ao salvar novo comentário mockado localmente:", e);
      }

      return novoComentario;
    }
  },

  async listarTemplates() {
    try {
      const response = await api.get("/service-orders/templates");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar templates:", error);
      return [];
    }
  },

  async aplicarTemplate(osId: number, templateId: number) {
    try {
      const response = await api.post(
        `/service-orders/${osId}/aplicar-template/${templateId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao aplicar template:", error);
      throw error;
    }
  },

  async obterMetricas(params?: { dataInicio?: string; dataFim?: string }) {
    try {
      const apiParams: any = {};

      if (params?.dataInicio) {
        apiParams.scheduledDateStart = params.dataInicio;
      }

      if (params?.dataFim) {
        apiParams.scheduledDateEnd = params.dataFim;
      }

      const response = await api.get("/service-orders/metricas", {
        params: apiParams,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao obter métricas:", error);
      return {};
    }
  },

  async gerarRelatorio(params: {
    tipo: string;
    dataInicio: string;
    dataFim: string;
    formato?: "pdf" | "excel";
  }) {
    try {
      const apiParams = {
        type: params.tipo,
        scheduledDateStart: params.dataInicio,
        scheduledDateEnd: params.dataFim,
        format: params.formato,
      };

      const response = await api.get("/service-orders/relatorios", {
        params: apiParams,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw error;
    }
  },

  async listarNotificacoes() {
    try {
      const response = await api.get<Notificacao[]>(
        "/service-orders/notificacoes"
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao listar notificações:", error);
      return [];
    }
  },

  async marcarNotificacaoComoLida(id: number) {
    try {
      const response = await api.put(`/service-orders/notificacoes/${id}/lida`);
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw error;
    }
  },

  async listarEventos(osId: number) {
    try {
      const response = await api.get(`/service-orders/${osId}/eventos`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar eventos da OS:", error);
      return mockEventos(osId);
    }
  },

  // Adicionando uma nova função para limpar o armazenamento local
  limparDadosMock() {
    try {
      const resultado = limparDadosOS();
      return {
        success: true,
        message: `Dados locais limpos com sucesso. ${resultado.total} itens removidos.`,
      };
    } catch (error) {
      console.error("Erro ao limpar dados locais:", error);
      return {
        success: false,
        message: `Erro ao limpar dados locais: ${error}`,
      };
    }
  },

  // Adicionar uma nova função para verificar e sincronizar dados
  async verificarIntegridadeDados() {
    try {
      console.log("Iniciando verificação de integridade dos dados...");

      // Verificar se existem OS modificadas no localStorage
      const osModificadasKey = "os_modificadas_ids";
      const idsString = localStorage.getItem(osModificadasKey) || "[]";
      const ids = JSON.parse(idsString);

      if (ids.length === 0) {
        console.log("Nenhuma OS modificada localmente encontrada.");
        return { sincronizados: 0, total: 0, success: true };
      }

      console.log(`Encontradas ${ids.length} OS modificadas localmente:`, ids);
      let sincronizados = 0;
      let sincronizacoesComErro = 0;

      // Para cada ID, verificar com o servidor
      for (const id of ids) {
        try {
          const osLocal = recuperarOSLocalmenteSeExistir(id);
          if (osLocal && osLocal._statusAlteradoOffline) {
            console.log(
              `Tentando sincronizar OS ${id} com status offline: ${osLocal.status}`
            );

            // Tentar sincronizar com o servidor
            try {
              await this.mudarStatus(id, osLocal.status);
              sincronizados++;

              // Remover da lista de OS modificadas se sincronizada com sucesso
              const idIndex = ids.indexOf(id);
              if (idIndex > -1) {
                ids.splice(idIndex, 1);
                localStorage.setItem(osModificadasKey, JSON.stringify(ids));
              }
            } catch (syncError) {
              console.error(`Erro ao sincronizar OS ${id}:`, syncError);
              sincronizacoesComErro++;
            }
          }
        } catch (err) {
          console.error(`Erro ao processar OS ${id}:`, err);
          sincronizacoesComErro++;
        }
      }

      const resultado = {
        sincronizados,
        sincronizacoesComErro,
        total: ids.length + sincronizados, // Total inclui os que foram removidos da lista
        success: true,
        idsRestantes: ids,
      };

      console.log("Resultado da verificação de integridade:", resultado);
      return resultado;
    } catch (error) {
      console.error("Erro ao verificar integridade dos dados:", error);
      return {
        sincronizados: 0,
        sincronizacoesComErro: 0,
        total: 0,
        success: false,
        error,
      };
    }
  },
};

// Funções de mock para dados estáticos quando a API falha
function mockOrdensServico(): OS[] {
  return [
    {
      id: 1,
      numero: "OS-0001",
      titulo: "Manutenção preventiva",
      descricao: "Realizar manutenção preventiva em todos os equipamentos",
      status: "novo",
      cliente: {
        id: 1,
        nome: "Empresa ABC Ltda",
        email: "contato@abc.com",
        telefone: "(11) 98765-4321",
      },
      responsavel: {
        id: 1,
        nome: "João Silva",
        email: "joao@example.com",
        cargo: "Técnico",
      },
      prazo: "25/12/2023",
      valorTotal: 1500.0,
      createdAt: "2023-11-15T10:30:00Z",
      updatedAt: "2023-11-15T10:30:00Z",
    },
    {
      id: 2,
      numero: "OS-0002",
      titulo: "Instalação de rede",
      descricao: "Instalar nova rede de computadores",
      status: "em_andamento",
      cliente: {
        id: 2,
        nome: "Empresa XYZ S.A.",
        email: "contato@xyz.com",
        telefone: "(11) 91234-5678",
      },
      responsavel: {
        id: 2,
        nome: "Maria Oliveira",
        email: "maria@example.com",
        cargo: "Analista",
      },
      prazo: "30/12/2023",
      valorTotal: 3200.0,
      createdAt: "2023-11-20T14:45:00Z",
      updatedAt: "2023-11-22T09:15:00Z",
    },
    {
      id: 3,
      numero: "OS-0003",
      titulo: "Suporte ao usuário",
      descricao: "Realizar suporte remoto para resolução de problemas",
      status: "concluido",
      cliente: {
        id: 3,
        nome: "Loja Modelo",
        email: "suporte@modelo.com",
        telefone: "(11) 97777-8888",
      },
      responsavel: {
        id: 1,
        nome: "João Silva",
        email: "joao@example.com",
        cargo: "Técnico",
      },
      prazo: "18/12/2023",
      valorTotal: 800.0,
      createdAt: "2023-12-01T08:30:00Z",
      updatedAt: "2023-12-10T16:20:00Z",
    },
    {
      id: 4,
      numero: "OS-0004",
      titulo: "Consultoria de TI",
      descricao: "Realizar consultoria para melhorias de infraestrutura",
      status: "faturado",
      cliente: {
        id: 4,
        nome: "Indústria Inovadora",
        email: "ti@inovadora.com",
        telefone: "(11) 94444-5555",
      },
      responsavel: {
        id: 3,
        nome: "Carlos Mendes",
        email: "carlos@example.com",
        cargo: "Consultor",
      },
      prazo: "05/12/2023",
      valorTotal: 5000.0,
      createdAt: "2023-11-25T11:00:00Z",
      updatedAt: "2023-12-06T14:30:00Z",
    },
  ];
}

function mockOrdemServico(id: number): OS {
  const allOS = mockOrdensServico();
  const found = allOS.find((os) => os.id === id);
  if (found) return found;

  // OS padrão caso não encontre
  return {
    id,
    numero: `OS-${id.toString().padStart(4, "0")}`,
    titulo: "Ordem de serviço exemplo",
    descricao:
      "Esta é uma ordem de serviço de exemplo criada quando a API falha",
    status: "novo",
    cliente: {
      id: 1,
      nome: "Cliente exemplo",
      email: "cliente@example.com",
      telefone: "(00) 00000-0000",
    },
    responsavel: null,
    prazo: "31/12/2023",
    valorTotal: 1000.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mockArquivos(): Arquivo[] {
  return [
    {
      id: 1,
      nome: "proposta.pdf",
      tamanho: 1048576, // 1MB
      tipo: "application/pdf",
      url: "#",
      createdAt: "2023-12-01T10:30:00Z",
    },
    {
      id: 2,
      nome: "contrato.docx",
      tamanho: 524288, // 512KB
      tipo: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "#",
      createdAt: "2023-12-02T14:45:00Z",
    },
  ];
}
