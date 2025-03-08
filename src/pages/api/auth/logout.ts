import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log de entrada para depuração
  console.log("[API] /api/auth/logout - Requisição recebida");

  // Apenas método POST é permitido
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  try {
    // Extrair o token do header de autorização (opcional)
    const token = req.headers.authorization?.split(" ")[1];

    // Se houver token, tentar registrar atividade de logout
    if (token) {
      try {
        const decoded = await verifyToken(token);

        if (decoded && decoded.userId) {
          // Registrar atividade de logout
          const UserActivity = require("../../../models/UserActivity").default;

          await UserActivity.create({
            userId: decoded.userId,
            action: "Logout do sistema",
            ipAddress:
              (req.headers["x-real-ip"] as string) || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
          });

          console.log(
            `[API] /api/auth/logout - Atividade de logout registrada para usuário ${decoded.userId}`
          );
        }
      } catch (activityError) {
        // Apenas log do erro, não impede o logout
        console.error(
          "[API] /api/auth/logout - Erro ao registrar atividade:",
          activityError
        );
      }
    }

    // Remove o cookie de autenticação
    res.setHeader(
      "Set-Cookie",
      "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly"
    );

    // Sempre retornar sucesso, independentemente do token
    return res.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("[API] /api/auth/logout - Erro:", error);

    // Mesmo com erro, consideramos o logout bem-sucedido no cliente
    return res.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  }
}
