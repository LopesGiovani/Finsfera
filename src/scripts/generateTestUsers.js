/**
 * Script para gerar usuários de teste
 * Este script cria usuários de teste com diferentes funções em organizações específicas
 */
const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");

// URL de conexão com o banco de dados
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/staging?sslmode=require";

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

// Definições simplificadas dos modelos
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
      allowNull: true,
    },
  },
  {
    tableName: "organizations",
    timestamps: true,
  }
);

// Função para gerar usuários de teste
async function generateTestUsers() {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Senha padrão para todos os usuários de teste
    const password = await bcrypt.hash("teste123", 10);

    // Contador para usuários criados
    let usersCreated = 0;

    // 1. Criar usuários para a organização existente (obtém a primeira organização)
    const existingOrganization = await Organization.findOne();

    if (existingOrganization) {
      console.log(
        `Criando usuários de teste para organização existente: ${existingOrganization.name}`
      );

      // Cria um gerente de teste
      await User.create({
        name: "Gerente de Teste",
        email: "gerente.teste@example.com",
        password,
        role: "manager",
        organizationId: existingOrganization.id,
        canSeeAllOS: true,
        active: true,
      });
      usersCreated++;

      // Cria técnicos de teste
      for (let i = 1; i <= 3; i++) {
        await User.create({
          name: `Técnico de Teste ${i}`,
          email: `tecnico.teste${i}@example.com`,
          password,
          role: "technician",
          organizationId: existingOrganization.id,
          canSeeAllOS: i === 1, // Apenas o primeiro técnico pode ver todas as OS
          active: true,
        });
        usersCreated++;
      }

      // Cria assistentes de teste
      for (let i = 1; i <= 2; i++) {
        await User.create({
          name: `Assistente de Teste ${i}`,
          email: `assistente.teste${i}@example.com`,
          password,
          role: "assistant",
          organizationId: existingOrganization.id,
          canSeeAllOS: false,
          active: true,
        });
        usersCreated++;
      }
    }

    // 2. Criar uma nova organização de teste com seus próprios usuários
    const newTestOrg = await Organization.create({
      name: "Organização de Teste",
      document: "98.765.432/0001-10",
    });

    // Cria o dono da organização
    const owner = await User.create({
      name: "Dono da Organização de Teste",
      email: "dono.teste@example.com",
      password,
      role: "owner",
      organizationId: newTestOrg.id,
      canSeeAllOS: true,
      active: true,
    });
    usersCreated++;

    // Atualiza a organização com o ID do dono
    await newTestOrg.update({ ownerId: owner.id });

    // Cria um gerente de teste para a nova organização
    await User.create({
      name: "Gerente da Org Teste",
      email: "gerente.orgteste@example.com",
      password,
      role: "manager",
      organizationId: newTestOrg.id,
      canSeeAllOS: true,
      active: true,
    });
    usersCreated++;

    // Cria técnicos e assistentes para a nova organização
    for (let i = 1; i <= 2; i++) {
      await User.create({
        name: `Técnico Org Teste ${i}`,
        email: `tecnico.orgteste${i}@example.com`,
        password,
        role: "technician",
        organizationId: newTestOrg.id,
        canSeeAllOS: false,
        active: true,
      });
      usersCreated++;

      await User.create({
        name: `Assistente Org Teste ${i}`,
        email: `assistente.orgteste${i}@example.com`,
        password,
        role: "assistant",
        organizationId: newTestOrg.id,
        canSeeAllOS: false,
        active: true,
      });
      usersCreated++;
    }

    // 3. Criar um usuário inativo para testar filtragem
    await User.create({
      name: "Usuário Inativo",
      email: "inativo@example.com",
      password,
      role: "technician",
      organizationId: existingOrganization
        ? existingOrganization.id
        : newTestOrg.id,
      canSeeAllOS: false,
      active: false,
    });
    usersCreated++;

    console.log(
      `Total de ${usersCreated} usuários de teste criados com sucesso!`
    );
    console.log("\nCredenciais de acesso para todos os usuários de teste:");
    console.log("  Senha: teste123");
    console.log("\nEmails dos usuários criados:");

    if (existingOrganization) {
      console.log("Organização existente:");
      console.log("  gerente.teste@example.com");
      console.log(
        "  tecnico.teste1@example.com, tecnico.teste2@example.com, tecnico.teste3@example.com"
      );
      console.log(
        "  assistente.teste1@example.com, assistente.teste2@example.com"
      );
    }

    console.log("Nova organização de teste:");
    console.log("  dono.teste@example.com");
    console.log("  gerente.orgteste@example.com");
    console.log(
      "  tecnico.orgteste1@example.com, tecnico.orgteste2@example.com"
    );
    console.log(
      "  assistente.orgteste1@example.com, assistente.orgteste2@example.com"
    );
    console.log("\nUsuário inativo para teste:");
    console.log("  inativo@example.com");
  } catch (error) {
    console.error("Erro ao gerar usuários de teste:", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executa a função para gerar usuários de teste
generateTestUsers();
