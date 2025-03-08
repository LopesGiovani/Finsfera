import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";
import sequelize from "@/lib/db";
import { QueryTypes } from "sequelize";

interface CountResult {
  count: string;
}

interface AvgTimeResult {
  avg_time: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log de entrada para depuração
  console.log("[API] /api/user/stats - Requisição recebida");

  // Apenas método GET é permitido
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  // Log para depuração - verificar headers
  console.log("[API] /api/user/stats - Headers:", {
    auth: req.headers.authorization?.substring(0, 20) + "...",
  });

  try {
    // Verificar o token de autenticação
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("[API] /api/user/stats - Token não fornecido");
      return res.status(401).json({
        success: false,
        message: "Não autorizado. Token não fornecido.",
      });
    }

    // Verifica se o token é válido
    const tokenData = await verifyToken(token);

    if (!tokenData || !tokenData.userId) {
      console.log("[API] /api/user/stats - Token inválido");
      return res.status(401).json({
        success: false,
        message: "Sessão expirada ou inválida. Faça login novamente.",
      });
    }

    const userId = tokenData.userId;
    console.log("[API] /api/user/stats - Usuário autenticado:", userId);

    // Consulta 1: Quantidade de OS criadas pelo usuário (usando createdBy se existir, ou userId)
    let osCreatedResult;
    try {
      // Primeiro, vamos verificar quais colunas existem na tabela
      const describeResult = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'service_orders'`,
        { type: QueryTypes.SELECT }
      );

      const columns = describeResult.map((row: any) => row.column_name);
      console.log("[API] /api/user/stats - Colunas disponíveis:", columns);

      // Decidir qual consulta usar baseada nas colunas existentes
      if (columns.includes("created_by")) {
        osCreatedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(id)::text as count FROM service_orders WHERE created_by = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else if (columns.includes("createdby")) {
        osCreatedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(id)::text as count FROM service_orders WHERE createdby = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else if (columns.includes("assignedbyuserid")) {
        osCreatedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(id)::text as count FROM service_orders WHERE assignedbyuserid = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else {
        // Fallback para caso nenhuma coluna específica exista
        osCreatedResult = [{ count: "0" }];
      }
    } catch (error) {
      console.error(
        "[API] /api/user/stats - Erro na consulta de OS criadas:",
        error
      );
      osCreatedResult = [{ count: "0" }];
    }

    // Consulta 2: Quantidade de OS finalizadas pelo usuário
    let osCompletedResult;
    try {
      // Verificar se existe a coluna assigned_to ou alternativas
      const describeResult = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'service_orders'`,
        { type: QueryTypes.SELECT }
      );

      const columns = describeResult.map((row: any) => row.column_name);

      if (columns.includes("assigned_to")) {
        osCompletedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(id)::text as count FROM service_orders 
           WHERE status = 'completed' AND assigned_to = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else if (columns.includes("assignedto")) {
        osCompletedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(id)::text as count FROM service_orders 
           WHERE status = 'completed' AND assignedto = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else if (columns.includes("assignedtoid")) {
        osCompletedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(id)::text as count FROM service_orders 
           WHERE (status = 'completed' OR status = 'concluida' OR status = 'encerrada') 
           AND assignedtoid = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else {
        // Fallback
        osCompletedResult = [{ count: "0" }];
      }
    } catch (error) {
      console.error(
        "[API] /api/user/stats - Erro na consulta de OS completas:",
        error
      );
      osCompletedResult = [{ count: "0" }];
    }

    // Consulta 3: Quantidade de clientes atendidos (únicos)
    let customersServedResult;
    try {
      // Verificar campos de cliente e usuário na tabela
      const describeResult = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'service_orders'`,
        { type: QueryTypes.SELECT }
      );

      const columns = describeResult.map((row: any) => row.column_name);

      if (columns.includes("customer_id") && columns.includes("assigned_to")) {
        customersServedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(DISTINCT customer_id)::text as count 
           FROM service_orders 
           WHERE assigned_to = :userId AND status = 'completed'`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else if (
        columns.includes("customerid") &&
        columns.includes("assignedtoid")
      ) {
        customersServedResult = await sequelize.query<CountResult>(
          `SELECT COUNT(DISTINCT customerid)::text as count 
           FROM service_orders 
           WHERE assignedtoid = :userId 
           AND (status = 'completed' OR status = 'concluida' OR status = 'encerrada')`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else {
        // Fallback
        customersServedResult = [{ count: "0" }];
      }
    } catch (error) {
      console.error(
        "[API] /api/user/stats - Erro na consulta de clientes:",
        error
      );
      customersServedResult = [{ count: "0" }];
    }

    // Consulta 4: Tempo médio para conclusão em horas
    let avgTimeResult;
    try {
      // Verificar campos de data e usuário na tabela
      const describeResult = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'service_orders'`,
        { type: QueryTypes.SELECT }
      );

      const columns = describeResult.map((row: any) => row.column_name);

      if (
        columns.includes("completed_at") &&
        columns.includes("created_at") &&
        columns.includes("assigned_to")
      ) {
        avgTimeResult = await sequelize.query<AvgTimeResult>(
          `SELECT COALESCE(
            ROUND(
              AVG(
                EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600
              )::numeric, 
              1
            )::text, 
            '0.0'
          ) as avg_time 
          FROM service_orders 
          WHERE status = 'completed' AND assigned_to = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else if (
        columns.includes("closedat") &&
        columns.includes("createdat") &&
        columns.includes("assignedtoid")
      ) {
        avgTimeResult = await sequelize.query<AvgTimeResult>(
          `SELECT COALESCE(
            ROUND(
              AVG(
                EXTRACT(EPOCH FROM (closedat - createdat)) / 3600
              )::numeric, 
              1
            )::text, 
            '0.0'
          ) as avg_time 
          FROM service_orders 
          WHERE (status = 'completed' OR status = 'concluida' OR status = 'encerrada') 
          AND assignedtoid = :userId`,
          {
            replacements: { userId },
            type: QueryTypes.SELECT,
          }
        );
      } else {
        // Fallback
        avgTimeResult = [{ avg_time: "0.0" }];
      }
    } catch (error) {
      console.error(
        "[API] /api/user/stats - Erro na consulta de tempo médio:",
        error
      );
      avgTimeResult = [{ avg_time: "0.0" }];
    }

    // Montar o objeto de resposta
    const stats = {
      osCreated: parseInt(osCreatedResult[0]?.count || "0", 10),
      osCompleted: parseInt(osCompletedResult[0]?.count || "0", 10),
      customersServed: parseInt(customersServedResult[0]?.count || "0", 10),
      avgCompletionTime: avgTimeResult[0]?.avg_time || "0.0",
    };

    console.log("[API] /api/user/stats - Estatísticas recuperadas:", stats);

    // Retornar os dados
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error("[API] /api/user/stats - Erro:", error);

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
      message: "Erro ao recuperar estatísticas",
      details: error.message,
    });
  }
}
