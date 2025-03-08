/**
 * Script para importar clientes específicos para o banco de dados
 *
 * Este script insere uma lista de clientes formatados especificamente para
 * se adaptar à estrutura da tabela customers do banco de dados.
 */
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const readline = require("readline");

// Inicializa o Sequelize com variáveis de ambiente ou valores padrão
const PGHOST =
  process.env.PGHOST || "ep-orange-paper-a4dqufsa.us-east-1.aws.neon.tech";
const PGDATABASE = process.env.PGDATABASE || "staging";
const PGUSER = process.env.PGUSER || "neondb_owner";
const PGPASSWORD = process.env.PGPASSWORD || "npg_UXBQzj8cEv6h";
const DATABASE_URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`;

// Configurar interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

// Dados dos clientes a serem importados
const clientesParaImportar = [
  {
    Nome: "Líder Carnes Gonçalves",
    Email: "ludercarnes2023@hotmail.com",
    Celular: "55339883714",
    "CPF ou CNPJ": "52339320000174",
    Rua: "Rua Rio vermelho",
    Número: "51",
    Complemento: "Em frente a una Fit",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Gabriel Mendes da Costa Moisés",
    Email: "gm13coluna@gmail.com",
    Celular: "31972571753",
    "CPF ou CNPJ": "59639208000106",
    Rua: "Rua Benjamin Constant",
    Número: "49",
    Complemento: "Loja",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Drogaria Guerra e Alves Ltda",
    Email: "ashllayabeale@Hotmail.com",
    Celular: "33998839192",
    "CPF ou CNPJ": "00662872000115",
    Rua: "Sebastião lopes",
    Número: "52",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Air Drones LTDA",
    Email: "Airdronesmg@gmail.com",
    Celular: "33987171529",
    "CPF ou CNPJ": "55247897000144",
    Rua: "Rua Paraná",
    Número: "312",
    Bairro: "Lourdes",
    Cidade: "Governador Valadares - Minas Gerais",
    CEP: "35030420",
    Estado: "MG",
  },
  {
    Nome: "Tarcia Helena Dias de Oliveira",
    Email: "tarciadias@gmail.com",
    Celular: "31991482218",
    "CPF ou CNPJ": "04512436685",
    Rua: "Rua Ouro Fino",
    Número: "177",
    Complemento: "Apto",
    Bairro: "Cruzeiro",
    Cidade: "Belo Horizonte - Minas Gerais",
    CEP: "30310110",
    Estado: "MG",
  },
  {
    Nome: "Laboratório Biolab",
    Email: "biolabrv2023@gmail.com",
    Celular: "33987211613",
    "CPF ou CNPJ": "10683168000100",
    Rua: "Praça Nossa Senhora da Pena",
    Número: "66",
    Bairro: "Centro",
    Cidade: "Rio Vermelho - Minas Gerais",
    CEP: "39170000",
    Estado: "MG",
  },
  {
    Nome: "Drogaria Biofarma",
    Email: "biofarmariver@outlook.com",
    Celular: "33987211613",
    "CPF ou CNPJ": "04207058000161",
    Rua: "Avenida  Aurélio Rodrigues Magalhães",
    Número: "68",
    Bairro: "Centro",
    Cidade: "Rio Vermelho - Minas Gerais",
    CEP: "39170000",
    Estado: "MG",
  },
  {
    Nome: "Rafaela Dias Leal",
    Email: "rafalealdias@gmail.com",
    Celular: "31975239787",
    "CPF ou CNPJ": "11924051613",
    Rua: "Rua Búzios",
    Número: "81",
    Complemento: "Casa",
    Bairro: "Estrela Dalva",
    Cidade: "Contagem - Minas Gerais",
    CEP: "32180580",
    Estado: "MG",
  },
  {
    Nome: "Laboratório Freitas Ltda",
    Email: "labfreitas@yahoo.com.br",
    Celular: "33988074848",
    "CPF ou CNPJ": "66231333000130",
    Rua: "Rua São João evangelista",
    Número: "45",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Haus Pub e Hamburgueria",
    Email: "hauspub@hotmail.com",
    Celular: "33988470605",
    "CPF ou CNPJ": "44912341000109",
    Rua: "São João Evangelista",
    Número: "45",
    Complemento: "loja 2",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Clinica Odontologica Araujo Rocha Ltda",
    Email: "implantarrocha@hotmail.com",
    Celular: "33988660982",
    "CPF ou CNPJ": "27880904000105",
    Rua: "Praça Herculano Torres",
    Número: "52",
    Complemento: "2o andar",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Kelly Cristine Costa Santos",
    Email: "kely.cristineadvogada@gmail.com",
    Celular: "33988029192",
    "CPF ou CNPJ": "09688034665",
    Rua: "RUA FRANCISCO GOMES",
    Número: "115",
    Complemento: "Escritório",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Gustavo Vinícius de Carvalho Leão Sociedade Individual de Advocacia",
    Email: "contato@licittax.com.br",
    Celular: "3131576737",
    "CPF ou CNPJ": "45603626000120",
    Rua: "Rua da Coleirinha",
    Número: "189/202",
    Bairro: "Alto Caiçaras",
    Cidade: "Belo Horizonte - Minas Gerais",
    CEP: "30750530",
    Estado: "MG",
  },
  {
    Nome: "Souza & Andrade Advogados",
    Email: "souzaeandrade@hotmail.com",
    Celular: "31984827484",
    Empresa: "Souza & Andrade Advogados",
    "CPF ou CNPJ": "50798147000147",
    Rua: "Avenida Raja Gabaglia",
    Número: "2000",
    Complemento: "Torre 1- Sala 333",
    Bairro: "Estoril",
    Cidade: "Belo Horizonte - Minas Gerais",
    CEP: "30494170",
    Estado: "MG",
  },
  {
    Nome: "JACKSON CAMPOS",
    Email: "jacksoncampos.silva@gmail.com",
    Celular: "33987092469",
    "CPF ou CNPJ": "11605205699",
    Rua: "Apollo Xl",
    Número: "26",
    Complemento: "CASA/LOJA",
    Bairro: "CENTRO",
    Cidade: "Frei Lagonegro - Minas Gerais",
    CEP: "39708000",
    Estado: "MG",
  },
  {
    Nome: "Euclimária Rodrigues Moreira",
    Email: "euclimariarodriguesmoreira@gmail.com",
    Celular: "33987049726",
    "CPF ou CNPJ": "08470606670",
    Rua: "Avenida Herculano Lopes",
    Número: "103",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "Maria Isabel Mol Ibrahin Morinho",
    Email: "mariaimarinho@yahoo.com.br",
    Celular: "31992226105",
    "CPF ou CNPJ": "08391241637",
    Rua: "Rua Doutor Ary Ferreira",
    Número: "95",
    Bairro: "São Bento",
    Cidade: "Belo Horizonte - Minas Gerais",
    CEP: "30350490",
    Estado: "MG",
  },
  {
    Nome: "Clinica França e Lopes LTDA",
    Celular: "33988415226",
    "CPF ou CNPJ": "10576471000104",
    Rua: "Sao João Evangelista",
    Número: "195",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39777000",
    Estado: "MG",
  },
  {
    Nome: "Drogaria do Frei",
    Email: "drogafrei@hotmail.com",
    Celular: "33988268721",
    Empresa: "Drogaria do Frei",
    "CPF ou CNPJ": "10306038000140",
    Rua: "Praça São Salvador",
    Número: "230",
    Bairro: "Centro",
    Cidade: "Frei Lagonegro - Minas Gerais",
    CEP: "39708000",
    Estado: "MG",
  },
  {
    Nome: "JVA VIDAL",
    Email: "drogarialider086@gmail.com",
    Celular: "33987040073",
    Empresa: "Drogaria Líder",
    "CPF ou CNPJ": "30898086000182",
    Rua: "Osvaldo Pimenta",
    Número: "227",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "JVX TELECOM INTERNET E SERVICOS LTDA.",
    Email: "comercial@jvxtelecom.com.br",
    Celular: "33988639001",
    "CPF ou CNPJ": "17931803000162",
    Rua: "Parça Abdolonimo Ferreira",
    Número: "4",
    Bairro: "Centro",
    Cidade: "Coluna - Minas Gerais",
    CEP: "39770000",
    Estado: "MG",
  },
  {
    Nome: "HELLEN CRISTINA GONCALVES",
    Email: "consultoriofrei.drahellen@gmail.com",
    Celular: "31980252859",
    "CPF ou CNPJ": "08828087617",
    Rua: "Rua Padre Júlio",
    Número: "105",
    Complemento: "casa",
    Bairro: "Centro",
    Cidade: "Frei Lagonegro - Minas Gerais",
    CEP: "39708000",
    Estado: "MG",
  },
  {
    Nome: "Julianderson Lopes de Oliveira",
    Email: "julianderson@prolabore.com.br",
    Celular: "31994044744",
    "CPF ou CNPJ": "08443555696",
    Rua: "Rua Oswaldo Ferraz",
    Número: "259",
    Complemento: "Apto 301",
    Bairro: "Sagrada família",
    Cidade: "Belo Horizonte - Minas Gerais",
    CEP: "31034460",
    Estado: "MG",
  },
];

/**
 * Extrai apenas o nome da cidade da string "Cidade - Estado"
 */
function extrairCidade(cidadeCompleta) {
  if (!cidadeCompleta) return "";

  // Remove " - Minas Gerais" ou outras variações do estado
  return cidadeCompleta.split(" - ")[0].trim();
}

/**
 * Determina se é empresa baseado no CNPJ (14 dígitos) ou CPF (11 dígitos)
 */
function isEmpresa(documento) {
  if (!documento) return false;

  // Remove caracteres não numéricos
  const apenasNumeros = documento.replace(/\D/g, "");

  // Se o documento tem 14 dígitos, assume que é CNPJ (empresa)
  return apenasNumeros.length === 14;
}

/**
 * Formata o cliente para o formato do banco de dados
 */
function formatarCliente(cliente, organizationId) {
  const isCompany = isEmpresa(cliente["CPF ou CNPJ"]);
  const cidade = extrairCidade(cliente["Cidade"]);

  // Determinar o nome da empresa quando disponível
  let company = "";
  if (isCompany) {
    company = cliente["Empresa"] || cliente["Nome"];
  }

  return {
    organizationId: organizationId,
    name: cliente["Nome"],
    document: cliente["CPF ou CNPJ"] || "",
    email: cliente["Email"] || "",
    phone: cliente["Celular"] || "",
    mobile: cliente["Celular"] || "",
    company: company,
    street: cliente["Rua"] || "",
    number: cliente["Número"] || "",
    complement: cliente["Complemento"] || "",
    district: cliente["Bairro"] || "",
    city: cidade,
    state: cliente["Estado"] || "",
    zipCode: cliente["CEP"] || "",
    contactPerson: "",
    notes: "",
    plan: "prata", // Plano padrão
    active: true,
  };
}

/**
 * Cria insert SQL para o cliente
 */
function criarInsertCliente(cliente) {
  const colunas = Object.keys(cliente).join('", "');
  const valores = Object.values(cliente)
    .map((val) => {
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
      if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
      return val;
    })
    .join(", ");

  return `INSERT INTO customers ("${colunas}") VALUES (${valores});`;
}

/**
 * Função principal para importar os clientes
 */
async function importarClientes() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    // Solicitar ID da organização
    rl.question("Digite o ID da organização: ", async (organizationId) => {
      organizationId = parseInt(organizationId.trim());

      if (isNaN(organizationId) || organizationId <= 0) {
        console.error(
          "❌ ID da organização inválido. Use um número inteiro positivo."
        );
        rl.close();
        await sequelize.close();
        return;
      }

      console.log(
        `🔄 Importando ${clientesParaImportar.length} clientes para a organização ID ${organizationId}...`
      );

      // Verificar se a organização existe
      const [orgResult] = await sequelize.query(`
        SELECT id FROM organizations WHERE id = ${organizationId}
      `);

      if (orgResult.length === 0) {
        console.error(
          `❌ Organização com ID ${organizationId} não encontrada.`
        );
        rl.close();
        await sequelize.close();
        return;
      }

      // Processar cada cliente
      let clientesImportados = 0;
      let erros = 0;

      for (const clienteOriginal of clientesParaImportar) {
        try {
          const clienteFormatado = formatarCliente(
            clienteOriginal,
            organizationId
          );

          // Verificar se já existe um cliente com o mesmo documento
          const [clienteExistente] = await sequelize.query(`
            SELECT id FROM customers 
            WHERE "document" = '${clienteFormatado.document}' 
            AND "organizationId" = ${organizationId}
          `);

          if (clienteExistente.length > 0) {
            console.log(
              `ℹ️ Cliente com documento ${clienteFormatado.document} já existe. Pulando...`
            );
            continue;
          }

          // Criar o cliente
          const insertSQL = criarInsertCliente(clienteFormatado);
          await sequelize.query(insertSQL);

          console.log(
            `✅ Cliente "${clienteFormatado.name}" importado com sucesso!`
          );
          clientesImportados++;
        } catch (error) {
          console.error(
            `❌ Erro ao importar cliente "${clienteOriginal.Nome}":`,
            error.message
          );
          erros++;
        }
      }

      console.log("\n" + "=".repeat(60));
      console.log(`📊 RESUMO DA IMPORTAÇÃO`);
      console.log("=".repeat(60));
      console.log(
        `Total de clientes processados: ${clientesParaImportar.length}`
      );
      console.log(`Clientes importados com sucesso: ${clientesImportados}`);
      console.log(`Erros durante a importação: ${erros}`);
      console.log("=".repeat(60));

      if (clientesImportados > 0) {
        console.log("\n🎉 Importação concluída com sucesso!");
      } else {
        console.log(
          "\n⚠️ Nenhum cliente foi importado. Verifique os erros acima."
        );
      }

      rl.close();
      await sequelize.close();
    });
  } catch (error) {
    console.error("❌ Erro durante a importação:", error.message);

    if (
      error.message.includes("connect ECONNREFUSED") ||
      error.message.includes("password authentication failed")
    ) {
      console.error("\n⚠️ Erro de conexão com o banco de dados!");
      console.error(
        "Verifique suas credenciais no arquivo .env ou passe-as como variáveis de ambiente."
      );
    }

    rl.close();
    await sequelize.close();
  }
}

// Executar o script
importarClientes();
