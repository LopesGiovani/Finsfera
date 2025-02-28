// Importa as dependências
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connection = require("../database/connection");

// Configuração da conexão com o banco de dados Neon
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/staging?sslmode=require";

// Opções do Sequelize
const sequelizeOptions = {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
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

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    console.log("Conectando ao banco de dados...");
    await connection.authenticate();
    console.log("Conexão estabelecida com sucesso!");

    console.log("Sincronizando modelos com o banco de dados...");
    await connection.sync({ force: true });
    console.log("Modelos sincronizados com sucesso!");

    // Verificar se já existe um usuário proprietário
    const existingOwner = await User.findOne({
      where: { role: "owner" },
    });

    if (!existingOwner) {
      console.log("Criando usuário proprietário inicial...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "Administrador",
        email: "admin@finsfera.com",
        password: hashedPassword,
        role: "owner",
        status: "active",
      });
      console.log("Usuário proprietário criado com sucesso!");
      console.log("----------------------------------------------------");
      console.log("Credenciais do proprietário:");
      console.log("Email: admin@finsfera.com");
      console.log("Senha: admin123");
      console.log("----------------------------------------------------");
      console.log(
        "IMPORTANTE: Altere estas credenciais após o primeiro login!"
      );
    } else {
      console.log("Usuário proprietário já existe, pulando criação.");
    }

    console.log("Inicialização do banco de dados concluída com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro durante a inicialização do banco de dados:", error);
    process.exit(1);
  }
}

// Executa a inicialização
initializeDatabase();
