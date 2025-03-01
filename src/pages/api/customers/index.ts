import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import Customer from "@/models/Customer";
import { Op } from "sequelize";

// Handler para gerenciar clientes
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

    // Verificar se o usuário tem permissão (precisa ser pelo menos manager ou dono)
    if (
      user.role !== "owner" &&
      user.role !== "system_admin" &&
      user.role !== "manager"
    ) {
      return res
        .status(403)
        .json({ message: "Acesso negado: permissão insuficiente" });
    }

    // Middleware de acesso à organização
    await new Promise<void>((resolve, reject) => {
      organizationAccessMiddleware(authenticatedReq, res, () => resolve());
    });

    // GET - Listar clientes
    if (req.method === "GET") {
      const organizationId = user.organizationId;
      const { search, active } = req.query;

      // Filtros
      const whereClause: any = {
        ...(user.role !== "system_admin"
          ? { organizationId: user.organizationId }
          : req.query.organizationId
          ? { organizationId: parseInt(req.query.organizationId as string) }
          : {}),
      };

      // Filtro de pesquisa
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { document: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filtro de status (ativo/inativo)
      if (active !== undefined) {
        whereClause.active = active === "true";
      }

      // Busca clientes
      const customers = await Customer.findAll({
        where: whereClause,
        order: [["name", "ASC"]],
      });

      return res.status(200).json(customers);
    }

    // POST - Adicionar cliente
    if (req.method === "POST") {
      const {
        name,
        document,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        contactPerson,
        notes,
      } = req.body;

      // Validações básicas
      if (
        !name ||
        !document ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !zipCode
      ) {
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos",
        });
      }

      // Verificar se o documento já existe para esta organização
      const existingCustomer = await Customer.findOne({
        where: {
          document,
          organizationId: user.organizationId,
        },
      });

      if (existingCustomer) {
        return res
          .status(400)
          .json({ message: "Já existe um cliente com este documento" });
      }

      // Criar novo cliente
      const newCustomer = await Customer.create({
        name,
        document,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        contactPerson: contactPerson || null,
        notes: notes || null,
        organizationId: user.organizationId,
        active: true,
      });

      return res.status(201).json({
        message: "Cliente adicionado com sucesso",
        customer: newCustomer,
      });
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de clientes:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
