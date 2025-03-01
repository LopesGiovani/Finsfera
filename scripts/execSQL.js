const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const client = new Client({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Conectando ao banco de dados...");
    await client.connect();
    console.log("Conexão estabelecida com sucesso!");

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, "add-customerId.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executando SQL...");
    await client.query(sql);
    console.log("SQL executado com sucesso!");
  } catch (err) {
    console.error("Erro ao executar o SQL:", err);
  } finally {
    await client.end();
    console.log("Conexão encerrada.");
  }
}

main();
