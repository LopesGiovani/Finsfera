/**
 * Script para gerar uma chave JWT segura
 * Execute com: node src/scripts/generate-secret.js
 */

const crypto = require("crypto");

// Gera uma chave aleatória de 32 bytes e converte para hexadecimal
const secret = crypto.randomBytes(32).toString("hex");

console.log("\n=== CHAVE JWT SECRETA GERADA ===");
console.log(secret);
console.log(
  "\nCopie esta chave para sua variável JWT_SECRET no arquivo .env.production ou na configuração da Vercel."
);
console.log(
  "IMPORTANTE: Mantenha esta chave em segredo e não a compartilhe no controle de versão.\n"
);
