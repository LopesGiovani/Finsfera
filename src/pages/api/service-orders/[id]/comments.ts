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

// Interfaces para tipar os resultados das consultas
interface CommentRow {
  id: number;
  texto: string;
  createdAt: string;
  updatedAt: string;
  "usuario.id": number;
  "usuario.nome": string;
  "usuario.email": string;
  "usuario.cargo": string;
}

interface InsertResult {
  id: number;
}

// Handler para gerenciar comentários de uma ordem de serviço
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

    // GET - Listar comentários
    if (req.method === "GET") {
      // Criar tabela de comentários se não existir
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS service_order_comments (
          id SERIAL PRIMARY KEY,
          "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
          "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          text TEXT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Buscar comentários
      const comments = await sequelize.query<CommentRow>(
        `
        SELECT 
          soc.id, 
          soc.text as texto, 
          soc."createdAt"::text as "createdAt", 
          soc."updatedAt"::text as "updatedAt",
          u.id as "usuario.id",
          u.name as "usuario.nome",
          u.email as "usuario.email",
          u.role as "usuario.cargo"
        FROM 
          service_order_comments soc
        JOIN 
          users u ON soc."userId" = u.id
        WHERE 
          soc."serviceOrderId" = :serviceOrderId
        ORDER BY 
          soc."createdAt" DESC
      `,
        {
          replacements: { serviceOrderId },
          type: QueryTypes.SELECT,
        }
      );

      // Formatar os comentários para o formato esperado pelo frontend
      const formattedComments = comments.map((comment) => ({
        id: comment.id,
        texto: comment.texto,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        usuario: {
          id: comment["usuario.id"],
          nome: comment["usuario.nome"],
          email: comment["usuario.email"],
          cargo: comment["usuario.cargo"],
        },
      }));

      return res.status(200).json(formattedComments);
    }

    // POST - Adicionar comentário
    if (req.method === "POST") {
      const { text } = req.body;

      if (!text || typeof text !== "string" || text.trim() === "") {
        return res
          .status(400)
          .json({ message: "Texto do comentário é obrigatório" });
      }

      // Criar tabela de comentários se não existir
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS service_order_comments (
          id SERIAL PRIMARY KEY,
          "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
          "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          text TEXT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Inserir comentário
      try {
        const insertResult = await sequelize.query(
          `
          INSERT INTO service_order_comments ("serviceOrderId", "userId", text, "createdAt", "updatedAt")
          VALUES (:serviceOrderId, :userId, :text, CURRENT_TIMESTAMP AT TIME ZONE 'UTC', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
          RETURNING id
        `,
          {
            replacements: {
              serviceOrderId,
              userId: user.id,
              text,
            },
            type: QueryTypes.INSERT,
          }
        );

        // Extrair o ID do comentário inserido
        // @ts-ignore - Ignorando erros de tipo aqui, pois sabemos que o formato do resultado é [resultados, metadados]
        const commentId = insertResult[0][0].id;

        // Registrar um evento na timeline
        await TimelineEventService.registerComment({
          serviceOrderId,
          userId: user.id,
          text,
        });

        // Buscar o comentário recém-criado
        const comments = await sequelize.query<CommentRow>(
          `
          SELECT 
            soc.id, 
            soc.text as texto, 
            soc."createdAt"::text as "createdAt", 
            soc."updatedAt"::text as "updatedAt",
            u.id as "usuario.id",
            u.name as "usuario.nome",
            u.email as "usuario.email",
            u.role as "usuario.cargo"
          FROM 
            service_order_comments soc
          JOIN 
            users u ON soc."userId" = u.id
          WHERE 
            soc.id = :commentId
        `,
          {
            replacements: { commentId },
            type: QueryTypes.SELECT,
          }
        );

        // Verificar se temos um comentário válido
        if (!comments || comments.length === 0) {
          return res
            .status(500)
            .json({ message: "Erro ao recuperar o comentário criado" });
        }

        const newComment = comments[0];

        // Formatar o comentário para o formato esperado pelo frontend
        const formattedComment = {
          id: newComment.id,
          texto: newComment.texto,
          createdAt: newComment.createdAt,
          updatedAt: newComment.updatedAt,
          usuario: {
            id: newComment["usuario.id"],
            nome: newComment["usuario.nome"],
            email: newComment["usuario.email"],
            cargo: newComment["usuario.cargo"],
          },
        };

        return res.status(201).json(formattedComment);
      } catch (error) {
        console.error("Erro ao criar comentário:", error);
        return res.status(500).json({ message: "Erro ao criar comentário" });
      }
    }

    // Método não permitido
    return res.status(405).json({ message: "Método não permitido" });
  } catch (error) {
    console.error("Erro ao processar comentários:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
