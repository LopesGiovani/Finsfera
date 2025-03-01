/**
 * Script para remover usuários de teste
 * Este script identifica e remove (ou desativa) usuários de teste criados anteriormente
 */
const { Sequelize, Op } = require("sequelize");

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

// Função para verificar se a tabela existe
async function tableExists(tableName) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ?
      );
    `;
    const [result] = await sequelize.query(query, {
      replacements: [tableName],
      type: Sequelize.QueryTypes.SELECT,
    });
    return result.exists;
  } catch (error) {
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
    return false;
  }
}

// Função principal para remover usuários de teste
async function removeTestUsers() {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Verifica se as tabelas necessárias existem
    const usersTableExists = await tableExists("users");
    const orgsTableExists = await tableExists("organizations");

    if (!usersTableExists) {
      console.error("A tabela 'users' não existe!");
      return;
    }

    console.log("Removendo usuários de teste...");

    // Lista de padrões de email para identificar usuários de teste
    const testEmailPatterns = [
      "%teste@example.com",
      "%tecnico.teste%@example.com",
      "%assistente.teste%@example.com",
      "%gerente.teste@example.com",
      "%tecnico.orgteste%@example.com",
      "%assistente.orgteste%@example.com",
      "%gerente.orgteste@example.com",
      "%dono.teste@example.com",
      "%inativo@example.com",
    ];

    // Modo de remoção: 'deactivate' apenas desativa, 'delete' remove completamente
    const removalMode = process.argv[2] === "delete" ? "delete" : "deactivate";

    if (removalMode === "deactivate") {
      console.log(
        "Modo: Desativação - Os usuários serão marcados como inativos"
      );

      // Conta quantos usuários serão afetados
      const [affectedUsers] = await sequelize.query(`
        SELECT COUNT(*) FROM users
        WHERE email ILIKE ANY(ARRAY[${testEmailPatterns
          .map((p) => `'${p}'`)
          .join(", ")}])
      `);

      const count = parseInt(affectedUsers[0].count);
      console.log(`${count} usuários de teste encontrados para desativação.`);

      if (count > 0) {
        // Desativa os usuários de teste
        await sequelize.query(`
          UPDATE users
          SET active = false
          WHERE email ILIKE ANY(ARRAY[${testEmailPatterns
            .map((p) => `'${p}'`)
            .join(", ")}])
        `);

        console.log(
          `${count} usuários de teste foram desativados com sucesso!`
        );
      }
    } else {
      console.log(
        "Modo: Exclusão - Os usuários serão removidos permanentemente"
      );

      // Primeiro, identifica a organização de teste para remover depois
      let testOrgId = null;
      if (orgsTableExists) {
        const [testOrgs] = await sequelize.query(`
          SELECT id FROM organizations
          WHERE name = 'Organização de Teste'
        `);

        if (testOrgs.length > 0) {
          testOrgId = testOrgs[0].id;
        }
      }

      // Conta quantos usuários serão excluídos
      const [affectedUsers] = await sequelize.query(`
        SELECT COUNT(*) FROM users
        WHERE email ILIKE ANY(ARRAY[${testEmailPatterns
          .map((p) => `'${p}'`)
          .join(", ")}])
      `);

      const count = parseInt(affectedUsers[0].count);
      console.log(`${count} usuários de teste encontrados para exclusão.`);

      if (count > 0) {
        // Exclui os usuários de teste
        await sequelize.query(`
          DELETE FROM users
          WHERE email ILIKE ANY(ARRAY[${testEmailPatterns
            .map((p) => `'${p}'`)
            .join(", ")}])
        `);

        console.log(`${count} usuários de teste foram excluídos com sucesso!`);
      }

      // Remove a organização de teste se foi encontrada
      if (testOrgId && orgsTableExists) {
        console.log(`Removendo organização de teste (ID: ${testOrgId})...`);
        await sequelize.query(`
          DELETE FROM organizations
          WHERE id = ${testOrgId}
        `);
        console.log("Organização de teste removida com sucesso!");
      }
    }

    console.log("Operação concluída!");
  } catch (error) {
    console.error("Erro ao remover usuários de teste:", error);
  } finally {
    // Fecha a conexão com o banco de dados
    await sequelize.close();
  }
}

// Exibe instruções de uso
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("\nRemoveTestUsers - Script para remover usuários de teste\n");
  console.log("Uso:");
  console.log("  node removeTestUsers.js [mode]");
  console.log("\nOpções:");
  console.log("  deactivate  Apenas desativa os usuários de teste (padrão)");
  console.log(
    "  delete      Remove permanentemente os usuários de teste e a organização de teste"
  );
  console.log("\nExemplos:");
  console.log(
    "  node removeTestUsers.js              # Desativa usuários de teste"
  );
  console.log(
    "  node removeTestUsers.js deactivate   # Desativa usuários de teste"
  );
  console.log(
    "  node removeTestUsers.js delete       # Exclui usuários de teste"
  );
} else {
  // Executa a função principal
  removeTestUsers();
}
