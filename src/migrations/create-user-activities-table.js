"use strict";
const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log("Criando tabela user_activities...");

    try {
      // Verificar se a tabela já existe de maneira mais simplificada
      // Aqui usamos um método mais simples: tentamos criar e capturamos o erro se a tabela já existir
      try {
        // Criar a tabela user_activities
        await queryInterface.createTable("user_activities", {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: "users",
              key: "id",
            },
            onDelete: "CASCADE",
          },
          action: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          entityType: {
            type: DataTypes.STRING(50),
            allowNull: true,
          },
          entityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          details: {
            type: DataTypes.JSONB,
            allowNull: true,
          },
          ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
          },
          userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          createdAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.fn("NOW"),
          },
        });

        console.log("Tabela user_activities criada com sucesso!");

        // Adicionar índices
        console.log("Criando índices para a tabela user_activities...");

        await queryInterface.addIndex("user_activities", ["userId"], {
          name: "idx_user_activities_user_id",
        });

        await queryInterface.addIndex("user_activities", ["createdAt"], {
          name: "idx_user_activities_created_at",
        });

        await queryInterface.addIndex(
          "user_activities",
          ["entityType", "entityId"],
          {
            name: "idx_user_activities_entity",
          }
        );

        console.log("Índices criados com sucesso!");
      } catch (tableError) {
        // Se o erro for devido à tabela já existir, apenas ignoramos
        if (
          tableError.name === "SequelizeUniqueConstraintError" ||
          (tableError.name === "SequelizeDatabaseError" &&
            tableError.message.includes("already exists"))
        ) {
          console.log("Tabela user_activities já existe. Pulando criação.");
        } else {
          // Se for outro tipo de erro, propagamos
          throw tableError;
        }
      }
    } catch (error) {
      console.error("Erro ao criar tabela user_activities:", error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      console.log("Removendo tabela user_activities...");
      await queryInterface.dropTable("user_activities");
      console.log("Tabela user_activities removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover tabela user_activities:", error);
      throw error;
    }
  },
};
