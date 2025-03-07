import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import { TimelineEventService } from "@/services/timelineEventService";

// Interface para definir o formato esperado dos eventos
interface Event {
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

    // Buscar os eventos da timeline diretamente do banco de dados
    const eventos = await TimelineEventService.listEvents(serviceOrderId);

    return res.status(200).json(eventos);
  } catch (error) {
    console.error("Erro ao listar eventos da timeline:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
