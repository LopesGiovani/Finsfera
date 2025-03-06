/**
 * Script para adicionar novas colunas à tabela customers
 * Este script adiciona: mobile, company, street, number, complement, district
 * e atualiza a estrutura da tabela para o novo formato de endereço
 */
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

async function addCustomerColumns() {
  try {
    console.log("Conectando ao banco de dados...");
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Verificar se a coluna 'address' existe
    const checkAddressColumn = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'address';
    `);

    const addressExists = checkAddressColumn[0].length > 0;

    if (addressExists) {
      console.log("Coluna 'address' encontrada. Iniciando migração...");

      // Adicionar novas colunas
      const columnsToAdd = [
        { name: 'mobile', type: 'VARCHAR(30)' },
        { name: 'company', type: 'VARCHAR(255)' },
        { name: 'street', type: 'VARCHAR(255)' },
        { name: 'number', type: 'VARCHAR(20)' },
        { name: 'complement', type: 'VARCHAR(255)' },
        { name: 'district', type: 'VARCHAR(100)' }
      ];

      for (const column of columnsToAdd) {
        try {
          // Verificar se a coluna já existe
          const checkColumn = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'customers' AND column_name = '${column.name}';
          `);

          if (checkColumn[0].length === 0) {
            // Adicionar a coluna
            await sequelize.query(`
              ALTER TABLE customers 
              ADD COLUMN "${column.name}" ${column.type};
            `);
            console.log(`Coluna '${column.name}' adicionada com sucesso.`);
          } else {
            console.log(`Coluna '${column.name}' já existe. Ignorando.`);
          }
        } catch (error) {
          console.error(`Erro ao adicionar coluna '${column.name}':`, error);
        }
      }

      // Migrar dados da coluna 'address' para as novas colunas
      console.log("Migrando dados de endereço...");
      
      // Obter todos os clientes
      const customers = await sequelize.query(`
        SELECT id, address FROM customers;
      `);

      // Para cada cliente, atualizar as novas colunas com base no endereço existente
      for (const customer of customers[0]) {
        if (customer.address) {
          await sequelize.query(`
            UPDATE customers 
            SET 
              street = '${customer.address.replace(/'/g, "''")}',
              number = 'S/N',
              district = 'Centro'
            WHERE id = ${customer.id};
          `);
        }
      }
      
      console.log("Migração de dados concluída.");
    } else {
      console.log("Coluna 'address' não encontrada. As novas colunas já devem existir.");
    }

    console.log("Processo de migração concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante a migração:", error);
  } finally {
    await sequelize.close();
  }
}

// Executar a função
addCustomerColumns()
  .then(() => {
    console.log("Script finalizado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro ao executar o script:", error);
    process.exit(1);
  }); 