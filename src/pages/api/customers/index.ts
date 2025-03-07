import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import Customer from "@/models/Customer";
import { CustomerPlan } from "@/types/customer";
import { Op } from "sequelize";
import sequelize from "@/lib/db";
import { Sequelize } from "sequelize";

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
      user.role !== "manager" &&
      user.role !== "technician" &&
      user.role !== "assistant"
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
      const { search, active, plan } = req.query;

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

      // Filtro de plano
      if (plan) {
        whereClause.plan = plan;
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
        mobile,
        company,
        street,
        number,
        complement,
        district,
        city,
        state,
        zipCode,
        contactPerson,
        notes,
        plan,
        organizationId: requestedOrgId, // Permitir especificar organizationId na requisição
      } = req.body;

      // Validações básicas
      if (
        !name ||
        !document ||
        !email ||
        !phone ||
        !street ||
        !number ||
        !district ||
        !city ||
        !state ||
        !zipCode
      ) {
        return res.status(400).json({
          message: "Todos os campos obrigatórios devem ser preenchidos",
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Formato de email inválido",
        });
      }

      // Validar plano
      if (plan && !Object.values(CustomerPlan).includes(plan)) {
        return res.status(400).json({
          message:
            "Plano inválido. Os valores permitidos são: prata, ouro, vip",
        });
      }

      // Definir o ID da organização
      let customerOrgId = user.organizationId;

      // Se o usuário é um administrador do sistema e especificou uma organização
      if (user.role === "system_admin" && requestedOrgId) {
        customerOrgId = requestedOrgId;
      }

      // Se ainda não temos uma organização, retornar erro
      if (!customerOrgId) {
        return res.status(400).json({
          message: "É necessário especificar uma organização para o cliente",
        });
      }

      // Verificar se o documento já existe para esta organização
      const existingCustomer = await Customer.findOne({
        where: {
          document,
          organizationId: customerOrgId,
        },
      });

      if (existingCustomer) {
        return res
          .status(400)
          .json({ message: "Já existe um cliente com este documento" });
      }

      try {
        // Criar novo cliente
        const newCustomer = await Customer.create({
          name,
          document,
          email,
          phone,
          mobile: mobile || null,
          company: company || null,
          street,
          number,
          complement: complement || null,
          district,
          city,
          state,
          zipCode,
          contactPerson: contactPerson || null,
          notes: notes || null,
          plan: plan || CustomerPlan.PRATA, // Valor padrão é prata
          organizationId: customerOrgId,
          active: true,
        });

        // Atualizar a coluna address para manter compatibilidade
        await sequelize.query(`
          UPDATE customers 
          SET address = '${street.replace(/'/g, "''")}' 
          WHERE id = ${newCustomer.id}
        `);

        return res.status(201).json({
          message: "Cliente adicionado com sucesso",
          customer: newCustomer,
        });
      } catch (error: any) {
        console.error("Erro ao criar cliente:", error);

        // Verificar se é um erro de validação
        if (error.name === "SequelizeValidationError") {
          const validationErrors = error.errors.map((err: any) => ({
            field: err.path,
            message: err.message,
          }));

          return res.status(400).json({
            message: "Erro de validação",
            errors: validationErrors,
          });
        }

        // Verificar se é um erro de chave única (documento duplicado)
        if (error.name === "SequelizeUniqueConstraintError") {
          return res.status(400).json({
            message: "Já existe um cliente com este documento ou email",
          });
        }

        return res.status(500).json({
          message:
            "Erro ao criar cliente. Verifique os dados e tente novamente.",
        });
      }
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de clientes:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
