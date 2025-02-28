import sequelize, { testConnection } from "../lib/db";
import User from "../models/User";

async function initDB() {
  try {
    // Testa a conexão com o banco de dados
    await testConnection();

    // Sincroniza os modelos com o banco de dados
    console.log("Sincronizando modelos com o banco de dados...");

    // Força a recriação das tabelas (use com cuidado em produção)
    await sequelize.sync({ force: true });

    console.log("Sincronização concluída!");

    // Cria um usuário de exemplo
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

// Executa a função de inicialização
initDB();
