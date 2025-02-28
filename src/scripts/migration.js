// Importa as dependências
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Configuração da conexão com o banco de dados Neon
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/staging?sslmode=require";

// Verifica se estamos em ambiente de produção
const isProduction = process.env.NODE_ENV === "production";
console.log(
  `Executando em ambiente: ${isProduction ? "PRODUÇÃO" : "desenvolvimento"}`
);

// Opções do Sequelize
const sequelizeOptions = {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: isProduction,
    },
  },
  logging: isProduction ? false : console.log,
};

// Inicializa a conexão
const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);

// Define o modelo de usuário
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
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Função para aplicar migrações
async function applyMigrations() {
  try {
    // Testa a conexão
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Em produção, usamos alter ao invés de force
    // alter: true - mantém os dados e atualiza a estrutura se necessário
    // force: true - apaga e recria as tabelas (NUNCA use em produção com dados reais)
    const syncOptions = {
      alter: isProduction ? true : false,
      force: isProduction ? false : true,
    };

    console.log(
      `Sincronizando modelos com o banco de dados... (${JSON.stringify(
        syncOptions
      )})`
    );
    await sequelize.sync(syncOptions);
    console.log("Sincronização concluída!");

    // Verifica se precisamos criar um usuário admin
    const adminExists = await User.findOne({
      where: { email: "admin@exemplo.com" },
    });

    if (!adminExists) {
      console.log("Criando usuário admin...");
      await User.create({
        name: "Administrador",
        email: "admin@exemplo.com",
        password: "senha123",
      });
      console.log("Usuário admin criado com sucesso!");
    } else {
      console.log("Usuário admin já existe, pulando criação.");
    }

    console.log("Migrações aplicadas com sucesso!");
  } catch (error) {
    console.error("Erro ao aplicar migrações:", error);
  } finally {
    // Fecha a conexão
    await sequelize.close();
  }
}

// Executa a migração
applyMigrations();
