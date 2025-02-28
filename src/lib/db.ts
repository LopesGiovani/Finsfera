import { Sequelize, Options } from "sequelize";

// Configuração da conexão com o banco de dados Neon (PostgreSQL)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/production?sslmode=require";

// Log para debug
console.log("DATABASE_URL:", DATABASE_URL.substring(0, 30) + "...");

// Ambiente de execução
const isProduction = process.env.NODE_ENV === "production";

// Opções de configuração do Sequelize para Neon DB
const sequelizeOptions: Options = {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      // Em produção, rejeitamos certificados não confiáveis para maior segurança
      // No Neon DB, recomenda-se manter rejectUnauthorized como true em todos os ambientes
      rejectUnauthorized: true,
    },
  },
  // Em produção, desativamos os logs de SQL
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

// Função para testar a conexão com o banco de dados
export const testConnection = async (): Promise<void> => {
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
};

// Exporta a instância do Sequelize para uso nos modelos
export default sequelize;
