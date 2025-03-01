import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Interface para estender o NextApiRequest com o usuário autenticado
export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
  organizationId?: number;
}

// Middleware para verificar se o usuário está autenticado
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // Verifica se há token nos cookies ou no header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Não autorizado, token não fornecido" });
    }

    // Verifica o token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Busca o usuário pelo ID do token
    const user = await User.findByPk(decoded.id);

    // Verifica se o usuário existe
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // Verifica se o usuário está ativo
    if (!user.active) {
      return res.status(403).json({ message: "Conta de usuário inativa" });
    }

    // Adiciona o usuário ao request para uso nas rotas protegidas
    req.user = user;

    // Se o usuário pertencer a uma organização, adiciona o ID da organização ao request
    if (user.organizationId) {
      req.organizationId = user.organizationId;
    }

    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

// Middleware para verificar se o usuário tem uma das funções (roles) permitidas
export const roleMiddleware = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Acesso negado: permissão insuficiente" });
    }

    next();
  };
};

// Middleware para verificar acesso a recursos da organização
export const organizationAccessMiddleware = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const user = req.user;

    // System admin pode acessar tudo
    if (user.role === "system_admin") {
      return next();
    }

    // Verifica se está tentando acessar dados da própria organização
    const requestedOrgId =
      parseInt(req.query.organizationId as string) ||
      parseInt(req.body.organizationId as string);

    if (requestedOrgId && user.organizationId !== requestedOrgId) {
      return res
        .status(403)
        .json({ message: "Acesso negado a esta organização" });
    }

    next();
  } catch (error) {
    console.error("Erro no middleware de organização:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Middleware para verificar acesso às ordens de serviço
export const serviceOrderAccessMiddleware = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const user = req.user;

    // System admin pode acessar tudo
    if (user.role === "system_admin") {
      return next();
    }

    // Owner e usuários com canSeeAllOS podem ver todas as OS da sua organização
    if (user.role === "owner" || user.canSeeAllOS) {
      return next();
    }

    // Para outras operações, precisa verificar se o usuário tem acesso à OS específica
    const serviceOrderId = parseInt(req.query.id as string);

    if (serviceOrderId) {
      // Verifica se o usuário é o assignedTo da OS
      const { ServiceOrder } = require("@/models/associations");
      const serviceOrder = await ServiceOrder.findOne({
        where: {
          id: serviceOrderId,
          organizationId: user.organizationId,
          assignedToId: user.id,
        },
      });

      if (!serviceOrder) {
        return res
          .status(403)
          .json({ message: "Acesso negado a esta ordem de serviço" });
      }
    }

    next();
  } catch (error) {
    console.error("Erro no middleware de acesso à OS:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export default authMiddleware;
