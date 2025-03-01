import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User, Customer } from "@/pages/api/_app-init";

// Handler para gerenciar uma ordem de serviço específica
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

    // Obter ID da ordem de serviço da URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const serviceOrderId = parseInt(id);

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
      return res
        .status(404)
        .json({ message: "Ordem de serviço não encontrada" });
    }

    // Verificar permissão para acessar a ordem de serviço
    if (
      user.role !== "system_admin" &&
      user.organizationId !== serviceOrder.organizationId
    ) {
      return res.status(403).json({
        message: "Sem permissão para acessar esta ordem de serviço",
      });
    }

    // Se o usuário não é admin, proprietário ou gerente e não pode ver todas as OS,
    // verificar se está atribuída a ele
    if (
      user.role !== "system_admin" &&
      user.role !== "owner" &&
      user.role !== "manager" &&
      !user.canSeeAllOS &&
      serviceOrder.assignedToId !== user.id
    ) {
      return res.status(403).json({
        message: "Sem permissão para acessar esta ordem de serviço",
      });
    }

    // GET - Obter detalhes da ordem de serviço
    if (req.method === "GET") {
      return res.status(200).json(serviceOrder);
    }

    // PUT - Atualizar ordem de serviço
    if (req.method === "PUT") {
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

      const {
        title,
        description,
        priority,
        status,
        assignedToId,
        scheduledDate,
        customerId,
      } = req.body;

      // Campos que podem ser atualizados
      const updateData: any = {};

      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (priority) updateData.priority = priority;

      // Apenas admin, owner ou manager podem alterar status ou responsável
      if (["system_admin", "owner", "manager"].includes(user.role)) {
        if (status) updateData.status = status;

        if (assignedToId) {
          // Verificar se o novo responsável existe e está na mesma organização
          const assignedTo = await User.findOne({
            where: {
              id: assignedToId,
              organizationId: serviceOrder.organizationId,
              active: true,
            },
          });

          if (!assignedTo) {
            return res.status(400).json({
              message:
                "Responsável inválido ou não pertence à mesma organização",
            });
          }

          updateData.assignedToId = assignedToId;
        }
      }

      if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
      if (customerId !== undefined) updateData.customerId = customerId || null;

      // Atualizar a ordem de serviço
      await serviceOrder.update(updateData);

      // Buscar a ordem de serviço atualizada com as relações
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

      return res.status(200).json({
        message: "Ordem de serviço atualizada com sucesso",
        serviceOrder: updatedServiceOrder,
      });
    }

    // DELETE - Excluir ordem de serviço
    if (req.method === "DELETE") {
      // Apenas admin, owner ou manager podem excluir
      if (!["system_admin", "owner", "manager"].includes(user.role)) {
        return res.status(403).json({
          message: "Sem permissão para excluir esta ordem de serviço",
        });
      }

      // Excluir a ordem de serviço
      await serviceOrder.destroy();

      return res.status(200).json({
        message: "Ordem de serviço excluída com sucesso",
      });
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de ordens de serviço:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
