const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
require("dotenv").config({ path: ".env.local" });

// Configurar conexão do banco de dados
const host = process.env.PGHOST;
const database = process.env.PGDATABASE;
const username = process.env.PGUSER;
const password = process.env.PGPASSWORD;

// Criar uma instância do Sequelize
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

// Configurar o Umzug para gerenciar migrações
const umzug = new Umzug({
  migrations: { glob: "src/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Função principal para executar as migrações
async function runMigrations() {
  try {
    // Testar a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    console.log("Iniciando migrações...");
    const migrations = await umzug.up();

    if (migrations.length > 0) {
      console.log(
        `Migrações executadas com sucesso: ${migrations
          .map((m) => m.name)
          .join(", ")}`
      );
    } else {
      console.log("Nenhuma migração pendente.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
    process.exit(1);
  }
}

// Executar as migrações
runMigrations();
