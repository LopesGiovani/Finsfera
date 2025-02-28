# Finsfera - Sistema de Contabilidade com IA

Sistema moderno de contabilidade com autenticação e integração com banco de dados PostgreSQL no Neon.

## Configuração do Ambiente Local

### Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Neon.tech para o banco de dados PostgreSQL

### Passos para Configurar

1. **Clone o repositório**

   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd Finsfera
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env.local

   # Edite o arquivo .env.local com suas credenciais
   # Especialmente, atualize DATABASE_URL com as credenciais do seu banco Neon
   ```

4. **Inicialize o banco de dados**

   ```bash
   npm run initdb
   # ou para produção:
   npm run migrate
   ```

5. **Gere uma chave JWT segura para produção**

   ```bash
   npm run generate-secret
   # Copie a chave gerada para .env.production.local
   ```

6. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

7. **Para testar em modo de produção localmente**
   ```bash
   npm run dev:prod
   ```

## Estrutura de Arquivos

- `/src/lib/db.ts` - Configuração do Sequelize para conexão com o Neon
- `/src/models/User.ts` - Modelo de usuário para autenticação
- `/src/lib/auth.ts` - Funções de autenticação e verificação JWT
- `/src/pages/api/auth/` - Endpoints de API para autenticação
- `/src/scripts/` - Scripts de inicialização e migração

## Variáveis de Ambiente

| Variável            | Descrição                             | Exemplo                              |
| ------------------- | ------------------------------------- | ------------------------------------ |
| DATABASE_URL        | URL de conexão do banco de dados Neon | postgresql://user:pass@host/database |
| JWT_SECRET          | Chave secreta para tokens JWT         | (string aleatória)                   |
| NODE_ENV            | Ambiente de execução                  | development, production              |
| NEXT_PUBLIC_API_URL | URL base da API                       | http://localhost:3000/api            |
| NEXT_PUBLIC_APP_URL | URL base da aplicação                 | http://localhost:3000                |

## Deploy na Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente na interface da Vercel:
   - DATABASE_URL
   - JWT_SECRET (use o valor gerado pelo comando `npm run generate-secret`)
   - NODE_ENV=production
3. Deploy!

## Usuário de Exemplo

Após executar `npm run initdb` ou `npm run migrate`, um usuário administrador será criado:

- Email: admin@exemplo.com
- Senha: senha123
