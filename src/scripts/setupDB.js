/**
 * Script para inicialização completa do banco de dados
 * Este script:
 * 1. Cria todas as tabelas necessárias
 * 2. Adiciona colunas especiais como value e customerId
 * 3. Cria usuários, organizações e dados de exemplo
 * 4. Cria ordens de serviço com valores e relacionamentos corretos
 */
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

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

async function dropTablesIfExist() {
  try {
    console.log("Removendo tabelas existentes...");
    
    // Lista de tabelas para remover (na ordem correta considerando chaves estrangeiras)
    const tables = [
      "service_orders",
      "customers",
      "users",
      "organizations"
    ];

    // Desativar verificação de chaves estrangeiras temporariamente
    await sequelize.query("SET session_replication_role = 'replica';");
    
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`Tabela ${table} removida.`);
      } catch (err) {
        console.error(`Erro ao remover tabela ${table}:`, err);
      }
    }
    
    // Reativar verificação de chaves estrangeiras
    await sequelize.query("SET session_replication_role = 'origin';");
    
    console.log("Tabelas removidas com sucesso!");
  } catch (error) {
    console.error("Erro ao remover tabelas:", error);
  }
}

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
    
    console.log("Tipos ENUM criados com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tipos ENUM:", error);
  }
}

async function createTables() {
  try {
    console.log("Criando tabelas...");
    
    // Criar tabela de organizações
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        document VARCHAR(30) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(2) NOT NULL,
        "zipCode" VARCHAR(10) NOT NULL,
        "logoUrl" VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Tabela organizations criada.");
    
    // Criar tabela de usuários
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "organizationId" INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role enum_users_role NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "canSeeAllOS" BOOLEAN NOT NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true
      );
    `);
    console.log("Tabela users criada.");
    
    // Criar tabela de clientes
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS customers (
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
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Tabela customers criada.");
    
    // Criar tabela de ordens de serviço
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS service_orders (
        id SERIAL PRIMARY KEY,
        "organizationId" INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status enum_service_orders_status NOT NULL DEFAULT 'pendente',
        priority enum_service_orders_priority NOT NULL DEFAULT 'media',
        "assignedToId" INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        "assignedByUserId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        "scheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        value DECIMAL(10,2) DEFAULT NULL,
        "closingLink" VARCHAR(255),
        "rejectionReason" TEXT,
        "leaveOpenReason" TEXT,
        "transferHistory" JSON,
        "closedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Tabela service_orders criada.");
    
    // Criar tabela de anexos de ordem de serviço
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS service_order_attachments (
        id SERIAL PRIMARY KEY,
        "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        "originalName" VARCHAR(255) NOT NULL,
        "mimeType" VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        path VARCHAR(255) NOT NULL,
        "uploadedById" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Tabela service_order_attachments criada.");
    
    console.log("Todas as tabelas criadas com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
  }
}

async function createSampleData() {
  try {
    console.log("Criando dados de exemplo...");
    
    // Criar administrador do sistema
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId")
      VALUES ('Admin', 'admin@finsfera.com', '${hashedAdminPassword}', 'system_admin', NULL);
    `);
    console.log("Administrador do sistema criado com sucesso!");
    
    // Criar organização de exemplo
    await sequelize.query(`
      INSERT INTO organizations (name, document, email, phone, address, city, state, "zipCode")
      VALUES ('Empresa Exemplo', '12.345.678/0001-90', 'contato@exemplo.com', '(11) 3456-7890', 'Av Principal, 123', 'São Paulo', 'SP', '01310-100');
    `);
    console.log("Organização de exemplo criada com sucesso!");
    
    // Obter ID da organização criada
    const [orgResult] = await sequelize.query(`
      SELECT id FROM organizations WHERE name = 'Empresa Exemplo' LIMIT 1;
    `);
    const organizationId = orgResult[0].id;
    
    // Criar proprietário da organização
    const hashedOwnerPassword = await bcrypt.hash("owner123", 10);
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Proprietário', 'owner@example.com', '${hashedOwnerPassword}', 'owner', ${organizationId}, true);
    `);
    console.log("Proprietário da organização criado com sucesso!");
    
    // Criar outros membros da equipe
    const hashedMemberPassword = await bcrypt.hash("member123", 10);
    
    // Gerente
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Gerente', 'gerente@example.com', '${hashedMemberPassword}', 'manager', ${organizationId}, true);
    `);
    
    // Técnicos
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId")
      VALUES ('Técnico 1', 'tecnico1@example.com', '${hashedMemberPassword}', 'technician', ${organizationId});
    `);
    
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId")
      VALUES ('Técnico 2', 'tecnico2@example.com', '${hashedMemberPassword}', 'technician', ${organizationId});
    `);
    
    // Assistente
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId")
      VALUES ('Assistente', 'assistente@example.com', '${hashedMemberPassword}', 'assistant', ${organizationId});
    `);
    console.log("Membros da equipe criados com sucesso!");
    
    // Criar clientes de exemplo
    await sequelize.query(`
      INSERT INTO customers (
        "organizationId", name, document, email, phone, address, city, state, "zipCode", "contactPerson", plan
      ) VALUES 
        (${organizationId}, 'Cliente Empresa A', '12.345.678/0001-01', 'contato@empresaa.com.br', '(11) 1111-1111', 'Rua A, 123', 'São Paulo', 'SP', '01001-000', 'João Silva', 'prata'),
        (${organizationId}, 'Cliente Empresa B', '23.456.789/0001-02', 'contato@empresab.com.br', '(11) 2222-2222', 'Rua B, 456', 'São Paulo', 'SP', '02002-000', 'Maria Santos', 'ouro'),
        (${organizationId}, 'Cliente Empresa C', '34.567.890/0001-03', 'contato@empresac.com.br', '(11) 3333-3333', 'Rua C, 789', 'São Paulo', 'SP', '03003-000', 'Pedro Oliveira', 'vip'),
        (${organizationId}, 'Cliente Empresa D', '45.678.901/0001-04', 'contato@empresad.com.br', '(11) 4444-4444', 'Rua D, 101', 'São Paulo', 'SP', '04004-000', 'Ana Costa', 'prata'),
        (${organizationId}, 'Cliente Empresa E', '56.789.012/0001-05', 'contato@empresae.com.br', '(11) 5555-5555', 'Rua E, 112', 'São Paulo', 'SP', '05005-000', 'Lucas Ferreira', 'ouro');
    `);
    console.log("Clientes de exemplo criados com sucesso!");
    
    // Obter IDs dos usuários
    const [userResult] = await sequelize.query(`
      SELECT id, role FROM users WHERE "organizationId" = ${organizationId} ORDER BY id;
    `);
    
    // Obter IDs dos clientes
    const [clientResult] = await sequelize.query(`
      SELECT id FROM customers WHERE "organizationId" = ${organizationId} ORDER BY id;
    `);
    
    // Criar ordens de serviço para cada cliente com valores
    console.log("Criando ordens de serviço...");
    
    const technicians = userResult.filter(u => u.role === 'technician');
    const managers = userResult.filter(u => u.role === 'manager');
    
    for (let i = 0; i < clientResult.length; i++) {
      const clientId = clientResult[i].id;
      const techId = technicians[i % technicians.length].id;
      const managerId = managers[0].id;
      
      // Data atual
      const now = new Date();
      
      // Criar duas ordens de serviço por cliente (uma pendente e uma em andamento)
      // OS Pendente
      await sequelize.query(`
        INSERT INTO service_orders (
          "organizationId", title, description, status, priority,
          "assignedToId", "assignedByUserId", "scheduledDate",
          "customerId", value, "createdAt", "updatedAt"
        ) VALUES (
          ${organizationId},
          'Manutenção Preventiva #${i + 1}',
          'Descrição detalhada da manutenção preventiva necessária para o cliente ${i + 1}. Incluir verificação completa do sistema.',
          'pendente',
          'media',
          ${techId},
          ${managerId},
          '${new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString()}',
          ${clientId},
          ${150.75 * (i + 1)},
          NOW(),
          NOW()
        );
      `);
      
      // OS Em Andamento
      await sequelize.query(`
        INSERT INTO service_orders (
          "organizationId", title, description, status, priority,
          "assignedToId", "assignedByUserId", "scheduledDate",
          "customerId", value, "createdAt", "updatedAt"
        ) VALUES (
          ${organizationId},
          'Suporte Técnico #${i + 1}',
          'Atendimento de suporte técnico urgente para resolução de problema crítico no cliente ${i + 1}.',
          'em_andamento',
          'urgente',
          ${techId},
          ${managerId},
          '${new Date(now.getTime() + (i + 2) * 24 * 60 * 60 * 1000).toISOString()}',
          ${clientId},
          ${250.50 * (i + 1)},
          NOW(),
          NOW()
        );
      `);
    }
    
    console.log("Ordens de serviço criadas com sucesso!");
    console.log("Dados de exemplo criados com sucesso!");
  } catch (error) {
    console.error("Erro ao criar dados de exemplo:", error);
  }
}

async function setupDatabase() {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Resetar banco de dados
    await dropTablesIfExist();
    
    // Criar tipos ENUM
    await createENUMs();
    
    // Criar tabelas
    await createTables();
    
    // Criar dados de exemplo
    await createSampleData();

    console.log("\n=============================================");
    console.log("Banco de dados configurado com sucesso!");
    console.log("=============================================\n");
    console.log("Credenciais de acesso:");
    console.log("  Email: admin@finsfera.com");
    console.log("  Senha: admin123");
    console.log("\nProprietário da Empresa Exemplo:");
    console.log("  Email: owner@example.com");
    console.log("  Senha: owner123");
    console.log("\nOutros usuários:");
    console.log("  Email: gerente@example.com, tecnico1@example.com, tecnico2@example.com, assistente@example.com");
    console.log("  Senha: member123");
    console.log("=============================================");
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executa a função principal
setupDatabase(); 