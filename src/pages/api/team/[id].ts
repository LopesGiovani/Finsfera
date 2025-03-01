import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import User from "@/models/User";
import bcrypt from "bcrypt";

// Define o tipo para o role do usuário
type UserRole =
  | "system_admin"
  | "owner"
  | "manager"
  | "technician"
  | "assistant";

// Handler para gerenciar um membro específico da equipe
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

    // Verificar se o usuário tem permissão (owner ou admin)
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

    // Obter ID do membro da equipe da URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const memberId = parseInt(id);

    // Verificar se o membro existe e pertence à mesma organização
    const teamMember = await User.findOne({
      where: {
        id: memberId,
        ...(user.role !== "system_admin"
          ? { organizationId: user.organizationId }
          : {}),
      },
    });

    if (!teamMember) {
      return res
        .status(404)
        .json({ message: "Membro da equipe não encontrado" });
    }

    // Não permitir que modificações sejam feitas em usuários owner, exceto por system_admin
    if (teamMember.role === "owner" && user.role !== "system_admin") {
      return res
        .status(403)
        .json({ message: "Não é permitido modificar dados do proprietário" });
    }

    // GET - Obter dados do membro
    if (req.method === "GET") {
      const memberData = {
        id: teamMember.id,
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        organizationId: teamMember.organizationId,
        canSeeAllOS: teamMember.canSeeAllOS,
        active: teamMember.active,
        createdAt: teamMember.createdAt,
      };

      return res.status(200).json(memberData);
    }

    // PUT - Atualizar dados do membro
    if (req.method === "PUT") {
      const { name, email, role, canSeeAllOS, active, password } = req.body;

      // Validações básicas
      if (!name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }

      // Verificar se o email está sendo alterado e já existe para outro usuário
      if (email && email !== teamMember.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== memberId) {
          return res
            .status(400)
            .json({ message: "Email já cadastrado para outro usuário" });
        }
      }

      // Verificar se o role é válido
      if (role) {
        const validRoles = ["manager", "technician", "assistant"];
        // system_admin pode promover a owner
        if (user.role === "system_admin") {
          validRoles.push("owner");
        }

        if (!validRoles.includes(role)) {
          return res.status(400).json({ message: "Função inválida" });
        }
      }

      // Preparar dados para atualização
      type UpdateData = {
        name?: string;
        email?: string;
        role?: UserRole;
        canSeeAllOS?: boolean;
        active?: boolean;
        password?: string;
      };

      const updateData: UpdateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role as UserRole;
      if (canSeeAllOS !== undefined) updateData.canSeeAllOS = canSeeAllOS;
      if (active !== undefined) updateData.active = active;

      // Se há uma nova senha, faz o hash
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Atualizar o membro
      await teamMember.update(updateData);

      return res.status(200).json({
        message: "Membro da equipe atualizado com sucesso",
        user: {
          id: teamMember.id,
          name: teamMember.name,
          email: teamMember.email,
          role: teamMember.role,
          canSeeAllOS: teamMember.canSeeAllOS,
          active: teamMember.active,
        },
      });
    }

    // DELETE - Desativar membro
    if (req.method === "DELETE") {
      // Não excluímos realmente, apenas desativamos
      await teamMember.update({ active: false });

      return res.status(200).json({
        message: "Membro da equipe desativado com sucesso",
      });
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de membro da equipe:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
