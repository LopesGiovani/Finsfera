import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import Customer from "@/models/Customer";
import { Op } from "sequelize";

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
        address,
        city,
        state,
        zipCode,
        contactPerson,
        notes,
        active,
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

      // Preparar dados para atualização
      const updateData = {
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
        ...(active !== undefined ? { active } : {}),
      };

      // Atualizar o cliente
      await customer.update(updateData);

      return res.status(200).json({
        message: "Cliente atualizado com sucesso",
        customer,
      });
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
