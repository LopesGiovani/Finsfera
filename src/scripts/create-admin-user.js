// Importar os módulos necessários
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

// Configuração da conexão com o banco de dados Neon (PostgreSQL)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/production?sslmode=require";

// Ambiente de execução
const isProduction = process.env.NODE_ENV === "production";

// Opções de configuração do Sequelize para Neon DB
const sequelizeOptions = {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  logging: isProduction ? false : console.log,
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
};

// Inicializa a conexão com o banco de dados
const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);

// Define o modelo de usuário diretamente no script
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
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Função para verificar se a senha está correta
User.prototype.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Função para testar a conexão com o banco de dados
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(
      `Conexão com o banco de dados Neon estabelecida com sucesso! (${
        isProduction ? "Produção" : "Desenvolvimento"
      })`
    );
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados Neon:", error);
    throw error;
  }
}

// Função para criar o usuário administrador
async function createAdminUser() {
  try {
    // Testa a conexão com o banco de dados
    await testConnection();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    // Verifica se já existe um usuário com o email admin@exemplo.com
    const existingUser = await User.findOne({
      where: { email: "admin@exemplo.com" },
    });

    if (existingUser) {
      console.log("Usuário administrador já existe. Atualizando senha...");

      // Atualiza a senha para "admin123"
      await existingUser.update({ password: "admin123" });
      console.log("Senha do usuário administrador atualizada com sucesso!");
      return;
    }

    // Cria o usuário administrador
    const adminUser = await User.create({
      name: "Administrador",
      email: "admin@exemplo.com",
      password: "admin123", // A senha será hash automaticamente pelo hook beforeCreate
    });

    console.log("Usuário administrador criado com sucesso:");
    console.log({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
    });
  } catch (error) {
    console.error("Erro ao criar usuário administrador:", error);
  } finally {
    // Encerra o processo
    process.exit(0);
  }
}

// Executa a função
createAdminUser();
