import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";
import sequelize from "@/lib/db";
import { QueryTypes } from "sequelize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log de entrada para depuração
  console.log("[API] /api/user/log-activity - Requisição recebida");

  // Apenas método POST é permitido
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  try {
    // Verificar o token de autenticação
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Token não fornecido.",
      });
    }

    // Verificar se o token é válido
    const tokenData = await verifyToken(token);

    if (!tokenData || !tokenData.userId) {
      return res.status(401).json({
        success: false,
        message: "Sessão expirada ou inválida. Faça login novamente.",
      });
    }

    // Extrair dados do corpo da requisição
    const { action, entityType, entityId, details } = req.body;

    // Validar dados obrigatórios
    if (!action) {
      return res.status(400).json({
        success: false,
        message: "O campo 'action' é obrigatório",
      });
    }

    // Verificar se a tabela existe
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

    // Se a tabela não existir, criar
    if (!tableExists) {
      console.log(
        "[API] /api/user/log-activity - Criando tabela user_activities"
      );
      await sequelize.query(`
        CREATE TABLE user_activities (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL,
          action TEXT NOT NULL,
          "entityType" TEXT,
          "entityId" INTEGER,
          details JSONB,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }

    // Obter informações do cliente
    const ipAddress =
      (req.headers["x-real-ip"] as string) || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Registrar atividade usando SQL direto
    const insertQuery = `
      INSERT INTO user_activities (
        "userId", action, "entityType", "entityId", details, "ipAddress", "userAgent", "createdAt", "updatedAt"
      ) VALUES (
        :userId, :action, :entityType, :entityId, :details, :ipAddress, :userAgent, NOW(), NOW()
      ) RETURNING id;
    `;

    const insertResult = await sequelize.query(insertQuery, {
      replacements: {
        userId: tokenData.userId,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
      type: QueryTypes.INSERT,
    });

    const activityId = insertResult[0];

    return res.status(201).json({
      success: true,
      message: "Atividade registrada com sucesso",
      activityId,
    });
  } catch (error: any) {
    console.error("[API] /api/user/log-activity - Erro:", error);

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
      message: "Erro ao registrar atividade",
      details: error.message,
    });
  }
}
