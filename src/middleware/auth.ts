import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "@/models/User";

// Obtém o JWT_SECRET do ambiente
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Interface para o payload do token JWT
interface JwtPayload {
  id: number;
  email: string;
  role?: string;
}

// Middleware para verificar se o usuário está autenticado
export const withAuth = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Pega o token do cabeçalho ou dos cookies
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.token;

      // Verifica se o token existe
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Token não fornecido" });
      }

      // Verifica se o token é válido
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Busca o usuário no banco
      const user = await User.findByPk(decoded.id);

      // Verifica se o usuário existe
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não encontrado" });
      }

      // Adiciona o usuário ao request para uso posterior
      (req as any).user = user;

      // Passa para o handler original
      return handler(req, res);
    } catch (error) {
      console.error("Erro de autenticação:", error);
      return res
        .status(401)
        .json({ success: false, message: "Token inválido" });
    }
  };
};

// Middleware para verificar se o usuário possui determinado papel
export const withRole = (role: string) => (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Primeiro verifica a autenticação
    return withAuth(
      async (authReq: NextApiRequest, authRes: NextApiResponse) => {
        // Se chegou aqui, o usuário está autenticado
        const user = (authReq as any).user;

        // Verifica se o usuário tem o papel necessário
        if (user.role !== role) {
          return res.status(403).json({
            success: false,
            message: "Você não tem permissão para acessar este recurso",
          });
        }

        // Passa para o handler original
        return handler(authReq, authRes);
      }
    )(req, res);
  };
};

// Função para extrair o usuário do token sem bloquear a requisição
export const getUserFromToken = async (req: NextApiRequest) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findByPk(decoded.id);

    return user;
  } catch (error) {
    return null;
  }
};
