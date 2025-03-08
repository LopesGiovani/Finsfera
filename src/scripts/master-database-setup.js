/**
 * Script Master para configuração completa do banco de dados
 * Este script:
 * 1. Cria todos os tipos ENUM necessários
 * 2. Cria todas as tabelas principais (organizations, users, customers, service_orders)
 * 3. Cria a tabela service_order_comments para comentários
 * 4. Adiciona índices para melhorar a performance
 * 5. Corrige a coluna na tabela de comentários (renomeia content para text)
 */
require("dotenv").config();
const { Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");

// Inicializa o Sequelize com variáveis de ambiente ou valores padrão
const PGHOST =
  process.env.PGHOST || "ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech";
const PGDATABASE = process.env.PGDATABASE || "staging";
const PGUSER = process.env.PGUSER || "neondb_owner";
const PGPASSWORD = process.env.PGPASSWORD || "npg_UXBQzj8cEv6h";
const DATABASE_URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`;

console.log("=".repeat(60));
console.log("    CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS FINSFERA    ");
console.log("=".repeat(60));
console.log("\nConectando ao banco de dados...");
console.log(`Host: ${PGHOST}`);
console.log(`Database: ${PGDATABASE}`);

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  logging: false, // Desativa logs de SQL para manter a saída limpa
});

/**
 * Verifica se uma tabela existe no banco de dados
 */
async function tableExists(tableName) {
  const [result] = await sequelize.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = '${tableName}'
    );
  `);
  return result[0].exists;
}

/**
 * Verifica se uma coluna existe em uma tabela
 */
async function columnExists(tableName, columnName) {
  const [result] = await sequelize.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = '${tableName}' AND column_name = '${columnName}';
  `);
  return result.length > 0;
}

/**
 * Verifica se um tipo ENUM existe
 */
async function enumExists(enumName) {
  const [result] = await sequelize.query(`
    SELECT typname FROM pg_type WHERE typname = '${enumName}';
  `);
  return result.length > 0;
}

/**
 * Cria um tipo ENUM se não existir
 */
async function createEnum(enumName, values) {
  console.log(`\n🔍 Verificando ENUM ${enumName}...`);

  if (await enumExists(enumName)) {
    console.log(`✅ ENUM ${enumName} já existe.`);
    return true;
  }

  try {
    console.log(`🔄 Criando ENUM ${enumName}...`);
    const valuesString = values.map((v) => `'${v}'`).join(", ");
    await sequelize.query(`CREATE TYPE ${enumName} AS ENUM (${valuesString});`);
    console.log(`✅ ENUM ${enumName} criado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao criar ENUM ${enumName}:`, error.message);
    return false;
  }
}

/**
 * Cria todos os ENUMs necessários
 */
async function createAllEnums() {
  console.log("\n" + "=".repeat(40));
  console.log("  CRIANDO TIPOS ENUM  ");
  console.log("=".repeat(40));

  const results = [];

  // ENUM para roles de usuários
  results.push(
    await createEnum("enum_users_role", [
      "system_admin",
      "owner",
      "manager",
      "technician",
      "assistant",
    ])
  );

  // ENUM para status de ordens de serviço
  results.push(
    await createEnum("enum_service_orders_status", [
      "pendente",
      "em_andamento",
      "concluida",
      "cancelada",
      "transferida",
    ])
  );

  // ENUM para prioridade de ordens de serviço
  results.push(
    await createEnum("enum_service_orders_priority", [
      "baixa",
      "media",
      "alta",
      "urgente",
    ])
  );

  // ENUM para planos de clientes
  results.push(
    await createEnum("enum_customers_plan", ["bronze", "prata", "ouro", "vip"])
  );

  return results.every((result) => result);
}

/**
 * Cria a tabela de organizações se não existir
 */
async function createOrganizationsTable() {
  console.log("\n🔍 Verificando tabela organizations...");

  if (await tableExists("organizations")) {
    console.log("✅ Tabela organizations já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela organizations...");

    await sequelize.query(`
      CREATE TABLE organizations (
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

    console.log("✅ Tabela organizations criada com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela organizations:", error.message);
    return false;
  }
}

/**
 * Cria a tabela de usuários se não existir
 */
async function createUsersTable() {
  console.log("\n🔍 Verificando tabela users...");

  if (await tableExists("users")) {
    console.log("✅ Tabela users já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela users...");

    await sequelize.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        "organizationId" INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role enum_users_role NOT NULL,
        "canSeeAllOS" BOOLEAN NOT NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Criar admin inicial
    console.log("🔄 Criando usuário administrador...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId")
      VALUES (
        'Admin', 
        'admin@finsfera.com', 
        '${hashedPassword}', 
        'system_admin', 
        NULL
      );
    `);

    console.log("✅ Tabela users e admin inicial criados com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela users:", error.message);
    return false;
  }
}

/**
 * Cria a tabela de clientes se não existir
 */
async function createCustomersTable() {
  console.log("\n🔍 Verificando tabela customers...");

  if (await tableExists("customers")) {
    console.log("✅ Tabela customers já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela customers...");

    await sequelize.query(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        "organizationId" INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        document VARCHAR(30) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        mobile VARCHAR(30),
        company VARCHAR(255),
        street VARCHAR(255) NOT NULL,
        number VARCHAR(20) NOT NULL,
        complement VARCHAR(255),
        district VARCHAR(100) NOT NULL,
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

    console.log("✅ Tabela customers criada com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela customers:", error.message);
    return false;
  }
}

/**
 * Cria a tabela de ordens de serviço se não existir
 */
async function createServiceOrdersTable() {
  console.log("\n🔍 Verificando tabela service_orders...");

  if (await tableExists("service_orders")) {
    console.log("✅ Tabela service_orders já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela service_orders...");

    await sequelize.query(`
      CREATE TABLE service_orders (
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
        "closingReason" TEXT,
        "reopenReason" TEXT,
        "rejectionReason" TEXT,
        "leaveOpenReason" TEXT,
        "transferHistory" JSONB,
        "closedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("✅ Tabela service_orders criada com sucesso!");

    // Criar índices para melhorar performance
    console.log("🔄 Criando índices na tabela de ordens de serviço...");

    await sequelize.query(`
      CREATE INDEX idx_service_orders_organization_id 
      ON service_orders("organizationId");
    `);

    await sequelize.query(`
      CREATE INDEX idx_service_orders_status 
      ON service_orders(status);
    `);

    await sequelize.query(`
      CREATE INDEX idx_service_orders_assigned_to 
      ON service_orders("assignedToId");
    `);

    await sequelize.query(`
      CREATE INDEX idx_service_orders_customer_id 
      ON service_orders("customerId");
    `);

    console.log("✅ Índices criados com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela service_orders:", error.message);
    return false;
  }
}

/**
 * Cria a tabela de anexos de ordens de serviço se não existir
 */
async function createAttachmentsTable() {
  console.log("\n🔍 Verificando tabela de anexos...");

  if (await tableExists("service_order_attachments")) {
    console.log("✅ Tabela service_order_attachments já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela service_order_attachments...");

    await sequelize.query(`
      CREATE TABLE service_order_attachments (
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

    console.log("✅ Tabela service_order_attachments criada com sucesso!");
    return true;
  } catch (error) {
    console.error(
      "❌ Erro ao criar tabela service_order_attachments:",
      error.message
    );
    return false;
  }
}

/**
 * Cria a tabela de comentários se não existir
 */
async function createCommentsTable() {
  console.log("\n🔍 Verificando tabela de comentários...");

  if (await tableExists("service_order_comments")) {
    console.log("✅ A tabela service_order_comments já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela service_order_comments...");

    await sequelize.query(`
      CREATE TABLE service_order_comments (
        id SERIAL PRIMARY KEY,
        "serviceOrderId" INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        text TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log("✅ Tabela service_order_comments criada com sucesso!");

    // Criar índices para melhorar performance
    console.log("🔄 Criando índices na tabela de comentários...");

    await sequelize.query(`
      CREATE INDEX idx_service_order_comments_service_order_id 
      ON service_order_comments("serviceOrderId");
    `);

    await sequelize.query(`
      CREATE INDEX idx_service_order_comments_user_id 
      ON service_order_comments("userId");
    `);

    console.log("✅ Índices criados com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela de comentários:", error.message);
    return false;
  }
}

/**
 * Verifica e corrige a estrutura da tabela de comentários se necessário
 */
async function fixCommentsTable() {
  console.log("\n🔍 Verificando estrutura da tabela de comentários...");

  if (!(await tableExists("service_order_comments"))) {
    console.log(
      "⚠️ A tabela service_order_comments não existe. Será criada em outra etapa."
    );
    return true;
  }

  try {
    // Verificar se existe a coluna esperada 'text'
    if (!(await columnExists("service_order_comments", "text"))) {
      // Verificar se existe a coluna alternativa 'content'
      if (await columnExists("service_order_comments", "content")) {
        console.log(
          "🔄 Renomeando coluna 'content' para 'text' na tabela service_order_comments..."
        );

        // Renomeia a coluna
        await sequelize.query(`
          ALTER TABLE service_order_comments RENAME COLUMN content TO text;
        `);

        console.log("✅ Coluna renomeada com sucesso!");
      } else {
        console.log(
          "⚠️ A tabela service_order_comments não tem a coluna 'text' nem 'content'."
        );

        // Adiciona a coluna 'text'
        console.log(
          "🔄 Adicionando coluna 'text' à tabela service_order_comments..."
        );
        await sequelize.query(`
          ALTER TABLE service_order_comments ADD COLUMN text TEXT NOT NULL DEFAULT '';
        `);

        console.log("✅ Coluna 'text' adicionada com sucesso!");
      }
    } else {
      console.log(
        "✅ A tabela service_order_comments já tem a coluna 'text'. Não é necessário corrigir."
      );
    }

    // Verificar se existe uma coluna 'isInternal' que não deve existir
    if (await columnExists("service_order_comments", "isInternal")) {
      console.log(
        "🔄 Removendo coluna 'isInternal' da tabela service_order_comments..."
      );

      // Remove a coluna
      await sequelize.query(`
        ALTER TABLE service_order_comments DROP COLUMN "isInternal";
      `);

      console.log("✅ Coluna 'isInternal' removida com sucesso!");
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Erro ao verificar/corrigir tabela de comentários:",
      error.message
    );
    return false;
  }
}

/**
 * Cria a tabela de eventos timeline se não existir
 */
async function createTimelineEventsTable() {
  console.log("\n🔍 Verificando tabela de eventos timeline...");

  if (await tableExists("timeline_events")) {
    console.log("✅ A tabela timeline_events já existe.");
    return true;
  }

  try {
    console.log("🔄 Criando tabela timeline_events...");

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

    console.log("✅ Tabela timeline_events criada com sucesso!");

    // Criar índices para melhorar performance
    console.log("🔄 Criando índices na tabela de eventos timeline...");

    await sequelize.query(`
      CREATE INDEX idx_timeline_events_service_order_id 
      ON timeline_events("serviceOrderId");
    `);

    await sequelize.query(`
      CREATE INDEX idx_timeline_events_event_type
      ON timeline_events("eventType");
    `);

    console.log("✅ Índices criados com sucesso!");
    return true;
  } catch (error) {
    console.error(
      "❌ Erro ao criar tabela de eventos timeline:",
      error.message
    );
    return false;
  }
}

/**
 * Cria a tabela de atividades do usuário para rastreamento de ações
 */
async function createUserActivitiesTable() {
  try {
    // Verificar se a tabela já existe
    const tableExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'user_activities'
      );
    `);

    if (tableExists[0][0].exists) {
      console.log("✅ Tabela user_activities já existe. Pulando criação.");
      return true;
    }

    console.log("\nCriando tabela user_activities...");

    await sequelize.query(`
      CREATE TABLE user_activities (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(255) NOT NULL,
        "entityType" VARCHAR(50),
        "entityId" INTEGER,
        details JSONB,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_activities_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Criar índices para melhorar performance
    await sequelize.query(`
      CREATE INDEX idx_user_activities_user_id ON user_activities ("userId");
      CREATE INDEX idx_user_activities_created_at ON user_activities ("createdAt");
      CREATE INDEX idx_user_activities_entity ON user_activities ("entityType", "entityId");
    `);

    console.log("✅ Tabela user_activities criada com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabela user_activities:", error.message);
    return false;
  }
}

/**
 * Cria dados iniciais para testes
 */
async function createInitialData() {
  try {
    console.log("\n" + "=".repeat(40));
    console.log("  CRIANDO DADOS DE TESTE  ");
    console.log("=".repeat(40));

    // Verificar se já existem organizações
    const [orgsResult] = await sequelize.query(
      "SELECT COUNT(*) FROM organizations"
    );
    const orgCount = parseInt(orgsResult[0].count);

    if (orgCount > 0) {
      console.log("✅ Dados iniciais já existem. Pulando criação.");
      console.log("   Para recriar dados de teste, esvazie o banco primeiro.");
      return true;
    }

    console.log("🔄 Criando organização de exemplo...");

    // Criar organização de exemplo
    await sequelize.query(`
      INSERT INTO organizations (name, document, email, phone, address, city, state, "zipCode")
      VALUES ('Empresa Exemplo', '12.345.678/0001-90', 'contato@exemplo.com', '(11) 3456-7890', 'Av Principal, 123', 'São Paulo', 'SP', '01310-100');
    `);

    // Obter ID da organização criada
    const [orgIdResult] = await sequelize.query(
      "SELECT id FROM organizations WHERE name = 'Empresa Exemplo' LIMIT 1"
    );
    const orgId = orgIdResult[0].id;

    // Criar usuários
    console.log("🔄 Criando usuários de exemplo...");

    const hashedPassword = await bcrypt.hash("user123", 10);

    // Proprietário
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Proprietário', 'owner@example.com', '${hashedPassword}', 'owner', ${orgId}, true);
    `);

    // Gerente
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Gerente', 'gerente@example.com', '${hashedPassword}', 'manager', ${orgId}, true);
    `);

    // Técnicos
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Técnico 1', 'tecnico1@example.com', '${hashedPassword}', 'technician', ${orgId}, false);
    `);

    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Técnico 2', 'tecnico2@example.com', '${hashedPassword}', 'technician', ${orgId}, false);
    `);

    // Assistente
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
      VALUES ('Assistente', 'assistente@example.com', '${hashedPassword}', 'assistant', ${orgId}, false);
    `);

    console.log("✅ Usuários criados com sucesso!");

    // Criar clientes
    console.log("🔄 Criando clientes de exemplo...");

    // Cliente empresa
    await sequelize.query(`
      INSERT INTO customers (
        "organizationId", name, document, email, phone, mobile, company,
        street, number, complement, district, city, state, "zipCode",
        "contactPerson", notes, plan, active
      ) VALUES (
        ${orgId}, 'Empresa ABC Ltda', '12.345.678/0001-90',
        'contato@empresaabc.com', '(11) 3333-4444', '(11) 98765-4321', 'Empresa ABC',
        'Av. Paulista', '1000', 'Sala 123', 'Bela Vista',
        'São Paulo', 'SP', '01310-100',
        'João Silva', 'Cliente desde 2020', 'ouro',
        true
      );
    `);

    // Cliente pessoa física
    await sequelize.query(`
      INSERT INTO customers (
        "organizationId", name, document, email, phone, mobile, company,
        street, number, complement, district, city, state, "zipCode",
        "contactPerson", notes, plan, active
      ) VALUES (
        ${orgId}, 'Maria Oliveira', '123.456.789-00',
        'maria@email.com', '(11) 2222-3333', '(11) 97777-8888', '',
        'Rua das Flores', '123', 'Apto 45', 'Jardim Europa',
        'São Paulo', 'SP', '04500-000',
        '', 'Cliente residencial', 'prata',
        true
      );
    `);

    // Cliente empresa grande
    await sequelize.query(`
      INSERT INTO customers (
        "organizationId", name, document, email, phone, mobile, company,
        street, number, complement, district, city, state, "zipCode",
        "contactPerson", notes, plan, active
      ) VALUES (
        ${orgId}, 'Tech Solutions S.A.', '98.765.432/0001-10',
        'contato@techsolutions.com', '(11) 5555-6666', '(11) 96666-7777', 'Tech Solutions',
        'Rua Tecnológica', '500', 'Andar 10', 'Vila Olímpia',
        'São Paulo', 'SP', '04550-000',
        'Carlos Mendes', 'Cliente VIP', 'vip',
        true
      );
    `);

    console.log("✅ Clientes criados com sucesso!");

    // Obter IDs dos usuários e clientes para criar ordens de serviço
    const [userIdsResult] = await sequelize.query(`
      SELECT id, role FROM users WHERE "organizationId" = ${orgId} ORDER BY id
    `);

    const [customerIdsResult] = await sequelize.query(`
      SELECT id FROM customers WHERE "organizationId" = ${orgId} ORDER BY id
    `);

    // IDs dos usuários por papel
    const managerId = userIdsResult.find((u) => u.role === "manager").id;
    const techIds = userIdsResult
      .filter((u) => u.role === "technician")
      .map((u) => u.id);

    // IDs dos clientes
    const customerIds = customerIdsResult.map((c) => c.id);

    // Criar ordens de serviço
    console.log("🔄 Criando ordens de serviço de exemplo...");

    // OS 1: Pendente
    await sequelize.query(`
      INSERT INTO service_orders (
        "organizationId", title, description, status, priority,
        "assignedToId", "assignedByUserId", "scheduledDate",
        "customerId", value
      ) VALUES (
        ${orgId},
        'Manutenção Preventiva - Cliente ABC',
        'Realizar manutenção preventiva nos equipamentos de rede. Verificar roteadores e switches.',
        'pendente',
        'media',
        ${techIds[0]},
        ${managerId},
        NOW() + INTERVAL '3 days',
        ${customerIds[0]},
        150.75
      ) RETURNING id;
    `);

    // OS 2: Em andamento
    const [os2Result] = await sequelize.query(`
      INSERT INTO service_orders (
        "organizationId", title, description, status, priority,
        "assignedToId", "assignedByUserId", "scheduledDate",
        "customerId", value
      ) VALUES (
        ${orgId},
        'Atendimento de Emergência - Maria',
        'Cliente relata que o computador não está ligando. Verificar fonte de alimentação e demais componentes.',
        'em_andamento',
        'alta',
        ${techIds[1]},
        ${managerId},
        NOW() + INTERVAL '1 day',
        ${customerIds[1]},
        250.00
      ) RETURNING id;
    `);
    const os2Id = os2Result[0].id;

    // OS 3: Concluída
    const [os3Result] = await sequelize.query(`
      INSERT INTO service_orders (
        "organizationId", title, description, status, priority,
        "assignedToId", "assignedByUserId", "scheduledDate",
        "customerId", value, "closingReason", "closedAt"
      ) VALUES (
        ${orgId},
        'Instalação de Servidores - Tech Solutions',
        'Instalar e configurar três servidores Dell PowerEdge na sala de TI do cliente.',
        'concluida',
        'media',
        ${techIds[0]},
        ${managerId},
        NOW() - INTERVAL '5 days',
        ${customerIds[2]},
        3500.00,
        'Serviço realizado com sucesso. Cliente validou a instalação.',
        NOW() - INTERVAL '2 days'
      ) RETURNING id;
    `);
    const os3Id = os3Result[0].id;

    // OS 4: Cancelada - Verificar se o enum permite este valor
    try {
      const [os4Result] = await sequelize.query(`
        INSERT INTO service_orders (
          "organizationId", title, description, status, priority,
          "assignedToId", "assignedByUserId", "scheduledDate",
          "customerId", value, "rejectionReason", "closedAt"
        ) VALUES (
          ${orgId},
          'Manutenção de Impressoras - Tech Solutions',
          'Realizar manutenção preventiva nas impressoras do departamento financeiro.',
          'cancelada',
          'baixa',
          ${techIds[1]},
          ${managerId},
          NOW() - INTERVAL '10 days',
          ${customerIds[2]},
          350.00,
          'Cliente cancelou o serviço porque já contratou outro fornecedor.',
          NOW() - INTERVAL '8 days'
        ) RETURNING id;
      `);
      console.log("✅ Ordem de serviço cancelada criada com sucesso!");
    } catch (error) {
      console.warn(
        "⚠️ Não foi possível criar ordem de serviço com status 'cancelada':",
        error.message
      );
      console.warn(
        "Verifique se o enum enum_service_orders_status inclui o valor 'cancelada'"
      );
    }

    console.log("✅ Ordens de serviço criadas com sucesso!");

    // Adicionar comentários às ordens de serviço
    console.log("🔄 Criando comentários de exemplo...");

    // Comentário na OS em andamento
    await sequelize.query(`
      INSERT INTO service_order_comments (
        "serviceOrderId", "userId", text
      ) VALUES (
        ${os2Id}, ${techIds[1]}, '<p>Fiz uma análise inicial e parece ser problema na fonte. Vou levar uma fonte reserva na próxima visita.</p>'
      );
    `);

    await sequelize.query(`
      INSERT INTO service_order_comments (
        "serviceOrderId", "userId", text
      ) VALUES (
        ${os2Id}, ${managerId}, '<p>Lembre-se de testar também a placa-mãe caso a fonte não seja o problema.</p>'
      );
    `);

    // Comentários na OS concluída
    await sequelize.query(`
      INSERT INTO service_order_comments (
        "serviceOrderId", "userId", text
      ) VALUES (
        ${os3Id}, ${techIds[0]}, '<p>Servidores instalados e configurados conforme especificações. Teste de carga realizado com sucesso.</p>'
      );
    `);

    await sequelize.query(`
      INSERT INTO service_order_comments (
        "serviceOrderId", "userId", text
      ) VALUES (
        ${os3Id}, ${managerId}, '<p>Cliente muito satisfeito com o serviço. Ótimo trabalho!</p>'
      );
    `);

    console.log("✅ Comentários criados com sucesso!");

    // Adicionar eventos de timeline
    console.log("🔄 Criando eventos de timeline...");

    // Timeline para OS em andamento
    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os2Id}, ${managerId}, 'criacao', 'Ordem de serviço criada', '{}'::jsonb
      );
    `);

    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os2Id}, ${managerId}, 'atribuicao', 'Ordem de serviço atribuída ao técnico', '{"tecnico": "Técnico 2"}'::jsonb
      );
    `);

    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os2Id}, ${techIds[1]}, 'status', 'Status alterado para Em Andamento', '{"statusAnterior": "pendente", "statusNovo": "em_andamento"}'::jsonb
      );
    `);

    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os2Id}, ${techIds[1]}, 'comentario', 'Comentário adicionado', '{"texto": "Fiz uma análise inicial e parece ser problema na fonte. Vou levar uma fonte reserva na próxima visita."}'::jsonb
      );
    `);

    // Timeline para OS concluída
    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os3Id}, ${managerId}, 'criacao', 'Ordem de serviço criada', '{}'::jsonb
      );
    `);

    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os3Id}, ${techIds[0]}, 'status', 'Status alterado para Em Andamento', '{"statusAnterior": "pendente", "statusNovo": "em_andamento"}'::jsonb
      );
    `);

    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os3Id}, ${techIds[0]}, 'comentario', 'Comentário adicionado', '{"texto": "Servidores instalados e configurados conforme especificações. Teste de carga realizado com sucesso."}'::jsonb
      );
    `);

    await sequelize.query(`
      INSERT INTO timeline_events (
        "serviceOrderId", "userId", "eventType", description, metadata
      ) VALUES (
        ${os3Id}, ${techIds[0]}, 'fechamento', 'Ordem de serviço concluída', '{"texto": "Serviço realizado com sucesso. Cliente validou a instalação."}'::jsonb
      );
    `);

    console.log("✅ Eventos de timeline criados com sucesso!");

    // Criar registros de atividade inicial para demonstração
    console.log("\nCriando registros de atividade inicial...");

    // Atividades para o owner
    await sequelize.query(`
      INSERT INTO user_activities (
        "userId", action, "createdAt"
      ) VALUES (
        ${managerId}, 'Login no sistema', NOW() - INTERVAL '2 HOURS'
      );
    `);

    await sequelize.query(`
      INSERT INTO user_activities (
        "userId", action, "entityType", "entityId", "createdAt"
      ) VALUES (
        ${managerId}, 'Visualizou uma ordem de serviço', 'service_order', ${os2Id}, NOW() - INTERVAL '1 HOUR 45 MINUTES'
      );
    `);

    await sequelize.query(`
      INSERT INTO user_activities (
        "userId", action, "entityType", "entityId", details, "createdAt"
      ) VALUES (
        ${managerId}, 'Atualizou dados do perfil', NULL, NULL, '{"nameUpdated": true}'::jsonb, NOW() - INTERVAL '1 HOUR 30 MINUTES'
      );
    `);

    // Atividades para os técnicos
    await sequelize.query(`
      INSERT INTO user_activities (
        "userId", action, "createdAt"
      ) VALUES (
        ${techIds[0]}, 'Login no sistema', NOW() - INTERVAL '4 HOURS'
      );
    `);

    await sequelize.query(`
      INSERT INTO user_activities (
        "userId", action, "entityType", "entityId", "createdAt"
      ) VALUES (
        ${techIds[0]}, 'Atualizou status de uma ordem de serviço', 'service_order', ${os3Id}, NOW() - INTERVAL '3 HOURS 45 MINUTES'
      );
    `);

    console.log("✅ Registros de atividade inicial criados com sucesso!");

    console.log("\n" + "=".repeat(60));
    console.log(" 🎉 DADOS DE TESTE CRIADOS COM SUCESSO! 🎉 ");
    console.log("=".repeat(60));
    console.log("\nCredenciais de acesso para teste:");
    console.log("  Owner:     owner@example.com / user123");
    console.log("  Gerente:   gerente@example.com / user123");
    console.log("  Técnico 1: tecnico1@example.com / user123");
    console.log("  Técnico 2: tecnico2@example.com / user123");

    return true;
  } catch (error) {
    console.error("❌ Erro ao criar dados iniciais:", error.message);
    return false;
  }
}

/**
 * Função principal que executa todas as operações
 */
async function runMasterSetup() {
  const results = {
    enums: false,
    organizations: false,
    users: false,
    customers: false,
    serviceOrders: false,
    attachments: false,
    comments: false,
    commentsStructure: false,
    timelineEvents: false,
    userActivities: false,
    initialData: false,
  };

  try {
    // Verificar conexão
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    // 1. Criar tipos ENUM
    results.enums = await createAllEnums();

    // 2. Criar tabelas principais
    results.organizations = await createOrganizationsTable();
    results.users = await createUsersTable();
    results.customers = await createCustomersTable();
    results.serviceOrders = await createServiceOrdersTable();

    // 3. Criar tabelas adicionais
    results.attachments = await createAttachmentsTable();
    results.comments = await createCommentsTable();
    results.timelineEvents = await createTimelineEventsTable();
    results.userActivities = await createUserActivitiesTable();

    // 4. Corrigir estrutura da tabela de comentários se necessário
    results.commentsStructure = await fixCommentsTable();

    // 5. Criar dados iniciais
    results.initialData = await createInitialData();

    // Resumo das operações
    console.log("\n" + "=".repeat(60));
    console.log("              RESUMO DAS OPERAÇÕES              ");
    console.log("=".repeat(60));
    console.log(
      `ENUMs:                  ${results.enums ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela organizations:   ${results.organizations ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela users:           ${results.users ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela customers:       ${results.customers ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela service_orders:  ${results.serviceOrders ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela attachments:     ${results.attachments ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela comments:        ${results.comments ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Estrutura comments:     ${
        results.commentsStructure ? "✅ OK" : "❌ Falha"
      }`
    );
    console.log(
      `Tabela timeline_events: ${results.timelineEvents ? "✅ OK" : "❌ Falha"}`
    );
    console.log(
      `Tabela user_activities:  ${
        results.userActivities ? "✅ OK" : "❌ Falha"
      }`
    );
    console.log(
      `Dados iniciais:         ${results.initialData ? "✅ OK" : "❌ Falha"}`
    );
    console.log("=".repeat(60));

    // Verificação de sucesso
    const allSuccess = Object.values(results).every((result) => result);

    if (allSuccess) {
      console.log("\n" + "=".repeat(60));
      console.log(
        " 🎉 CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS CONCLUÍDA COM SUCESSO! 🎉 "
      );
      console.log("=".repeat(60));
      console.log("\nCredenciais de acesso:");
      console.log("  Admin: admin@finsfera.com / admin123");
      console.log("  Owner: owner@example.com / user123");
      console.log("  Outros usuários: Ver resumo dos dados de teste");
    } else {
      console.log(
        "\n⚠️ Configuração parcialmente concluída. Verifique os erros acima."
      );
    }
  } catch (error) {
    console.error(
      "\n❌ Erro durante a configuração do banco de dados:",
      error.message
    );

    // Sugestões para problemas comuns
    if (
      error.message.includes("connect ECONNREFUSED") ||
      error.message.includes("password authentication failed")
    ) {
      console.error("\n⚠️ Erro de conexão com o banco de dados!");
      console.error(
        "Verifique suas credenciais no arquivo .env ou passe-as como variáveis de ambiente."
      );
    }
  } finally {
    // Fechar conexão
    await sequelize.close();
    console.log("\n🔒 Conexão com o banco de dados fechada.");
  }
}

// Executar o script
runMasterSetup();
