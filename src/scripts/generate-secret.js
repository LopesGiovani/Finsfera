/**
 * Script para gerar uma chave JWT segura
 * Execute com: node src/scripts/generate-secret.js
 */

// Importa o módulo de criptografia do Node.js
const crypto = require("crypto");

// Função para gerar uma chave secreta forte
function generateJwtSecret() {
  // Gera 32 bytes de dados aleatórios e converte para string hexadecimal
  const secret = crypto.randomBytes(32).toString("hex");

  console.log("\n=== JWT SECRET GERADA ===");
  console.log(secret);
  console.log("\nAdicione esta chave ao seu arquivo .env.local:");
  console.log(`JWT_SECRET=${secret}\n`);
  console.log(
    "MANTENHA ESTA CHAVE EM SEGURANÇA! Nunca a compartilhe ou cometa no GitHub."
  );
}

// Executa a função
generateJwtSecret();
