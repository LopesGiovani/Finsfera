import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User, Customer } from "@/pages/api/_app-init";
import { TimelineEventService } from "@/services/timelineEventService";

// Handler para transferir uma ordem de serviço para outro funcionário
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Middleware de autenticação
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req as AuthenticatedRequest, res, () => resolve());
    });

    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;

    // Verificar se o usuário tem permissão (precisa ser pelo menos assistant)
    if (!user || !user.active) {
      return res
        .status(403)
        .json({ message: "Acesso negado: usuário inativo ou não autenticado" });
    }

    // Middleware de acesso à organização
    await new Promise<void>((resolve, reject) => {
      organizationAccessMiddleware(authenticatedReq, res, () => resolve());
    });

    // Verificar se o método é POST
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método não permitido" });
    }

    // Obter ID da ordem de serviço da URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const serviceOrderId = parseInt(id);

    // Obter os dados da transferência do corpo da requisição
    const { assignedToId, reason } = req.body;

    if (!assignedToId) {
      return res
        .status(400)
        .json({ message: "ID do novo responsável não fornecido" });
    }

    if (!reason) {
      return res
        .status(400)
        .json({ message: "Motivo da transferência não fornecido" });
    }

    // Buscar a OS para verificar permissões e dados atuais
    const serviceOrder = await ServiceOrder.findOne({
      where: { id: serviceOrderId },
      include: [
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "document"],
        },
      ],
    });

    if (!serviceOrder) {
      return res
        .status(404)
        .json({ message: "Ordem de serviço não encontrada" });
    }

    // Verificar permissão para transferir (apenas admin, owner, manager ou responsável atual)
    if (
      user.role !== "system_admin" &&
      user.role !== "owner" &&
      user.role !== "manager" &&
      serviceOrder.assignedToId !== user.id
    ) {
      return res.status(403).json({
        message: "Sem permissão para transferir esta ordem de serviço",
      });
    }

    // Verificar se o novo responsável existe
    const newAssignee = await User.findOne({
      where: { id: assignedToId, organizationId: user.organizationId },
    });

    if (!newAssignee) {
      return res
        .status(404)
        .json({ message: "Novo responsável não encontrado" });
    }

    // Verificar se não está transferindo para o mesmo responsável
    if (serviceOrder.assignedToId === assignedToId) {
      return res
        .status(400)
        .json({ message: "A OS já está atribuída a este usuário" });
    }

    // Criar registro de transferência
    const transferRecord = {
      date: new Date(),
      fromUserId: serviceOrder.assignedToId,
      toUserId: assignedToId,
      reason: reason,
    };

    // Obter histórico de transferências existente ou inicializar um novo array
    const transferHistory = Array.isArray(serviceOrder.transferHistory)
      ? [...serviceOrder.transferHistory, transferRecord]
      : [transferRecord];

    // Atualizar a OS com o novo responsável e histórico de transferências
    await serviceOrder.update({
      assignedToId: assignedToId,
      transferHistory: transferHistory,
    });

    // Obter o nome do usuário anterior
    let fromUserName = "Usuário anterior";
    if (serviceOrder.assignedToId) {
      const previousUser = await User.findByPk(serviceOrder.assignedToId);
      if (previousUser) {
        fromUserName = previousUser.get("name") || fromUserName;
      }
    }

    // Registrar evento na timeline
    await TimelineEventService.registerTransfer({
      serviceOrderId,
      userId: user.id,
      fromUserId: serviceOrder.assignedToId,
      fromUserName: fromUserName,
      toUserId: assignedToId,
      toUserName: newAssignee.name,
      reason: reason,
    });

    // Buscar a ordem de serviço atualizada
    const updatedServiceOrder = await ServiceOrder.findOne({
      where: { id: serviceOrderId },
      include: [
        {
          model: User,
          as: "assignedTo",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: User,
          as: "assignedBy",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "email", "phone", "document"],
        },
      ],
    });

    return res.status(200).json(updatedServiceOrder);
  } catch (error) {
    console.error("Erro ao transferir ordem de serviço:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
