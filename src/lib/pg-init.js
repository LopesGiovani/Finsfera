// Inicialização explícita do PostgreSQL
// Este arquivo é importado nos arquivos que usam conexão com banco de dados
// para garantir que o módulo pg seja carregado corretamente

// Importa explicitamente o pg para garantir que seja carregado antes do Sequelize
const pg = require("pg");

// Registra o driver PostgreSQL explicitamente
pg.defaults.parseInt8 = true;

// Exporta o pg para uso
module.exports = pg;
