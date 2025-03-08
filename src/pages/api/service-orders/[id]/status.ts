import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User, Customer } from "@/pages/api/_app-init";
import { TimelineEventService } from "@/services/timelineEventService";

// Handler para atualizar o status de uma ordem de serviço específica
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

    // Verificar se o método é PATCH
    if (req.method !== "PATCH") {
      return res.status(405).json({ message: "Método não permitido" });
    }

    // Obter ID da ordem de serviço da URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const serviceOrderId = parseInt(id);

    // Obter o novo status do corpo da requisição
    const { status, closingReason, reopenReason } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status não fornecido" });
    }

    // Status válidos
    const validStatuses = [
      "pendente",
      "em_andamento",
      "concluida",
      "reprovada",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    // Se o status for "concluida", closingReason é obrigatório
    if (status === "concluida" && !closingReason) {
      return res.status(400).json({
        message:
          "O motivo de fechamento (closingReason) é obrigatório para concluir uma OS",
      });
    }

    // Buscar a OS para verificar se está sendo reaberta
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

    // Verificar se a OS está sendo reaberta (mudando de concluída para pendente)
    const isReopening =
      serviceOrder.status === "concluida" && status === "pendente";

    // Se está reabrindo, o motivo de reabertura é obrigatório
    if (isReopening && !reopenReason) {
      return res.status(400).json({
        message:
          "O motivo de reabertura (reopenReason) é obrigatório para reabrir uma OS",
      });
    }

    // Verificar permissão para editar (apenas admin, owner, manager ou responsável)
    if (
      user.role !== "system_admin" &&
      user.role !== "owner" &&
      user.role !== "manager" &&
      serviceOrder.assignedToId !== user.id
    ) {
      return res.status(403).json({
        message: "Sem permissão para editar esta ordem de serviço",
      });
    }

    // Salvar o status anterior para o registro do evento
    const oldStatus = serviceOrder.status;

    // Definir o status final (pode ser alterado para "encerrada" baseado na data)
    let finalStatus = status;
    let updateClosedAt = false;

    // Se o status for "concluida", verificar se deve ser "encerrada" baseado na data
    if (status === "concluida") {
      const scheduledDate = new Date(serviceOrder.scheduledDate);
      const currentDate = new Date();

      // Se a data agendada for anterior à data atual, mudar para "encerrada"
      if (scheduledDate < currentDate) {
        console.log(
          `OS ${serviceOrderId} concluída após a data agendada. Marcando como "encerrada".`
        );
        finalStatus = "encerrada";
        updateClosedAt = true;
      } else {
        updateClosedAt = true;
      }
    }

    // Preparar o objeto de atualização
    const updateData: any = { status: finalStatus };

    // Adicionar closingReason se fornecido
    if (closingReason) {
      updateData.closingReason = closingReason;
    }

    // Adicionar reopenReason se fornecido (ao reabrir uma OS)
    if (reopenReason) {
      updateData.reopenReason = reopenReason;
    }

    // Adicionar closedAt se necessário
    if (updateClosedAt && !serviceOrder.closedAt) {
      updateData.closedAt = new Date();
    }

    // Atualizar o status e outros campos
    await serviceOrder.update(updateData);

    // Registrar o evento de mudança de status na timeline
    await TimelineEventService.registerStatusChange({
      serviceOrderId,
      userId: user.id,
      oldStatus,
      newStatus: finalStatus,
      reason: closingReason || reopenReason,
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
    console.error("Erro ao atualizar status da ordem de serviço:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
