// Importa as dependências
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

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
async function initDB() {
  try {
    // Testa a conexão
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Sincroniza os modelos
    console.log("Sincronizando modelos com o banco de dados...");
    await sequelize.sync({ force: true });
    console.log("Sincronização concluída!");

    // Cria um usuário administrador
    console.log("Criando usuário admin...");
    await User.create({
      name: "Administrador",
      email: "admin@exemplo.com",
      password: "senha123",
    });
    console.log("Usuário admin criado com sucesso!");

    console.log("Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  } finally {
    // Fecha a conexão
    await sequelize.close();
  }
}

// Executa a inicialização
initDB();
