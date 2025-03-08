import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../models/User";
import { generateToken } from "../../../utils/auth";
import bcrypt from "bcryptjs";
import sequelize from "@/lib/db";
import { QueryTypes } from "sequelize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log de entrada para depuração
  console.log("[API] /api/auth/login - Requisição recebida");

  // Apenas POST é permitido
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido",
    });
  }

  try {
    // Obter dados do corpo da requisição
    const { email, password } = req.body;

    // Validar presença de email e senha
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      });
    }

    // Buscar usuário pelo email
    const user = await User.findOne({ where: { email } });

    // Verificar se o usuário existe
    if (!user) {
      // Log para depuração
      console.log(
        `[API] /api/auth/login - Usuário com email ${email} não encontrado`
      );

      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Log para depuração
      console.log(`[API] /api/auth/login - Senha inválida para ${email}`);

      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Verificar se o usuário está ativo
    if (user.active === false) {
      // Log para depuração
      console.log(`[API] /api/auth/login - Usuário ${email} está inativo`);

      return res.status(403).json({
        success: false,
        message: "Usuário desativado. Entre em contato com o administrador.",
      });
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Verificar se a tabela user_activities existe e, se não, criar
    try {
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
        console.log("[API] /api/auth/login - Criando tabela user_activities");
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

      // Registrar atividade de login usando SQL direto
      await sequelize.query(
        `
        INSERT INTO user_activities (
          "userId", action, "ipAddress", "userAgent", "createdAt", "updatedAt"
        ) VALUES (
          :userId, 'Login no sistema', :ipAddress, :userAgent, NOW(), NOW()
        );
      `,
        {
          replacements: {
            userId: user.id,
            ipAddress:
              (req.headers["x-real-ip"] as string) || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"] || "",
          },
          type: QueryTypes.INSERT,
        }
      );

      console.log(
        `[API] /api/auth/login - Atividade de login registrada para usuário ${user.id}`
      );
    } catch (activityError) {
      // Apenas log do erro, não impede o login
      console.error(
        "[API] /api/auth/login - Erro ao registrar atividade:",
        activityError
      );
    }

    // Log para depuração após login bem-sucedido
    console.log(
      `[API] /api/auth/login - Login bem-sucedido para ${email} (ID: ${user.id})`
    );

    // Retornar dados do usuário e token
    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        canSeeAllOS: user.canSeeAllOS,
      },
      token,
    });
  } catch (error: any) {
    // Log de erro para depuração
    console.error("[API] /api/auth/login - Erro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      details: error.message,
    });
  }
}
