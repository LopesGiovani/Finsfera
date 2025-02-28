import { NextApiRequest, NextApiResponse } from "next";
import { authenticateUser } from "@/lib/auth";
import { testConnection } from "@/lib/db";

// Inicializa a conexão com o banco de dados
try {
  testConnection();
} catch (error) {
  console.error("Falha ao conectar com o banco de dados:", error);
}

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
    const { email, password } = req.body;

    // Valida os campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email e senha são obrigatórios" });
    }

    // Autentica o usuário
    const authResult = await authenticateUser(email, password);

    if (!authResult.success) {
      return res
        .status(401)
        .json({ success: false, message: authResult.message });
    }

    // Define o cookie com o token
    res.setHeader(
      "Set-Cookie",
      `token=${authResult.token}; Path=/; HttpOnly; Max-Age=${
        60 * 60 * 24
      }; SameSite=Strict`
    );

    // Retorna os dados do usuário
    return res.status(200).json({
      success: true,
      user: authResult.user,
    });
  } catch (error) {
    console.error("Erro ao processar login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
}
