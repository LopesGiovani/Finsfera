import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User, Customer } from "@/pages/api/_app-init";
import { Op } from "sequelize";

// Handler para gerenciar ordens de serviço
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

    // GET - Listar ordens de serviço
    if (req.method === "GET") {
      const {
        status,
        priority,
        assignedToId,
        scheduledDateStart,
        scheduledDateEnd,
        search,
      } = req.query;

      // Filtros
      const whereClause: any = {
        ...(user.role !== "system_admin"
          ? { organizationId: user.organizationId }
          : req.query.organizationId
          ? { organizationId: parseInt(req.query.organizationId as string) }
          : {}),
      };

      // Se o usuário não pode ver todas as OS, mostrar apenas as atribuídas a ele
      if (
        user.role !== "system_admin" &&
        user.role !== "owner" &&
        !user.canSeeAllOS
      ) {
        whereClause.assignedToId = user.id;
      }

      // Filtro de status
      if (status) {
        whereClause.status = status;
      }

      // Filtro de prioridade
      if (priority) {
        whereClause.priority = priority;
      }

      // Filtro de responsável
      if (assignedToId) {
        whereClause.assignedToId = parseInt(assignedToId as string);
      }

      // Filtro de data programada
      if (scheduledDateStart || scheduledDateEnd) {
        whereClause.scheduledDate = {};

        if (scheduledDateStart) {
          whereClause.scheduledDate[Op.gte] = new Date(
            scheduledDateStart as string
          );
        }

        if (scheduledDateEnd) {
          whereClause.scheduledDate[Op.lte] = new Date(
            scheduledDateEnd as string
          );
        }
      }

      // Filtro de pesquisa
      if (search) {
        const searchTerm = `%${search}%`;
        whereClause[Op.or] = [
          { title: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } },
        ];
      }

      // Busca ordens de serviço
      const serviceOrders = await ServiceOrder.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
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

      return res.status(200).json(serviceOrders);
    }

    // POST - Criar ordem de serviço
    if (req.method === "POST") {
      const {
        title,
        description,
        priority,
        assignedToId,
        scheduledDate,
        customerId,
        value,
      } = req.body;

      // Validações básicas
      if (!title || !description || !assignedToId || !scheduledDate) {
        return res.status(400).json({
          message:
            "Campos obrigatórios: título, descrição, responsável e data programada",
        });
      }

      // Definir o ID da organização
      const organizationId = user.organizationId;

      if (!organizationId) {
        return res.status(400).json({
          message:
            "Usuário sem organização associada não pode criar ordens de serviço",
        });
      }

      // Verificar se o responsável existe e pertence à mesma organização
      const assignedTo = await User.findOne({
        where: {
          id: assignedToId,
          organizationId,
          active: true,
        },
      });

      if (!assignedTo) {
        return res.status(400).json({
          message: "Responsável inválido ou não pertence à mesma organização",
        });
      }

      // Criar nova ordem de serviço
      const newServiceOrder = await ServiceOrder.create({
        title,
        description,
        priority: priority || "media",
        organizationId,
        assignedToId,
        assignedByUserId: user.id,
        scheduledDate: new Date(scheduledDate),
        status: "pendente",
        customerId: customerId || null,
        value: value || null,
      });

      return res.status(201).json({
        message: "Ordem de serviço criada com sucesso",
        serviceOrder: newServiceOrder,
      });
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de ordens de serviço:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
