import { testConnection } from "@/lib/db";
import User from "@/models/User";

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
