import { NextApiRequest, NextApiResponse } from "next";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// Obtém o JWT_SECRET do ambiente
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceita método POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const { email, password } = req.body;

    // Valida os campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e senha são obrigatórios" });
    }

    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Verifica se o usuário está ativo
    if (user.status !== "active") {
      return res.status(401).json({
        message:
          user.status === "pending"
            ? "Sua conta está pendente de ativação"
            : "Sua conta está desativada",
      });
    }

    // Verifica a senha
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Define o cookie de autenticação de forma mais simples
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    // Retorna os dados do usuário (excluindo a senha)
    // Certifique-se de que o objeto do usuário seja tratado corretamente
    const userObj = user.toJSON ? user.toJSON() : { ...user.dataValues };

    // Remova a senha do objeto do usuário
    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Erro de login:", error);
    return res.status(500).json({ message: "Erro ao processar a solicitação" });
  }
}
