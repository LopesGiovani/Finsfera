// Importar os módulos necessários
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Carregar variáveis de ambiente do arquivo .env.local
try {
  const envFilePath = path.resolve(process.cwd(), ".env.local");
  const envConfig = fs.readFileSync(envFilePath, "utf8");

  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";

      // Remover comentários
      if (value.startsWith("#")) {
        value = "";
      }

      // Remover aspas
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  });

  console.log("Variáveis de ambiente carregadas com sucesso de .env.local");
} catch (error) {
  console.error("Erro ao carregar variáveis de ambiente:", error);
}

// Configuração da conexão com o banco de dados Neon (PostgreSQL)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/production?sslmode=require";

console.log("DATABASE_URL:", DATABASE_URL.substring(0, 30) + "...");

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
    return true;
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados Neon:", error);
    return false;
  }
}

// Função para configurar o banco de dados
async function setupDatabase() {
  try {
    // Testa a conexão com o banco de dados
    const connected = await testConnection();
    if (!connected) {
      console.error("Não foi possível conectar ao banco de dados. Saindo...");
      process.exit(1);
    }

    console.log("Sincronizando modelos com o banco de dados...");
    // Sincroniza o modelo com o banco de dados (isso cria a tabela se não existir)
    await User.sync({ force: true });
    console.log("Tabela de usuários criada/recriada com sucesso!");

    // Cria o usuário administrador
    const adminUser = await User.create({
      name: "Administrador",
      email: "admin@exemplo.com",
      password: "admin123",
    });

    console.log("Usuário administrador criado com sucesso:");
    console.log({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
    });

    console.log("Configuração do banco de dados concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao configurar o banco de dados:", error);
  } finally {
    // Encerra o processo
    process.exit(0);
  }
}

// Executa a função para configurar o banco de dados
setupDatabase();
