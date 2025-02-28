import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "@/middleware/auth";

// Handler para retornar os dados do usuário autenticado
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apenas método GET é permitido
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Método não permitido" });
  }

  try {
    // O middleware withAuth já adicionou o usuário ao request
    const user = (req as any).user;

    // Cria um objeto sem a senha para retornar
    const userObj = user.toJSON ? user.toJSON() : { ...user.dataValues };
    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao processar a solicitação" });
  }
};

// Exporta o handler com o middleware de autenticação
export default withAuth(handler);
