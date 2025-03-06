/**
 * Script para modificar a restrição NOT NULL da coluna address
 * Este script torna a coluna address nullable, já que agora usamos street, number, etc.
 */
const { Sequelize } = require("sequelize");

// URL de conexão com o banco de dados
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://neondb_owner:npg_UXBQzj8cEv6h@ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech/production?sslmode=require";

// Inicializa o Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    },
  },
  logging: console.log,
});

async function fixAddressConstraint() {
  try {
    console.log("Conectando ao banco de dados...");
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso!");

    // Verificar se a coluna 'address' existe
    const checkAddressColumn = await sequelize.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'address';
    `);

    if (checkAddressColumn[0].length > 0) {
      const isNullable = checkAddressColumn[0][0].is_nullable === 'YES';
      
      if (!isNullable) {
        console.log("Coluna 'address' encontrada com restrição NOT NULL. Modificando...");
        
        // Modificar a restrição NOT NULL
        await sequelize.query(`
          ALTER TABLE customers 
          ALTER COLUMN address DROP NOT NULL;
        `);
        
        console.log("Restrição NOT NULL removida da coluna 'address'.");
        
        // Verificar se a modificação foi bem-sucedida
        const verifyChange = await sequelize.query(`
          SELECT column_name, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'customers' AND column_name = 'address';
        `);
        
        const isNullableNow = verifyChange[0][0].is_nullable === 'YES';
        if (isNullableNow) {
          console.log("Verificação confirmada: coluna 'address' agora aceita valores NULL.");
        } else {
          console.log("AVISO: A modificação pode não ter sido aplicada corretamente.");
        }
      } else {
        console.log("Coluna 'address' já aceita valores NULL. Nenhuma alteração necessária.");
      }
    } else {
      console.log("Coluna 'address' não encontrada na tabela 'customers'.");
    }

    console.log("Processo concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante a execução do script:", error);
  } finally {
    await sequelize.close();
  }
}

// Executar a função
fixAddressConstraint()
  .then(() => {
    console.log("Script finalizado.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro ao executar o script:", error);
    process.exit(1);
  }); 