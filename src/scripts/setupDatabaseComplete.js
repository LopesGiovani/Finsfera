/**
 * Script unificado para configuração completa do banco de dados
 * 
 * Este script combina as funcionalidades de:
 * - initDB.js: Inicialização do banco de dados
 * - updateDB.js: Atualização de ordens de serviço
 * - add-customerId-to-service-orders.js: Adição da coluna customerId
 * - add-customer-columns.js: Adição das novas colunas de clientes
 * - fix-address-constraint.js: Correção da restrição NOT NULL da coluna address
 * 
 * Executa todas as operações em sequência para garantir uma configuração completa.
 */
const { Sequelize, DataTypes, Op } = require("sequelize");
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

// Função para verificar se uma coluna existe
async function columnExists(tableName, columnName) {
  try {
    const result = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' AND column_name = '${columnName}';
    `);
    return result[0].length > 0;
  } catch (error) {
    console.error(`Erro ao verificar coluna ${columnName} na tabela ${tableName}:`, error);
    return false;
  }
}

// Função para verificar se uma tabela existe
async function tableExists(tableName) {
  try {
    const result = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = '${tableName}' AND table_schema = 'public';
    `);
    return result[0].length > 0;
  } catch (error) {
    console.error(`Erro ao verificar tabela ${tableName}:`, error);
    return false;
  }
}

// Função para tentar remover tabelas existentes
async function dropTablesIfExist() {
  try {
    console.log("Tentando remover tabelas existentes...");
    
    // Lista de tabelas para remover (na ordem correta considerando chaves estrangeiras)
    const tables = [
      "service_order_attachments",
      "service_orders",
      "customers",
      "users",
      "organizations"
    ];

    try {
      // Desativar verificação de chaves estrangeiras temporariamente (pode falhar em alguns provedores)
      await sequelize.query("SET session_replication_role = 'replica';");
    } catch (error) {
      console.log("Aviso: Não foi possível desativar verificação de chaves estrangeiras. Continuando...");
    }
    
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`Tabela ${table} removida.`);
      } catch (err) {
        console.error(`Erro ao remover tabela ${table}:`, err);
      }
    }
    
    try {
      // Reativar verificação de chaves estrangeiras
      await sequelize.query("SET session_replication_role = 'origin';");
    } catch (error) {
      console.log("Aviso: Não foi possível reativar verificação de chaves estrangeiras. Continuando...");
    }
    
    console.log("Processo de remoção de tabelas concluído.");
  } catch (error) {
    console.error("Erro ao remover tabelas:", error);
  }
}

// Função para criar ENUMs
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
      "Tráfego Essencial",
      "Tráfego Profissional",
      "Tráfego Avançado",
    ]);
    
    console.log("Tipos ENUM criados com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tipos ENUM:", error);
  }
}

// Função para criar tabelas
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
        mobile VARCHAR(30),
        company VARCHAR(255),
        street VARCHAR(255),
        number VARCHAR(20),
        complement VARCHAR(255),
        district VARCHAR(100),
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

// Função para corrigir restrições de colunas
async function fixColumnConstraints() {
  try {
    console.log("Verificando e corrigindo restrições de colunas...");
    
    // Verificar se a coluna 'address' existe e tem restrição NOT NULL
    const checkAddressColumn = await sequelize.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'address';
    `);

    if (checkAddressColumn[0].length > 0) {
      const isNullable = checkAddressColumn[0][0].is_nullable === 'YES';
      
      if (!isNullable) {
        console.log("Coluna 'address' encontrada com restrição NOT NULL. Modificando...");
        
        // Modificar a restrição NOT NULL
        await sequelize.query(`
          ALTER TABLE customers 
          ALTER COLUMN address DROP NOT NULL;
        `);
        
        console.log("Restrição NOT NULL removida da coluna 'address'.");
      } else {
        console.log("Coluna 'address' já aceita valores NULL. Nenhuma alteração necessária.");
      }
    }

    // Verificar se as colunas de endereço têm restrições NOT NULL
    const addressColumns = ['street', 'number', 'district'];
    for (const column of addressColumns) {
      if (await columnExists('customers', column)) {
        const checkColumn = await sequelize.query(`
          SELECT column_name, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'customers' AND column_name = '${column}';
        `);
        
        if (checkColumn[0].length > 0) {
          const isNullable = checkColumn[0][0].is_nullable === 'YES';
          
          if (isNullable) {
            console.log(`Coluna '${column}' encontrada sem restrição NOT NULL. Modificando...`);
            
            // Adicionar a restrição NOT NULL
            await sequelize.query(`
              ALTER TABLE customers 
              ALTER COLUMN "${column}" SET NOT NULL;
            `);
            
            console.log(`Restrição NOT NULL adicionada à coluna '${column}'.`);
          }
        }
      }
    }
    
    console.log("Verificação e correção de restrições concluídas.");
  } catch (error) {
    console.error("Erro ao corrigir restrições de colunas:", error);
  }
}

// Função para criar dados de exemplo
async function createSampleData() {
  try {
    console.log("Criando dados de exemplo...");
    
    // Criar usuário administrador do sistema
    const adminPassword = await bcrypt.hash("admin123", 10);
    try {
      await sequelize.query(`
        INSERT INTO users (name, email, password, role, "organizationId")
        VALUES ('Admin', 'admin@finsfera.com', '${adminPassword}', 'system_admin', NULL)
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log("Usuário administrador criado ou já existente.");
    } catch (error) {
      console.error("Erro ao criar usuário administrador:", error);
    }
    
    // Criar organização de exemplo
    try {
      const orgResult = await sequelize.query(`
        INSERT INTO organizations (name, document, email, phone, address, city, state, "zipCode")
        VALUES ('Empresa Exemplo', '12.345.678/0001-00', 'contato@exemplo.com', '(11) 1234-5678', 'Rua Exemplo, 123', 'São Paulo', 'SP', '01234-567')
        ON CONFLICT DO NOTHING
        RETURNING id;
      `);
      
      const organizationId = orgResult[0][0]?.id;
      
      if (organizationId) {
        console.log(`Organização de exemplo criada com ID: ${organizationId}`);
        
        // Criar proprietário da organização
        const ownerPassword = await bcrypt.hash("owner123", 10);
        await sequelize.query(`
          INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
          VALUES ('Proprietário', 'owner@example.com', '${ownerPassword}', 'owner', ${organizationId}, true)
          ON CONFLICT (email) DO NOTHING;
        `);
        
        // Criar membros da equipe
        const memberPassword = await bcrypt.hash("member123", 10);
        await sequelize.query(`
          INSERT INTO users (name, email, password, role, "organizationId", "canSeeAllOS")
          VALUES 
            ('Gerente', 'gerente@example.com', '${memberPassword}', 'manager', ${organizationId}, true),
            ('Técnico 1', 'tecnico1@example.com', '${memberPassword}', 'technician', ${organizationId}, false),
            ('Técnico 2', 'tecnico2@example.com', '${memberPassword}', 'technician', ${organizationId}, false),
            ('Assistente', 'assistente@example.com', '${memberPassword}', 'assistant', ${organizationId}, false)
          ON CONFLICT (email) DO NOTHING;
        `);
        
        console.log("Usuários de exemplo criados com sucesso!");
        
        // Criar clientes de exemplo
        const customers = [
          {
            organizationId,
            name: "Empresa ABC Ltda",
            document: "12.345.678/0001-90",
            email: "contato@empresaabc.com",
            phone: "(11) 3333-4444",
            mobile: "(11) 98765-4321",
            company: "Empresa ABC",
            street: "Av. Paulista",
            number: "1000",
            complement: "Sala 123",
            district: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            contactPerson: "João Silva",
            notes: "Cliente desde 2020",
            plan: "ouro",
            active: true,
            address: "Av. Paulista, 1000"
          },
          {
            organizationId,
            name: "Maria Oliveira",
            document: "123.456.789-00",
            email: "maria@email.com",
            phone: "(11) 2222-3333",
            mobile: "(11) 97777-8888",
            company: "",
            street: "Rua das Flores",
            number: "123",
            complement: "Apto 45",
            district: "Jardim Europa",
            city: "São Paulo",
            state: "SP",
            zipCode: "04500-000",
            contactPerson: "",
            notes: "Cliente residencial",
            plan: "prata",
            active: true,
            address: "Rua das Flores, 123"
          },
          {
            organizationId,
            name: "Tech Solutions S.A.",
            document: "98.765.432/0001-10",
            email: "contato@techsolutions.com",
            phone: "(11) 5555-6666",
            mobile: "(11) 96666-7777",
            company: "Tech Solutions",
            street: "Rua Tecnológica",
            number: "500",
            complement: "Andar 10",
            district: "Vila Olímpia",
            city: "São Paulo",
            state: "SP",
            zipCode: "04550-000",
            contactPerson: "Carlos Mendes",
            notes: "Cliente VIP",
            plan: "vip",
            active: true,
            address: "Rua Tecnológica, 500"
          },
          {
            organizationId,
            name: "Digital Marketing Ltda",
            document: "45.678.901/0001-23",
            email: "contato@digitalmarketing.com",
            phone: "(11) 4444-5555",
            mobile: "(11) 95555-6666",
            company: "Digital Marketing",
            street: "Rua da Inovação",
            number: "789",
            complement: "Sala 45",
            district: "Itaim Bibi",
            city: "São Paulo",
            state: "SP",
            zipCode: "04538-000",
            contactPerson: "Ana Souza",
            notes: "Cliente novo",
            plan: "Tráfego Essencial",
            active: true,
            address: "Rua da Inovação, 789"
          },
          {
            organizationId,
            name: "E-commerce Brasil Ltda",
            document: "56.789.012/0001-34",
            email: "contato@ecommercebrasil.com",
            phone: "(11) 6666-7777",
            mobile: "(11) 94444-5555",
            company: "E-commerce Brasil",
            street: "Av. do Comércio",
            number: "456",
            complement: "Conjunto 78",
            district: "Brooklin",
            city: "São Paulo",
            state: "SP",
            zipCode: "04571-000",
            contactPerson: "Roberto Lima",
            notes: "Cliente em expansão",
            plan: "Tráfego Profissional",
            active: true,
            address: "Av. do Comércio, 456"
          },
          {
            organizationId,
            name: "Agência Web Premium",
            document: "67.890.123/0001-45",
            email: "contato@agenciawebpremium.com",
            phone: "(11) 7777-8888",
            mobile: "(11) 93333-4444",
            company: "Agência Web Premium",
            street: "Av. Berrini",
            number: "1500",
            complement: "Andar 15",
            district: "Berrini",
            city: "São Paulo",
            state: "SP",
            zipCode: "04571-010",
            contactPerson: "Fernanda Costa",
            notes: "Cliente premium",
            plan: "Tráfego Avançado",
            active: true,
            address: "Av. Berrini, 1500"
          }
        ];
        
        for (const customer of customers) {
          await sequelize.query(`
            INSERT INTO customers (
              "organizationId", name, document, email, phone, mobile, company,
              street, number, complement, district, city, state, "zipCode",
              "contactPerson", notes, plan, active, address, "createdAt", "updatedAt"
            ) VALUES (
              ${customer.organizationId}, '${customer.name}', '${customer.document}',
              '${customer.email}', '${customer.phone}', '${customer.mobile}', '${customer.company}',
              '${customer.street}', '${customer.number}', '${customer.complement}', '${customer.district}',
              '${customer.city}', '${customer.state}', '${customer.zipCode}',
              '${customer.contactPerson}', '${customer.notes}', '${customer.plan}',
              ${customer.active}, '${customer.address}', NOW(), NOW()
            ) ON CONFLICT DO NOTHING;
          `);
        }
        console.log("Clientes de exemplo criados.");
        
        // Obter IDs dos usuários
        const usersResult = await sequelize.query(`
          SELECT id, name, role FROM users WHERE "organizationId" = ${organizationId};
        `);
        
        const users = usersResult[0];
        const technicians = users.filter(u => u.role === 'technician');
        const manager = users.find(u => u.role === 'manager');
        
        // Obter IDs dos clientes
        const customersResult = await sequelize.query(`
          SELECT id, name FROM customers WHERE "organizationId" = ${organizationId};
        `);
        
        const customersData = customersResult[0];
        
        // Limpar ordens de serviço existentes
        await sequelize.query(`
          DELETE FROM service_orders WHERE "organizationId" = ${organizationId};
        `);
        
        // Criar ordens de serviço de exemplo
        if (technicians.length > 0 && manager && customersData.length > 0) {
          const serviceOrders = [
            {
              title: "Manutenção Preventiva #1",
              description: "Realizar manutenção preventiva nos equipamentos de rede.",
              status: "pendente",
              priority: "media",
              assignedToId: technicians[0].id,
              assignedByUserId: manager.id,
              scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Amanhã
              customerId: customersData[0].id
            },
            {
              title: "Manutenção Corretiva #2",
              description: "Corrigir problemas no servidor principal.",
              status: "em_andamento",
              priority: "alta",
              assignedToId: technicians[0].id,
              assignedByUserId: manager.id,
              scheduledDate: new Date(Date.now() + 172800000).toISOString(), // 2 dias depois
              customerId: customersData[1].id
            },
            {
              title: "Instalação de Software #3",
              description: "Instalar e configurar novo sistema ERP.",
              status: "pendente",
              priority: "baixa",
              assignedToId: technicians[1].id,
              assignedByUserId: manager.id,
              scheduledDate: new Date(Date.now() + 259200000).toISOString(), // 3 dias depois
              customerId: customersData[2].id
            },
            {
              title: "Suporte Remoto #4",
              description: "Fornecer suporte remoto para problemas de conectividade.",
              status: "concluida",
              priority: "media",
              assignedToId: technicians[1].id,
              assignedByUserId: manager.id,
              scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Ontem
              customerId: customersData[0].id,
              closedAt: new Date().toISOString()
            },
            {
              title: "Atualização de Sistema #5",
              description: "Atualizar sistema operacional em todos os computadores.",
              status: "pendente",
              priority: "urgente",
              assignedToId: technicians[0].id,
              assignedByUserId: manager.id,
              scheduledDate: new Date(Date.now() + 345600000).toISOString(), // 4 dias depois
              customerId: customersData[2].id
            }
          ];
          
          for (const order of serviceOrders) {
            await sequelize.query(`
              INSERT INTO service_orders (
                "organizationId", title, description, status, priority,
                "assignedToId", "assignedByUserId", "scheduledDate", "customerId",
                "closedAt", "createdAt", "updatedAt"
              ) VALUES (
                ${organizationId}, '${order.title}', '${order.description}',
                '${order.status}', '${order.priority}', ${order.assignedToId},
                ${order.assignedByUserId}, '${order.scheduledDate}', ${order.customerId},
                ${order.closedAt ? `'${order.closedAt}'` : null}, NOW(), NOW()
              );
            `);
          }
          console.log("Ordens de serviço de exemplo criadas com sucesso!");
        }
      }
    } catch (error) {
      console.error("Erro ao criar organização de exemplo:", error);
    }
  } catch (error) {
    console.error("Erro ao criar dados de exemplo:", error);
  }
}

// Função principal para configurar o banco de dados
async function setupDatabase() {
  try {
    console.log("Iniciando configuração do banco de dados...");
    console.log("Conectando ao banco de dados...");
    
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
    
    // Criar ENUMs
    await createENUMs();
    
    // Tentar remover tabelas existentes (opcional, pode falhar em alguns provedores)
    try {
      await dropTablesIfExist();
    } catch (error) {
      console.log("Aviso: Não foi possível remover tabelas existentes. Continuando com a criação...");
    }
    
    // Criar tabelas
    await createTables();
    
    // Corrigir restrições de colunas
    await fixColumnConstraints();
    
    // Criar dados de exemplo
    await createSampleData();
    
    console.log("=============================================");
    console.log("Banco de dados configurado com sucesso!");
    console.log("=============================================");
    console.log("");
    console.log("Credenciais de acesso:");
    console.log("  Email: admin@finsfera.com");
    console.log("  Senha: admin123");
    console.log("");
    console.log("Proprietário da Empresa Exemplo:");
    console.log("  Email: owner@example.com");
    console.log("  Senha: owner123");
    console.log("");
    console.log("Outros usuários:");
    console.log("  Email: gerente@example.com, tecnico1@example.com, tecnico2@example.com, assistente@example.com");
    console.log("  Senha: member123");
    console.log("=============================================");
  } catch (error) {
    console.error("Erro durante a configuração do banco de dados:", error);
  } finally {
    await sequelize.close();
  }
}

// Executar a função principal
setupDatabase()
  .then(() => {
    console.log("Script finalizado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro ao executar o script:", error);
    process.exit(1);
  });