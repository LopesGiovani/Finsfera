import { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/authMiddleware";

// Handler para listar eventos de uma ordem de serviço
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Middleware de autenticação
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req as AuthenticatedRequest, res, () => resolve());
    });

    // Verificar se o método é GET
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Método não permitido" });
    }

    // Como solicitado, vamos usar o que já existe no projeto
    // Por enquanto, retornaremos um array vazio de eventos
    // Em uma implementação futura, isso poderia buscar eventos reais do banco de dados
    return res.status(200).json([]);
  } catch (error) {
    console.error("Erro ao processar eventos da OS:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
} 