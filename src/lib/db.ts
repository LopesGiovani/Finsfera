import { Sequelize, Options } from "sequelize";

// Configuração da conexão com o banco de dados Neon (PostgreSQL)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://seu-usuario:sua-senha@seu-host:porta/seu-database";

// Ambiente de execução
const isProduction = process.env.NODE_ENV === "production";

// Opções de configuração do Sequelize
const sequelizeOptions: Options = {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      // Em produção, rejeitamos certificados não confiáveis para maior segurança
      rejectUnauthorized: isProduction,
    },
  },
  // Em produção, desativamos os logs de SQL
  logging: isProduction ? false : console.log,
};

// Inicializa a conexão com o banco de dados
const sequelize = new Sequelize(DATABASE_URL, sequelizeOptions);

// Função para testar a conexão com o banco de dados
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(
      `Conexão com o banco de dados estabelecida com sucesso! (${
        isProduction ? "Produção" : "Desenvolvimento"
      })`
    );
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
    throw error;
  }
};

export default sequelize;
