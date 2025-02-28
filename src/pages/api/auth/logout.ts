import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas aceita método POST
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Método não permitido" });
  }

  try {
    // Remove o cookie de autenticação
    res.setHeader(
      "Set-Cookie",
      "token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict"
    );

    return res
      .status(200)
      .json({ success: true, message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao realizar logout:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
}
