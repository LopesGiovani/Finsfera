/**
 * Script para atualizar o banco de dados sem perder os dados existentes
 * Este script atualiza a estrutura das tabelas conforme necessário
 */
const { Sequelize, DataTypes } = require("sequelize");

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

// Função para verificar se uma coluna existe em uma tabela
async function columnExists(tableName, columnName) {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ? AND column_name = ?;
    `;
    const [results] = await sequelize.query(query, {
      replacements: [tableName, columnName],
      type: Sequelize.QueryTypes.SELECT,
    });
    return !!results;
  } catch (error) {
    console.error(`Erro ao verificar se a coluna ${columnName} existe:`, error);
    return false;
  }
}

// Função para verificar se uma tabela existe
async function tableExists(tableName) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ?
      );
    `;
    const [result] = await sequelize.query(query, {
      replacements: [tableName],
      type: Sequelize.QueryTypes.SELECT,
    });
    return result.exists;
  } catch (error) {
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
    return false;
  }
}

// Função para adicionar uma coluna se ela não existir
async function addColumnIfNotExists(tableName, columnName, dataType) {
  const exists = await columnExists(tableName, columnName);
  if (!exists) {
    try {
      console.log(`Adicionando coluna ${columnName} à tabela ${tableName}...`);
      await sequelize.query(
        `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${dataType};`
      );
      console.log(`Coluna ${columnName} adicionada com sucesso!`);
    } catch (error) {
      console.error(
        `Erro ao adicionar coluna ${columnName} à tabela ${tableName}:`,
        error
      );
    }
  } else {
    console.log(
      `Coluna ${columnName} já existe na tabela ${tableName}, ignorando.`
    );
  }
}

// Função para criar uma tabela se ela não existir
async function createTableIfNotExists(tableName, createTableSQL) {
  const exists = await tableExists(tableName);
  if (!exists) {
    try {
      console.log(`Criando tabela ${tableName}...`);
      await sequelize.query(createTableSQL);
      console.log(`Tabela ${tableName} criada com sucesso!`);
    } catch (error) {
      console.error(`Erro ao criar tabela ${tableName}:`, error);
    }
  } else {
    console.log(`Tabela ${tableName} já existe, ignorando.`);
  }
}

// Função para criar um ENUM se não existir
async function createEnumIfNotExists(enumName, values) {
  try {
    // Verifica se o tipo enum já existe
    const checkEnumQuery = `
      SELECT typname FROM pg_type 
      WHERE typname = ?;
    `;
    const enumExists = await sequelize.query(checkEnumQuery, {
      replacements: [enumName],
      type: Sequelize.QueryTypes.SELECT,
    });

    if (enumExists.length === 0) {
      console.log(`Criando tipo ENUM ${enumName}...`);
      const createEnumQuery = `CREATE TYPE "${enumName}" AS ENUM (${values
        .map((v) => `'${v}'`)
        .join(", ")});`;
      await sequelize.query(createEnumQuery);
      console.log(`Tipo ENUM ${enumName} criado com sucesso!`);
    } else {
      console.log(`Tipo ENUM ${enumName} já existe, verificando valores...`);

      // Verifica se é necessário adicionar novos valores ao enum
      const getEnumValuesQuery = `
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = ?);
      `;
      const existingValues = await sequelize.query(getEnumValuesQuery, {
        replacements: [enumName],
        type: Sequelize.QueryTypes.SELECT,
      });

      const existingLabels = existingValues.map((v) => v.enumlabel);
      const missingValues = values.filter((v) => !existingLabels.includes(v));

      if (missingValues.length > 0) {
        console.log(
          `Adicionando novos valores ao ENUM ${enumName}: ${missingValues.join(
            ", "
          )}`
        );
        for (const value of missingValues) {
          await sequelize.query(
            `ALTER TYPE "${enumName}" ADD VALUE '${value}';`
          );
        }
        console.log(`Valores adicionados ao ENUM ${enumName}`);
      }
    }
  } catch (error) {
    console.error(`Erro ao criar/atualizar ENUM ${enumName}:`, error);
  }
}

// Função para atualizar o banco de dados
async function updateDB() {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Verifica ENUMs necessários
    await createEnumIfNotExists("enum_users_role", [
      "system_admin",
      "owner",
      "manager",
      "technician",
      "assistant",
    ]);

    await createEnumIfNotExists("enum_service_orders_status", [
      "pendente",
      "em_andamento",
      "concluida",
      "reprovada",
    ]);

    await createEnumIfNotExists("enum_service_orders_priority", [
      "baixa",
      "media",
      "alta",
      "urgente",
    ]);

    // Criar ENUM para planos de cliente
    await createEnumIfNotExists("enum_customers_plan", [
      "prata",
      "ouro",
      "vip",
    ]);

    // Verifica e atualiza a tabela users
    await addColumnIfNotExists(
      "users",
      "canSeeAllOS",
      "BOOLEAN NOT NULL DEFAULT false"
    );

    await addColumnIfNotExists(
      "users",
      "active",
      "BOOLEAN NOT NULL DEFAULT true"
    );

    // Verifica e atualiza a tabela service_orders
    await addColumnIfNotExists("service_orders", "closingLink", "VARCHAR(255)");

    await addColumnIfNotExists("service_orders", "rejectionReason", "TEXT");

    await addColumnIfNotExists("service_orders", "leaveOpenReason", "TEXT");

    await addColumnIfNotExists("service_orders", "transferHistory", "JSON");

    await addColumnIfNotExists(
      "service_orders",
      "closedAt",
      "TIMESTAMP WITH TIME ZONE"
    );

    // Adiciona a coluna value na tabela service_orders
    await addColumnIfNotExists(
      "service_orders",
      "value",
      "DECIMAL(10,2) DEFAULT NULL"
    );  

    // Cria ou atualiza a tabela customers
    const customersTableExists = await tableExists("customers");

    if (!customersTableExists) {
      // Criar a tabela se não existir
      const createCustomersTableSQL = `
        CREATE TABLE customers (
          id SERIAL PRIMARY KEY,
          "organizationId" INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          document VARCHAR(30) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(30) NOT NULL,
          address VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(2) NOT NULL,
          "zipCode" VARCHAR(10) NOT NULL,
          "contactPerson" VARCHAR(255),
          notes TEXT,
          plan enum_customers_plan NOT NULL DEFAULT 'prata',
          active BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP WITH TIME ZONE,
          "updatedAt" TIMESTAMP WITH TIME ZONE
        );
      `;
      await createTableIfNotExists("customers", createCustomersTableSQL);
    } else {
      // Se a tabela já existir, verifica se o campo plan existe
      await addColumnIfNotExists(
        "customers",
        "plan",
        "enum_customers_plan NOT NULL DEFAULT 'prata'"
      );
    }

    // Inserir ordens de serviço de exemplo
    // Verificar se já existem ordens de serviço
    const osCount = await sequelize.query(
      "SELECT COUNT(*) FROM service_orders;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Limpar ordens de serviço existentes e criar novas
    if (parseInt(osCount[0].count) > 0) {
      console.log("Limpando ordens de serviço existentes...");
      await sequelize.query("DELETE FROM service_orders;");
      console.log("Ordens de serviço removidas com sucesso.");
    }

    // Obter usuários para vincular às ordens de serviço
    const users = await sequelize.query(
      "SELECT id, \"organizationId\" FROM users WHERE role IN ('technician', 'manager') LIMIT 5;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Obter clientes para vincular às ordens de serviço
    const customers = await sequelize.query(
      "SELECT id, \"organizationId\" FROM customers LIMIT 5;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0 && customers.length > 0) {
      console.log("Criando novas ordens de serviço...");
      
      // Criar ordens de serviço para cada cliente
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        const user = users[i % users.length];
        const manager = users[(i + 1) % users.length];
        
        // Criar 2 ordens de serviço por cliente com valores variados
        for (let j = 0; j < 2; j++) {
          const today = new Date();
          const scheduledDate = new Date();
          scheduledDate.setDate(today.getDate() + (j + 1) * 15); // Datas espaçadas a cada 15 dias
          
          const priority = j % 2 === 0 ? "media" : "urgente";
          const value = (j + 1) * 150.75; // Valores variados
          
          await sequelize.query(`
            INSERT INTO service_orders (
              "organizationId", title, description, status, priority, 
              "assignedToId", "assignedByUserId", "scheduledDate", 
              "customerId", value, "createdAt", "updatedAt"
            ) VALUES (
              ${customer.organizationId},
              'Manutenção ${j === 0 ? 'Preventiva' : 'Corretiva'} #${i * 2 + j + 1}',
              'Descrição detalhada do serviço a ser realizado. Cliente: ${i + 1}, Ordem: ${j + 1}',
              'pendente',
              '${priority}',
              ${user.id},
              ${manager.id},
              '${scheduledDate.toISOString()}',
              ${customer.id},
              ${value},
              NOW(),
              NOW()
            );
          `);
        }
      }
      
      console.log("Ordens de serviço criadas com sucesso!");
    } else {
      console.log("Não foi possível criar ordens de serviço: não há usuários ou clientes suficientes.");
    }

    console.log("Banco de dados atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar o banco de dados:", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executa a função de atualização
updateDB();
