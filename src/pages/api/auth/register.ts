import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import { refreshToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceita método POST
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Método não permitido" });
  }

  try {
    const { name, email, password } = req.body;

    // Valida os campos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e senha são obrigatórios",
      });
    }

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Este email já está em uso",
      });
    }

    // Cria o novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role: "assistant", // Definindo o papel padrão
      organizationId: null, // Será atualizado posteriormente ao associar a uma organização
      canSeeAllOS: false, // Valor padrão
      active: true, // Usuário ativo por padrão
    });

    // Gera o token
    const token = refreshToken(user.id, user.email);

    // Define o cookie com o token
    res.setHeader(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Max-Age=${
        60 * 60 * 24
      }; SameSite=Strict`
    );

    // Retorna os dados do usuário (sem a senha)
    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
}
