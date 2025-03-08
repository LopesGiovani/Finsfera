import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";
import User from "@/models/User";
import bcrypt from "bcrypt";
import UserActivity from "../../../models/UserActivity";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas método PUT é permitido
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  try {
    // Verificar o token de autenticação
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado",
      });
    }

    // Decodificar o token para obter o ID do usuário
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    // Encontrar o usuário no banco de dados
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const { name, currentPassword, newPassword } = req.body;

    // Atualizar o nome se fornecido
    if (name) {
      user.name = name;
    }

    // Se uma nova senha foi fornecida, verificar a senha atual e atualizar
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Senha atual é obrigatória para alterar a senha",
        });
      }

      // Verificar se a senha atual está correta
      const isPasswordValid = await user.checkPassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Senha atual incorreta",
        });
      }

      // Gerar hash da nova senha
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Salvar as alterações
    await user.save();

    // Registrar a atividade
    const activityDetails: Record<string, boolean> = {};
    if (name) {
      activityDetails.nameUpdated = true;
    }
    if (newPassword) {
      activityDetails.passwordUpdated = true;
    }

    await UserActivity.create({
      userId: user.id,
      action: "Atualizou dados do perfil",
      details: activityDetails,
      ipAddress:
        (req.headers["x-real-ip"] as string) || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    // Retornar dados atualizados do usuário (sem a senha)
    return res.status(200).json({
      success: true,
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil",
    });
  }
}
