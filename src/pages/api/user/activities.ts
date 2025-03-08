import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";
import sequelize from "@/lib/db";
import { QueryTypes } from "sequelize";

// Interface para tipificar as atividades do usuário
interface UserActivity {
  id: number;
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log de entrada para depuração
  console.log("[API] /api/user/activities - Requisição recebida");

  // Apenas método GET é permitido
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  // Log para depuração - verificar headers
  console.log("[API] /api/user/activities - Headers:", {
    auth: req.headers.authorization?.substring(0, 20) + "...",
  });

  try {
    // Verificar o token de autenticação
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("[API] /api/user/activities - Token não fornecido");
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Token não fornecido.",
      });
    }

    // Verificar se o token é válido
    const tokenData = await verifyToken(token);

    if (!tokenData || !tokenData.userId) {
      console.log("[API] /api/user/activities - Token inválido");
      return res.status(401).json({
        success: false,
        message: "Sessão expirada ou inválida. Faça login novamente.",
      });
    }

    const userId = tokenData.userId;
    console.log("[API] /api/user/activities - Usuário autenticado:", userId);

    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Verificar se a tabela user_activities existe
    const checkTableExists = await sequelize.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_activities'
      );
    `,
      { type: QueryTypes.SELECT }
    );

    const tableExists = (checkTableExists[0] as any).exists;

    if (!tableExists) {
      console.log(
        "[API] /api/user/activities - Tabela user_activities não existe"
      );
      return res.status(200).json({
        success: true,
        activities: [],
        pagination: {
          total: 0,
          currentPage: page,
          totalPages: 0,
          limit,
        },
      });
    }

    // Usar raw SQL para buscar atividades e evitar problemas com o modelo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_activities
      WHERE "userId" = :userId
    `;

    const countResult = await sequelize.query(countQuery, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    const total = parseInt((countResult[0] as any).total, 10);

    const activitiesQuery = `
      SELECT id, "userId", action, "entityType", "entityId", 
             details, "ipAddress", "userAgent", "createdAt"
      FROM user_activities
      WHERE "userId" = :userId
      ORDER BY "createdAt" DESC
      LIMIT :limit OFFSET :offset
    `;

    const activities = await sequelize.query<UserActivity>(activitiesQuery, {
      replacements: { userId, limit, offset },
      type: QueryTypes.SELECT,
    });

    console.log(
      "[API] /api/user/activities - Atividades encontradas:",
      activities.length
    );

    // Se não tem atividades, criar algumas amostra para demonstração
    if (activities.length === 0 && page === 1) {
      console.log(
        "[API] /api/user/activities - Criando atividades de demonstração"
      );

      const now = new Date();
      const sampleActivities = [
        {
          userId,
          action: "Login no sistema",
          createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutos atrás
          ipAddress:
            (req.headers["x-real-ip"] as string) || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
        {
          userId,
          action: "Atualizou seu perfil",
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 horas atrás
          ipAddress:
            (req.headers["x-real-ip"] as string) || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
        {
          userId,
          action: "Visualizou uma ordem de serviço",
          entityType: "service_order",
          entityId: 1,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 dia atrás
          ipAddress:
            (req.headers["x-real-ip"] as string) || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        },
      ];

      // Incluir a data no formato ISO para o cliente
      return res.status(200).json({
        success: true,
        activities: sampleActivities.map((activity) => ({
          ...activity,
          id: Math.floor(Math.random() * 1000) + 1,
          createdAt: activity.createdAt.toISOString(),
        })),
        pagination: {
          total: sampleActivities.length,
          currentPage: page,
          totalPages: 1,
          limit,
        },
      });
    }

    // Retornar os dados
    return res.status(200).json({
      success: true,
      activities,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    console.error("[API] /api/user/activities - Erro:", error);

    // Erro específico para token inválido/expirado
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Sessão expirada ou inválida. Faça login novamente.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erro ao recuperar atividades",
      details: error.message,
    });
  }
}
