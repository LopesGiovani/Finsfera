import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User, Customer } from "@/pages/api/_app-init";

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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status não fornecido" });
    }

    // Status válidos
    const validStatuses = ["pendente", "em_andamento", "concluida", "reprovada"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    // Buscar a ordem de serviço
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
      return res.status(404).json({ message: "Ordem de serviço não encontrada" });
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

    // Atualizar o status
    await serviceOrder.update({ status });

    // Opcionalmente, podemos adicionar mais campos a serem atualizados com base no status
    // Por exemplo, se o status for "concluida", podemos definir "closedAt" como a data atual
    if (status === "concluida" && !serviceOrder.closedAt) {
      await serviceOrder.update({ closedAt: new Date() });
    }

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