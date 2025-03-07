import { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/authMiddleware";
import { ServiceOrder, User } from "@/pages/api/_app-init";

// Interface para os eventos simulados
interface MockEvent {
  id: number;
  tipo: string;
  descricao: string;
  data: string;
  usuario: {
    id: number;
    nome: string;
  };
  metadados?: any;
}

// Handler para listar eventos de uma ordem de serviço
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Middleware de autenticação
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req as AuthenticatedRequest, res, () => resolve());
    });

    // Verificar se o método é GET
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Método não permitido" });
    }

    // Pegar o ID da OS da query string
    const { orderId } = req.query;
    const serviceOrderId = parseInt(orderId as string);

    if (isNaN(serviceOrderId)) {
      return res.status(400).json({ message: "ID de OS inválido" });
    }

    // Verificar se a OS existe
    const os = await ServiceOrder.findByPk(serviceOrderId);
    if (!os) {
      return res.status(404).json({ message: "Ordem de serviço não encontrada" });
    }

    // Extrair dados necessários da OS de forma segura
    const osData = os.get ? os.get({ plain: true }) : os;
    const status = osData.status || 'pendente';
    const createdAt = new Date(osData.createdAt || Date.now());

    // Dados de exemplo para simulação
    const eventos: MockEvent[] = [
      {
        id: 1,
        tipo: "criacao",
        descricao: "criou a ordem de serviço",
        data: createdAt.toISOString(),
        usuario: {
          id: 1,
          nome: "Administrador",
        },
      },
      {
        id: 2,
        tipo: "atribuicao",
        descricao: "atribuiu a ordem de serviço para",
        data: new Date(createdAt.getTime() + 60 * 60 * 1000).toISOString(),
        usuario: {
          id: 1,
          nome: "Administrador",
        },
        metadados: {
          responsavel: {
            id: 3,
            nome: "Técnico",
          },
        },
      }
    ];

    // Adicionar eventos de status dependendo do status atual
    if (status === "em_andamento" || status === "concluida") {
      eventos.push({
        id: 3,
        tipo: "status",
        descricao: "alterou o status para",
        data: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        usuario: {
          id: 3,
          nome: "Técnico",
        },
        metadados: {
          status: "em_andamento",
        },
      });
    }

    if (status === "concluida") {
      eventos.push({
        id: 4,
        tipo: "status",
        descricao: "alterou o status para",
        data: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        usuario: {
          id: 3,
          nome: "Técnico",
        },
        metadados: {
          status: "concluido",
        },
      });
    }

    // Adicionar comentário e registro de tempo
    eventos.push({
      id: eventos.length + 1,
      tipo: "comentario",
      descricao: "adicionou um comentário",
      data: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      usuario: {
        id: 3,
        nome: "Técnico",
      },
      metadados: {
        texto: "Iniciei o atendimento. Vou verificar o problema.",
      },
    });

    eventos.push({
      id: eventos.length + 1,
      tipo: "tempo",
      descricao: "registrou tempo de trabalho",
      data: new Date(createdAt.getTime() + 5 * 60 * 60 * 1000).toISOString(),
      usuario: {
        id: 3,
        nome: "Técnico",
      },
      metadados: {
        tempo: "1h 30min",
      },
    });

    // Ordenar eventos por data (mais recentes primeiro)
    eventos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return res.status(200).json(eventos);
  } catch (error) {
    console.error("Erro ao processar eventos da OS:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
} 