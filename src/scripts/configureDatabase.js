/**
 * Script unificado para configuração e atualização completa do banco de dados
 *
 * Este script consolida todas as operações de banco de dados:
 * - Inicialização do banco de dados (criação de tabelas, ENUMs, etc.)
 * - Verificação e adição de colunas em tabelas existentes
 * - Criação da tabela de eventos de timeline
 * - Atualização de ENUMs e outros objetos do banco
 * - Manutenção e ajustes em dados existentes
 */

// Importar dependências
require("dotenv").config();
const { Sequelize, DataTypes, Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const pg = require("pg");

// Registrar o driver PostgreSQL explicitamente
pg.defaults.parseInt8 = true;

// Construir a URL de conexão a partir das variáveis individuais
const PGHOST =
  process.env.PGHOST || "ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech";
const PGDATABASE = process.env.PGDATABASE || "staging";
const PGUSER = process.env.PGUSER || "neondb_owner";
const PGPASSWORD = process.env.PGPASSWORD || "npg_UXBQzj8cEv6h";
const DATABASE_URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`;

// Log para debug
console.log(`Configurando banco de dados: ${PGHOST} (${PGDATABASE})`);

// Inicializa o Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectModule: pg,
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
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType};`
      );
      console.log(`Coluna ${columnName} adicionada com sucesso!`);
      return true;
    } catch (error) {
      console.error(
        `Erro ao adicionar coluna ${columnName} à tabela ${tableName}:`,
        error
      );
      return false;
    }
  } else {
    console.log(
      `Coluna ${columnName} já existe na tabela ${tableName}, ignorando.`
    );
    return false;
  }
}

// Função para criar um ENUM se não existir
async function createEnumIfNotExists(enumName, values) {
  try {
    // Verifica se o tipo enum já existe
    const checkEnumQuery = `SELECT typname FROM pg_type WHERE typname = ?;`;
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
      return true;
    } else {
      console.log(`Tipo ENUM ${enumName} já existe, ignorando.`);
      return false;
    }
  } catch (error) {
    console.error(`Erro ao criar tipo ENUM ${enumName}:`, error);
    return false;
  }
}

// Função para criar tabela se não existir
async function createTableIfNotExists(tableName, createTableSQL) {
  try {
    const exists = await tableExists(tableName);
    if (!exists) {
      console.log(`Criando tabela ${tableName}...`);
      await sequelize.query(createTableSQL);
      console.log(`Tabela ${tableName} criada com sucesso!`);
      return true;
    } else {
      console.log(`Tabela ${tableName} já existe, ignorando.`);
      return false;
    }
  } catch (error) {
    console.error(`Erro ao criar tabela ${tableName}:`, error);
    return false;
  }
}

// Função para criar a tabela de eventos de timeline
async function createTimelineEventsTable() {
  try {
    // Verificar se a tabela já existe
    const exists = await tableExists("timeline_events");

    if (exists) {
      console.log("A tabela timeline_events já existe, ignorando.");
      return;
    }

    console.log("Criando tabela timeline_events...");

    // Criar a tabela
    await sequelize.query(`
      CREATE TABLE timeline_events (
        id SERIAL PRIMARY KEY,
        "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        "eventType" VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Criar índices para melhorar a performance
    await sequelize.query(`
      CREATE INDEX idx_timeline_events_service_order_id ON timeline_events ("serviceOrderId");
      CREATE INDEX idx_timeline_events_user_id ON timeline_events ("userId");
      CREATE INDEX idx_timeline_events_event_type ON timeline_events ("eventType");
    `);

    console.log("Tabela timeline_events criada com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tabela timeline_events:", error);
  }
}

// Função para atualizar o ENUM de prioridade
async function updatePriorityEnum() {
  try {
    console.log("Atualizando ENUM de prioridade...");

    // Primeiro vamos atualizar todos os registros que têm prioridade "media" para "baixa"
    await sequelize.query(`
      UPDATE service_orders 
      SET priority = 'baixa' 
      WHERE priority = 'media'
    `);

    console.log("Valores de prioridade 'media' convertidos para 'baixa'");

    // Verificar se o tipo ENUM existe
    const enumExists = await sequelize.query(
      `
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'enum_service_orders_priority'
      );
    `,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (enumExists[0].exists) {
      console.log(
        "ENUM de prioridade atualizado: todas as entradas 'media' foram convertidas para 'baixa'"
      );
      console.log(
        "Para remover completamente a opção 'media' do ENUM, execute as seguintes consultas SQL manualmente:"
      );
      console.log(`
        -- Execute estas consultas manualmente no seu cliente SQL:
        
        -- 1. Criar novo tipo ENUM sem a opção 'media'
        CREATE TYPE enum_service_orders_priority_new AS ENUM ('baixa', 'alta', 'urgente');
        
        -- 2. Criar coluna temporária com o novo tipo
        ALTER TABLE service_orders ADD COLUMN priority_new enum_service_orders_priority_new;
        
        -- 3. Copiar valores para a nova coluna
        UPDATE service_orders SET priority_new = priority::text::enum_service_orders_priority_new;
        
        -- 4. Remover coluna antiga
        ALTER TABLE service_orders DROP COLUMN priority;
        
        -- 5. Renomear nova coluna
        ALTER TABLE service_orders RENAME COLUMN priority_new TO priority;
        
        -- 6. Remover tipo ENUM antigo (opcional)
        DROP TYPE enum_service_orders_priority;
      `);
    }

    console.log("Atualização de valores de prioridade concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar ENUM de prioridade:", error);
  }
}

// Função para criar ENUMs necessários
async function createENUMs() {
  try {
    console.log("Criando tipos ENUM...");

    // Criar ENUM para papéis de usuário
    await createEnumIfNotExists("enum_users_role", [
      "system_admin",
      "owner",
      "manager",
      "technician",
      "assistant",
    ]);

    // Criar ENUM para status de ordens de serviço
    await createEnumIfNotExists("enum_service_orders_status", [
      "pendente",
      "em_andamento",
      "concluida",
      "reprovada",
    ]);

    // Criar ENUM para prioridade de ordens de serviço
    await createEnumIfNotExists("enum_service_orders_priority", [
      "baixa",
      "alta",
      "urgente",
    ]);

    // Criar ENUM para planos de cliente
    await createEnumIfNotExists("enum_customers_plan", [
      "prata",
      "ouro",
      "vip",
      "Tráfego Essencial",
      "Tráfego Profissional",
      "Tráfego Avançado",
    ]);

    console.log("Tipos ENUM criados com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tipos ENUM:", error);
  }
}

// Função principal para configurar o banco de dados
async function configureDatabase() {
  try {
    console.log("Iniciando configuração do banco de dados...");

    // Verifica a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    // Criar ENUMs necessários
    await createENUMs();

    // Verificar e adicionar colunas necessárias
    await addColumnIfNotExists(
      "service_orders",
      "customerId",
      "INTEGER REFERENCES customers(id) ON DELETE SET NULL"
    );
    await addColumnIfNotExists("service_orders", "closingReason", "TEXT");
    await addColumnIfNotExists("service_orders", "reopenReason", "TEXT");
    await addColumnIfNotExists("service_orders", "rejectionReason", "TEXT");
    await addColumnIfNotExists("service_orders", "leaveOpenReason", "TEXT");
    await addColumnIfNotExists("service_orders", "transferHistory", "JSONB");
    await addColumnIfNotExists(
      "service_orders",
      "closedAt",
      "TIMESTAMP WITH TIME ZONE"
    );
    await addColumnIfNotExists(
      "service_orders",
      "value",
      "DECIMAL(10,2) DEFAULT NULL"
    );

    // Verificar e adicionar colunas de cliente
    await addColumnIfNotExists("customers", "document", "VARCHAR(30)");
    await addColumnIfNotExists("customers", "mobile", "VARCHAR(30)");
    await addColumnIfNotExists(
      "customers",
      "plan",
      "enum_customers_plan DEFAULT 'prata'"
    );

    // Verificar e adicionar colunas de usuário
    await addColumnIfNotExists("users", "canSeeAllOS", "BOOLEAN DEFAULT false");
    await addColumnIfNotExists("users", "active", "BOOLEAN DEFAULT true");

    // Criar tabela de eventos de timeline
    await createTimelineEventsTable();

    // Atualizar ENUM de prioridade
    await updatePriorityEnum();

    console.log("Configuração do banco de dados concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao configurar o banco de dados:", error);
  } finally {
    // Fechar a conexão com o banco de dados
    await sequelize.close();
    console.log("Conexão com o banco de dados fechada.");
  }
}

// Executar a função principal
configureDatabase();
