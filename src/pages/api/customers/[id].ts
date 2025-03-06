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

// Handler para gerenciar um cliente específico
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

    // Obter ID do cliente da URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const customerId = parseInt(id);

    // Verificar se o cliente existe e pertence à mesma organização
    const customer = await Customer.findOne({
      where: {
        id: customerId,
        ...(user.role !== "system_admin"
          ? { organizationId: user.organizationId }
          : {}),
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // GET - Obter dados do cliente
    if (req.method === "GET") {
      return res.status(200).json(customer);
    }

    // PUT - Atualizar dados do cliente
    if (req.method === "PUT") {
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
        active,
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

      // Verificar se o documento está sendo alterado e já existe para outro cliente
      if (document !== customer.document) {
        const existingCustomer = await Customer.findOne({
          where: {
            document,
            organizationId: customer.organizationId,
            id: { [Op.ne]: customerId },
          },
        });

        if (existingCustomer) {
          return res
            .status(400)
            .json({ message: "Já existe um cliente com este documento" });
        }
      }

      try {
        // Preparar dados para atualização
        const updateData = {
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
          ...(plan ? { plan } : {}),
          ...(active !== undefined ? { active } : {}),
        };

        // Atualizar o cliente
        await customer.update(updateData);

        // Atualizar a coluna address para manter compatibilidade
        await sequelize.query(`
          UPDATE customers 
          SET address = '${street.replace(/'/g, "''")}' 
          WHERE id = ${customer.id}
        `);

        return res.status(200).json({
          message: "Cliente atualizado com sucesso",
          customer,
        });
      } catch (error: any) {
        console.error("Erro ao atualizar cliente:", error);
        
        // Verificar se é um erro de validação
        if (error.name === 'SequelizeValidationError') {
          const validationErrors = error.errors.map((err: any) => ({
            field: err.path,
            message: err.message
          }));
          
          return res.status(400).json({
            message: "Erro de validação",
            errors: validationErrors
          });
        }
        
        return res.status(500).json({ 
          message: "Erro ao atualizar cliente. Verifique os dados e tente novamente." 
        });
      }
    }

    // DELETE - Desativar cliente
    if (req.method === "DELETE") {
      // Não excluímos realmente, apenas desativamos
      await customer.update({ active: false });

      return res.status(200).json({
        message: "Cliente desativado com sucesso",
      });
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de cliente:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
