"use strict";
const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log("Adicionando coluna customerId à tabela service_orders...");

      // Abordagem simplificada: tenta adicionar a coluna e captura o erro se ela já existir
      try {
        // Adicionar a coluna
        await queryInterface.addColumn("service_orders", "customerId", {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "customers",
            key: "id",
          },
          onDelete: "SET NULL",
        });

        console.log("Coluna customerId adicionada com sucesso!");
      } catch (columnError) {
        // Se o erro for devido à coluna já existir, apenas ignoramos
        if (
          columnError.name === "SequelizeUniqueConstraintError" ||
          (columnError.name === "SequelizeDatabaseError" &&
            (columnError.message.includes("already exists") ||
              columnError.message.includes("duplicate column")))
        ) {
          console.log(
            "Coluna customerId já existe na tabela service_orders. Pulando."
          );
        } else {
          // Se for outro tipo de erro, propagamos
          throw columnError;
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar coluna customerId:", error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      console.log("Removendo coluna customerId da tabela service_orders...");
      await queryInterface.removeColumn("service_orders", "customerId");
      console.log("Coluna customerId removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover coluna customerId:", error);
      throw error;
    }
  },
};
