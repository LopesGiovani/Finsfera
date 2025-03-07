import { NextApiRequest, NextApiResponse } from "next";
import {
  authMiddleware,
  organizationAccessMiddleware,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
// Importar os modelos pelo arquivo de inicialização para garantir que as associações sejam carregadas
import { ServiceOrder, User } from "@/pages/api/_app-init";
import sequelize from "@/lib/db";
import { QueryTypes } from "sequelize";
import { TimelineEventService } from "@/services/timelineEventService";

// Interface para tipar o resultado da consulta SQL
interface TimeEntryRow {
  id: number;
  horas: number;
  minutos: number;
  descricao: string;
  createdAt: string;
  updatedAt: string;
  "usuario.id": number;
  "usuario.nome": string;
}

// Handler para gerenciar registros de tempo de uma ordem de serviço
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Middleware de autenticação
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req as AuthenticatedRequest, res, () => resolve());
    });

    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user;

    // Verificar se o usuário tem permissão (precisa ser pelo menos assistant)
    if (!user || !user.active) {
      return res
        .status(403)
        .json({ message: "Acesso negado: usuário inativo ou não autenticado" });
    }

    // Middleware de acesso à organização
    await new Promise<void>((resolve, reject) => {
      organizationAccessMiddleware(authenticatedReq, res, () => resolve());
    });

    // Obter ID da ordem de serviço da URL
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const serviceOrderId = parseInt(id);

    // Buscar a ordem de serviço para verificar se existe
    const serviceOrder = await ServiceOrder.findByPk(serviceOrderId);

    if (!serviceOrder) {
      return res
        .status(404)
        .json({ message: "Ordem de serviço não encontrada" });
    }

    // GET - Listar registros de tempo
    if (req.method === "GET") {
      // Criar tabela de registros de tempo se não existir
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS service_order_time_entries (
          id SERIAL PRIMARY KEY,
          "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
          "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          hours INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          description TEXT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Buscar registros de tempo
      const timeEntries = await sequelize.query<TimeEntryRow>(
        `
        SELECT 
          sote.id, 
          sote.hours as horas, 
          sote.minutes as minutos,
          sote.description as descricao,
          sote."createdAt"::text as "createdAt", 
          sote."updatedAt"::text as "updatedAt",
          u.id as "usuario.id",
          u.name as "usuario.nome"
        FROM 
          service_order_time_entries sote
        JOIN 
          users u ON sote."userId" = u.id
        WHERE 
          sote."serviceOrderId" = :serviceOrderId
        ORDER BY 
          sote."createdAt" DESC
      `,
        {
          replacements: { serviceOrderId },
          type: QueryTypes.SELECT,
        }
      );

      return res.status(200).json(timeEntries);
    }

    // POST - Adicionar registro de tempo
    if (req.method === "POST") {
      const { horas, minutos, descricao } = req.body;

      // Validar dados
      if (horas === undefined || minutos === undefined || !descricao) {
        return res.status(400).json({ message: "Dados incompletos" });
      }

      // Criar tabela de registros de tempo se não existir
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS service_order_time_entries (
          id SERIAL PRIMARY KEY,
          "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
          "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          hours INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          description TEXT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Inserir registro de tempo
      try {
        const insertResult = await sequelize.query(
          `
          INSERT INTO service_order_time_entries ("serviceOrderId", "userId", hours, minutes, description, "createdAt", "updatedAt")
          VALUES (:serviceOrderId, :userId, :hours, :minutes, :description, CURRENT_TIMESTAMP AT TIME ZONE 'UTC', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
          RETURNING id
        `,
          {
            replacements: {
              serviceOrderId,
              userId: user.id,
              hours: horas,
              minutes: minutos,
              description: descricao,
            },
            type: QueryTypes.INSERT,
          }
        );

        // Extrair o ID do registro inserido
        // @ts-ignore - Ignorando erros de tipo aqui, pois sabemos que o formato do resultado é [resultados, metadados]
        const timeEntryId = insertResult[0][0].id;

        // Registrar evento na timeline
        await TimelineEventService.registerTimeLog({
          serviceOrderId,
          userId: user.id,
          hours: horas,
          minutes: minutos,
          description: descricao,
        });

        // Buscar o registro recém-criado
        const timeEntries = await sequelize.query<TimeEntryRow>(
          `
          SELECT 
            sote.id, 
            sote.hours as horas, 
            sote.minutes as minutos,
            sote.description as descricao,
            sote."createdAt"::text as "createdAt", 
            sote."updatedAt"::text as "updatedAt",
            u.id as "usuario.id",
            u.name as "usuario.nome"
          FROM 
            service_order_time_entries sote
          JOIN 
            users u ON sote."userId" = u.id
          WHERE 
            sote.id = :timeEntryId
        `,
          {
            replacements: { timeEntryId },
            type: QueryTypes.SELECT,
          }
        );

        if (!timeEntries || timeEntries.length === 0) {
          return res
            .status(500)
            .json({ message: "Erro ao recuperar o registro de tempo criado" });
        }

        const newTimeEntry = timeEntries[0];

        // Formatar o registro para o formato esperado pelo frontend
        const formattedTimeEntry = {
          id: newTimeEntry.id,
          horas: newTimeEntry.horas,
          minutos: newTimeEntry.minutos,
          descricao: newTimeEntry.descricao,
          createdAt: newTimeEntry.createdAt,
          updatedAt: newTimeEntry.updatedAt,
          usuario: {
            id: newTimeEntry["usuario.id"],
            nome: newTimeEntry["usuario.nome"],
          },
        };

        return res.status(201).json(formattedTimeEntry);
      } catch (error) {
        console.error("Erro ao criar registro de tempo:", error);
        return res
          .status(500)
          .json({ message: "Erro ao criar registro de tempo" });
      }
    }

    // Método não permitido
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro ao processar registros de tempo:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
