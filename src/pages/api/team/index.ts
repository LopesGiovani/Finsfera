import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";
import {
  authMiddleware,
  roleMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import User from "@/models/User";
import bcrypt from "bcrypt";

// Função para gerar uma senha temporária
const generateTemporaryPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Handler para gerenciar membros da equipe
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

    // GET - Listar membros da equipe
    if (req.method === "GET") {
      const organizationId = user.organizationId;

      // System admin pode ver membros de qualquer organização
      const whereClause =
        user.role === "system_admin" && req.query.organizationId
          ? { organizationId: parseInt(req.query.organizationId as string) }
          : { organizationId };

      // Busca membros da equipe (exceto o owner, se quem busca não for system_admin)
      const teamMembers = await User.findAll({
        where: {
          ...whereClause,
          ...(user.role !== "system_admin"
            ? { role: { [Op.ne]: "owner" } }
            : {}),
        },
        attributes: { exclude: ["password"] },
        order: [["name", "ASC"]],
      });

      return res.status(200).json(teamMembers);
    }

    // POST - Adicionar membro à equipe
    if (req.method === "POST") {
      const { name, email, role, canSeeAllOS } = req.body;
      const organizationId = user.organizationId;

      // Validações básicas
      if (!name || !email || !role) {
        return res
          .status(400)
          .json({ message: "Nome, email e função são obrigatórios" });
      }

      // Verificar se o email já existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Verificar se o role é válido
      const validRoles = ["manager", "technician", "assistant"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Função inválida" });
      }

      // Gerar senha temporária
      const tempPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Criar novo usuário
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        organizationId,
        canSeeAllOS: !!canSeeAllOS,
        active: true,
      });

      // TODO: Enviar email com credenciais (implementação futura)
      // await sendWelcomeEmail(email, name, tempPassword);

      return res.status(201).json({
        message: "Membro da equipe adicionado com sucesso",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          canSeeAllOS: newUser.canSeeAllOS,
          active: newUser.active,
        },
        tempPassword, // Remover em produção ou após implementar envio de email
      });
    }

    // Método não suportado
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de equipe:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
