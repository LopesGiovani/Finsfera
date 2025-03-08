import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";
import User from "../../../models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log de entrada para depuração
  console.log("[API] /api/auth/me - Requisição recebida");

  // Apenas método GET é permitido
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  // Log para depuração - verificar headers
  console.log("[API] /api/auth/me - Headers:", {
    auth: req.headers.authorization?.substring(0, 20) + "...",
  });

  try {
    // Extrair o token do header de autorização
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("[API] /api/auth/me - Token não fornecido");
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Token não fornecido.",
      });
    }

    // Verificar o token
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.userId) {
      console.log("[API] /api/auth/me - Token inválido ou expirado");
      return res.status(401).json({
        success: false,
        message: "Sessão expirada ou inválida. Faça login novamente.",
      });
    }

    // Buscar o usuário pelo ID
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] }, // Exclui a senha dos dados retornados
    });

    if (!user) {
      console.log(
        `[API] /api/auth/me - Usuário ID ${decoded.userId} não encontrado`
      );
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado.",
      });
    }

    // Verificar se o usuário está ativo
    if (user.active === false) {
      console.log(
        `[API] /api/auth/me - Usuário ID ${decoded.userId} está inativo`
      );
      return res.status(403).json({
        success: false,
        message: "Usuário desativado. Entre em contato com o administrador.",
      });
    }

    // Log para depuração após busca bem-sucedida
    console.log(
      `[API] /api/auth/me - Usuário ID ${decoded.userId} autenticado com sucesso`
    );

    // Retornar os dados do usuário
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    // Log de erro para depuração
    console.error("[API] /api/auth/me - Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
}
