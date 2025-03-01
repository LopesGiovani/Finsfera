/**
 * Script para inicializar o banco de dados
 * Este script criará todas as tabelas necessárias e populará dados iniciais básicos
 */
const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");

// URL de conexão com o banco de dados
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/production?sslmode=require";

// Inicializa o Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  logging: false,
});

// Definição simplificada dos modelos para criação das tabelas

// Modelo: Organization
const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Temporariamente nullable para criação inicial
    },
  },
  {
    tableName: "organizations",
    timestamps: true,
  }
);

// Modelo: User
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "system_admin",
        "owner",
        "manager",
        "technician",
        "assistant"
      ),
      allowNull: false,
      defaultValue: "assistant",
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    canSeeAllOS: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Modelo: ServiceOrder
const ServiceOrder = sequelize.define(
  "ServiceOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pendente",
        "em_andamento",
        "concluida",
        "reprovada"
      ),
      defaultValue: "pendente",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("baixa", "media", "alta", "urgente"),
      defaultValue: "media",
      allowNull: false,
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assignedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    leaveOpenReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transferHistory: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "service_orders",
    timestamps: true,
  }
);

// Modelo: ServiceOrderAttachment
const ServiceOrderAttachment = sequelize.define(
  "ServiceOrderAttachment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serviceOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "service_orders",
        key: "id",
      },
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "service_order_attachments",
    timestamps: true,
  }
);

// Modelo: Customer
const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan: {
      type: DataTypes.ENUM("prata", "ouro", "vip"),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "customers",
    timestamps: true,
  }
);

// Função para inicializar o banco de dados
async function initDB() {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Sincroniza os modelos com o banco de dados (cria as tabelas se não existirem)
    console.log("Criando tabelas...");
    await sequelize.sync({ force: true }); // force: true recria todas as tabelas (use com cuidado em produção)
    console.log("Tabelas criadas com sucesso!");

    // Cria o usuário administrador do sistema
    console.log("Criando usuário administrador do sistema...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const systemAdmin = await User.create({
      name: "Administrador do Sistema",
      email: "admin@finsfera.com",
      password: adminPassword,
      role: "system_admin",
      active: true,
    });
    console.log("Usuário administrador do sistema criado com sucesso!");

    // Cria uma organização de exemplo e seu proprietário
    console.log("Criando organização e proprietário de exemplo...");
    const organization = await Organization.create({
      name: "Empresa Exemplo",
      document: "12.345.678/0001-90",
    });

    const ownerPassword = await bcrypt.hash("owner123", 10);
    const owner = await User.create({
      name: "Proprietário",
      email: "owner@example.com",
      password: ownerPassword,
      role: "owner",
      organizationId: organization.id,
      canSeeAllOS: true,
      active: true,
    });

    // Atualiza a organização com o ID do proprietário
    await organization.update({ ownerId: owner.id });
    console.log("Organização e proprietário criados com sucesso!");

    // Cria membros da equipe de exemplo
    console.log("Criando membros da equipe de exemplo...");
    const memberPassword = await bcrypt.hash("member123", 10);

    // Gerente
    const manager = await User.create({
      name: "Gerente",
      email: "gerente@example.com",
      password: memberPassword,
      role: "manager",
      organizationId: organization.id,
      canSeeAllOS: true,
      active: true,
    });

    // Técnicos
    const tech1 = await User.create({
      name: "Técnico 1",
      email: "tecnico1@example.com",
      password: memberPassword,
      role: "technician",
      organizationId: organization.id,
      canSeeAllOS: false,
      active: true,
    });

    const tech2 = await User.create({
      name: "Técnico 2",
      email: "tecnico2@example.com",
      password: memberPassword,
      role: "technician",
      organizationId: organization.id,
      canSeeAllOS: false,
      active: true,
    });

    // Assistente
    const assistant = await User.create({
      name: "Assistente",
      email: "assistente@example.com",
      password: memberPassword,
      role: "assistant",
      organizationId: organization.id,
      canSeeAllOS: false,
      active: true,
    });
    console.log("Membros da equipe criados com sucesso!");

    // Cria algumas ordens de serviço de exemplo
    console.log("Criando ordens de serviço de exemplo...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // OS 1 - Para hoje
    await ServiceOrder.create({
      organizationId: organization.id,
      title: "Manutenção de Equipamento",
      description: "Realizar manutenção preventiva no equipamento XYZ.",
      status: "pendente",
      priority: "media",
      assignedToId: tech1.id,
      assignedByUserId: manager.id,
      scheduledDate: today,
    });

    // OS 2 - Para hoje
    await ServiceOrder.create({
      organizationId: organization.id,
      title: "Reparo de Sistema",
      description: "Corrigir problemas no sistema de faturamento.",
      status: "em_andamento",
      priority: "alta",
      assignedToId: tech1.id,
      assignedByUserId: owner.id,
      scheduledDate: today,
    });

    // OS 3 - Para amanhã
    await ServiceOrder.create({
      organizationId: organization.id,
      title: "Instalação de Software",
      description:
        "Instalar novo software contábil nos computadores do setor financeiro.",
      status: "pendente",
      priority: "baixa",
      assignedToId: tech2.id,
      assignedByUserId: manager.id,
      scheduledDate: tomorrow,
    });
    console.log("Ordens de serviço criadas com sucesso!");

    // Cria alguns clientes de exemplo
    console.log("Criando clientes de exemplo...");

    // Cliente 1
    await Customer.create({
      organizationId: organization.id,
      name: "Empresa ABC Ltda",
      document: "12.345.678/0001-99",
      email: "contato@empresaabc.com",
      phone: "(11) 98765-4321",
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      contactPerson: "João Silva",
      notes: "Cliente preferencial",
      plan: "ouro",
      active: true,
    });

    // Cliente 2
    await Customer.create({
      organizationId: organization.id,
      name: "Comércio XYZ Ltda",
      document: "98.765.432/0001-10",
      email: "atendimento@comercioxyz.com",
      phone: "(11) 91234-5678",
      address: "Rua Augusta, 500",
      city: "São Paulo",
      state: "SP",
      zipCode: "01305-000",
      contactPerson: "Maria Oliveira",
      notes: "Cliente novo",
      plan: "prata",
      active: true,
    });

    // Cliente 3
    await Customer.create({
      organizationId: organization.id,
      name: "Indústria 123 S.A.",
      document: "45.678.901/0001-23",
      email: "vendas@industria123.com",
      phone: "(11) 97890-1234",
      address: "Rod. Anhanguera, km 25",
      city: "Osasco",
      state: "SP",
      zipCode: "06000-000",
      contactPerson: "Roberto Ferreira",
      notes: "Grande cliente",
      plan: "vip",
      active: true,
    });

    console.log("Clientes criados com sucesso!");

    console.log("Banco de dados inicializado com sucesso!");
    console.log("\nCredenciais de acesso:");
    console.log("Administrador do Sistema:");
    console.log("  Email: admin@finsfera.com");
    console.log("  Senha: admin123");
    console.log("\nProprietário da Empresa Exemplo:");
    console.log("  Email: owner@example.com");
    console.log("  Senha: owner123");
    console.log("\nOutros usuários:");
    console.log(
      "  Email: gerente@example.com, tecnico1@example.com, tecnico2@example.com, assistente@example.com"
    );
    console.log("  Senha: member123");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executa a função de inicialização
initDB();
