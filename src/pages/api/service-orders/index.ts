import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import { Op } from "sequelize";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User, Customer } from "@/pages/api/_app-init";
import { TimelineEventService } from "@/services/timelineEventService";

// Helper para normalizar texto (remover acentos, converter para minúsculas)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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
        page = "1",
      } = req.query;

      // Filtros
      let whereClause: any = {
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

      // Configurações de include padrão
      const includeConfig = [
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
      ];

      // Configuração para paginação
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 10;
      const offset = (pageNumber - 1) * pageSize;

      try {
        let serviceOrders;
        let totalCount = 0;

        // Se houver termo de busca, fazer uma busca mais abrangente
        if (search) {
          const searchTerm = `%${search}%`;

          // Primeiro, buscar por correspondências diretas
          const directMatches = await ServiceOrder.findAll({
            where: {
              ...whereClause,
              [Op.or]: [
                { title: { [Op.iLike]: searchTerm } },
                { description: { [Op.iLike]: searchTerm } },
                ...(isNaN(parseInt(search as string))
                  ? []
                  : [{ id: parseInt(search as string) }]),
              ],
            },
            include: includeConfig,
            order: [["createdAt", "DESC"]],
          });

          // Segundo, buscar por clientes correspondentes
          const clientMatches = await ServiceOrder.findAll({
            where: whereClause,
            include: [
              ...includeConfig.slice(0, 2),
              {
                model: Customer,
                as: "customer",
                where: {
                  name: { [Op.iLike]: searchTerm },
                },
                attributes: ["id", "name", "email", "phone", "document"],
              },
            ],
            order: [["createdAt", "DESC"]],
          });

          // Terceiro, buscar por responsáveis correspondentes
          const assignedToMatches = await ServiceOrder.findAll({
            where: whereClause,
            include: [
              {
                model: User,
                as: "assignedTo",
                where: {
                  name: { [Op.iLike]: searchTerm },
                },
                attributes: ["id", "name", "email", "role"],
              },
              includeConfig[1],
              includeConfig[2],
            ],
            order: [["createdAt", "DESC"]],
          });

          // Quarto, busca por agendamento (data)
          const today = new Date();
          const agendamentoMatches = await ServiceOrder.findAll({
            where: whereClause,
            include: includeConfig,
            order: [["createdAt", "DESC"]],
          });

          // Filtrar os resultados do agendamento manualmente
          const filteredAgendamentoMatches = agendamentoMatches.filter(
            (order: any) => {
              if (order.scheduledDate) {
                const date = new Date(order.scheduledDate);
                const formattedDate = date.toLocaleDateString("pt-BR"); // DD/MM/YYYY
                return normalizeText(formattedDate).includes(
                  normalizeText(search as string)
                );
              }
              return false;
            }
          );

          // Combinar resultados e remover duplicatas
          const allMatches = [
            ...directMatches,
            ...clientMatches,
            ...assignedToMatches,
            ...filteredAgendamentoMatches,
          ];
          const uniqueIds = new Set();
          const filteredOrders = allMatches.filter((order) => {
            if (uniqueIds.has(order.id)) return false;
            uniqueIds.add(order.id);
            return true;
          });

          totalCount = filteredOrders.length;

          // Aplicar paginação manualmente
          serviceOrders = filteredOrders.slice(offset, offset + pageSize);
        } else {
          // Busca padrão sem termo de pesquisa
          const result = await ServiceOrder.findAndCountAll({
            where: whereClause,
            include: includeConfig,
            order: [["createdAt", "DESC"]],
            limit: pageSize,
            offset: offset,
            distinct: true,
          });

          serviceOrders = result.rows;
          totalCount = result.count;
        }

        // Adicionar header com total para paginação
        res.setHeader("X-Total-Count", totalCount.toString());

        return res.status(200).json(serviceOrders);
      } catch (error) {
        console.error("Erro ao buscar ordens de serviço:", error);
        return res
          .status(500)
          .json({ message: "Erro interno ao buscar ordens de serviço" });
      }
    }

    // POST - Criar nova ordem de serviço
    if (req.method === "POST") {
      const {
        title,
        description,
        priority,
        assignedToId,
        scheduledDate,
        customerId,
      } = req.body;

      // Validações básicas
      if (!title || !description || !assignedToId || !scheduledDate) {
        return res.status(400).json({
          message:
            "Título, descrição, responsável e data de agendamento são obrigatórios",
        });
      }

      // Validar data de agendamento
      const scheduledDateObj = new Date(scheduledDate);
      if (isNaN(scheduledDateObj.getTime())) {
        return res
          .status(400)
          .json({ message: "Data de agendamento inválida" });
      }

      const organizationId = user.organizationId;

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
        priority: priority || "baixa",
        organizationId,
        assignedToId,
        assignedByUserId: user.id,
        scheduledDate: new Date(scheduledDate),
        status: "pendente",
        customerId: customerId || null,
      });

      // Registrar evento de criação
      await TimelineEventService.registerCreation({
        serviceOrderId: newServiceOrder.id,
        userId: user.id,
      });

      // Registrar evento de atribuição de responsável
      await TimelineEventService.registerAssignment({
        serviceOrderId: newServiceOrder.id,
        userId: user.id,
        assignedToId: assignedToId,
        assignedToName: assignedTo.name,
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
