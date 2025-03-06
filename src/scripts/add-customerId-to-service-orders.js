"use strict";

const { Sequelize } = require("sequelize");

// URL de conexão com o banco de dados
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/production?sslmode=require";

// Inicializa o Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  logging: console.log,
});

async function addCustomerIdToServiceOrders() {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Verificar se o campo já existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'service_orders' AND column_name = 'customerId';
    `;
    
    const columns = await sequelize.query(checkColumnQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (columns.length > 0) {
      console.log("Coluna customerId já existe na tabela service_orders!");
      return;
    }

    // Adicionar a coluna customerId
    await sequelize.query(`
      ALTER TABLE service_orders 
      ADD COLUMN "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL;
    `);

    console.log("Coluna customerId adicionada com sucesso à tabela service_orders!");
  } catch (error) {
    console.error("Erro ao adicionar coluna customerId:", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executa a função
addCustomerIdToServiceOrders(); 