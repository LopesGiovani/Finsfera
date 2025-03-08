const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
require("dotenv").config();

console.log("=".repeat(60));
console.log("             EXECUTANDO MIGRAÇÕES             ");
console.log("=".repeat(60));

// Configurar conexão do banco de dados
const host =
  process.env.PGHOST || "ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech";
const database = process.env.PGDATABASE || "production";
const username = process.env.PGUSER || "neondb_owner";
const password = process.env.PGPASSWORD || "npg_UXBQzj8cEv6h";
const DATABASE_URL = `postgres://${username}:${password}@${host}/${database}?sslmode=require`;

console.log(`Host: ${host}`);
console.log(`Database: ${database}`);

// Criar uma instância do Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  logging: false,
  // Definir explicitamente o schema para evitar problemas com consultas information_schema
  schema: "public",
});

// Configurar o Umzug para gerenciar migrações
const umzug = new Umzug({
  migrations: { glob: "src/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Função para dar sugestões úteis sobre erros comuns
function getSuggestions(error) {
  const errorMessage = error.message || "";
  const suggestions = [];

  if (errorMessage.includes("already exists")) {
    suggestions.push(
      "• A tabela ou coluna já existe. Você pode executar o script master-database-setup.js para uma configuração completa."
    );
  }

  if (
    errorMessage.includes("relation") &&
    errorMessage.includes("does not exist")
  ) {
    suggestions.push(
      "• A tabela mencionada não existe. Verifique se o banco de dados foi inicializado corretamente."
    );
    suggestions.push("• Execute npm run initdb para criar as tabelas básicas.");
  }

  if (errorMessage.includes("permission denied")) {
    suggestions.push(
      "• O usuário não tem permissão suficiente no banco. Verifique suas credenciais."
    );
    suggestions.push(
      "• Você pode precisar conceder permissões adicionais ao usuário do banco de dados."
    );
  }

  return suggestions.length
    ? suggestions.join("\n")
    : "Nenhuma sugestão específica disponível.";
}

// Função principal para executar as migrações
async function runMigrations() {
  try {
    // Testar a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");

    console.log("\nIniciando migrações...");
    try {
      const migrations = await umzug.up();

      if (migrations.length > 0) {
        console.log(
          `✅ Migrações executadas com sucesso: ${migrations
            .map((m) => m.name)
            .join(", ")}`
        );
      } else {
        console.log("🟡 Nenhuma migração pendente.");
      }

      return true;
    } catch (migrationError) {
      console.error("❌ Erro ao executar migrações:", migrationError.message);

      // Mostrar mais detalhes do erro para facilitar o debug
      if (migrationError.cause) {
        console.error("\nDetalhes do erro:");
        console.error(
          `- Arquivo: ${migrationError.migration?.name || "Desconhecido"}`
        );
        console.error(`- Causa: ${migrationError.cause.message}`);
        console.error(
          `- Stack: ${migrationError.cause.stack
            .split("\n")
            .slice(0, 3)
            .join("\n")}`
        );

        // Adicionar sugestões úteis
        console.error("\nSugestões para resolver o problema:");
        console.error(getSuggestions(migrationError.cause));
      }

      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:", error.message);
    return false;
  } finally {
    // Fechar conexão
    await sequelize.close();
    console.log("\n🔒 Conexão com o banco de dados fechada.");
  }
}

// Executar as migrações
runMigrations()
  .then((success) => {
    if (success) {
      console.log("\n" + "=".repeat(60));
      console.log("          MIGRAÇÕES CONCLUÍDAS COM SUCESSO          ");
      console.log("=".repeat(60));
      process.exit(0);
    } else {
      console.log("\n" + "=".repeat(60));
      console.log("          ERRO AO EXECUTAR MIGRAÇÕES          ");
      console.log("=".repeat(60));
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Erro crítico:", err);
    process.exit(1);
  });
