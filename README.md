# Finsfera - Sistema Contábil com IA

O Finsfera é um sistema moderno de contabilidade automatizada que utiliza inteligência artificial para simplificar processos financeiros. Desenvolvido com Next.js e integrado com PostgreSQL no Neon, oferece uma solução completa para gestão contábil.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Neon.tech para o banco de dados PostgreSQL

## Configuração

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/finsfera.git
   cd finsfera
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha as variáveis com suas credenciais de banco de dados e configurações

4. **Inicialize o banco de dados:**

   ```bash
   npm run initdb
   ```

5. **Gere uma chave JWT segura:**

   ```bash
   npm run generate-secret
   ```

   Copie a chave gerada para sua variável `JWT_SECRET` no arquivo `.env.local`

6. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## Gerenciamento de Membros da Equipe

O Finsfera permite que o proprietário da empresa gerencie os membros da equipe, controlando quem tem acesso ao sistema e com quais permissões.

### Tipos de Usuários

- **Proprietário (owner)**: Tem acesso completo ao sistema, incluindo o gerenciamento de outros usuários.
- **Administrador (admin)**: Pode gerenciar a maioria das funções do sistema, mas não pode gerenciar outros usuários.
- **Usuário (user)**: Tem acesso limitado às funcionalidades básicas do sistema.

### Gerenciando Membros

1. Faça login como proprietário
2. Acesse a seção "Membros do Time" no menu lateral
3. A partir daqui, você pode:
   - Visualizar todos os membros existentes
   - Adicionar novos membros, definindo nome, email, senha e função
   - Editar informações de membros existentes
   - Alterar o status de um membro (ativo, inativo, pendente)
   - Excluir membros da equipe

### Status dos Membros

- **Ativo**: O usuário tem acesso normal ao sistema
- **Inativo**: O usuário não pode fazer login no sistema
- **Pendente**: O usuário foi criado, mas ainda precisa definir sua senha ou completar o cadastro

## Estrutura do Projeto

Principais arquivos e diretórios:

```
/src
  /components        # Componentes React reutilizáveis
  /database          # Configuração do banco de dados
  /hooks             # Hooks personalizados do React
  /models            # Modelos de dados (Sequelize)
  /pages             # Páginas da aplicação e endpoints da API
    /api             # Endpoints da API REST
    /dashboard       # Páginas protegidas do dashboard
      /time          # Gerenciamento de membros da equipe
  /scripts           # Scripts para inicialização e outras tarefas
```

## Variáveis de Ambiente

| Variável            | Descrição                             | Exemplo                               |
| ------------------- | ------------------------------------- | ------------------------------------- |
| DATABASE_URL        | URL de conexão com o banco PostgreSQL | postgres://user:pass@host:port/dbname |
| JWT_SECRET          | Chave secreta para geração de tokens  | chave-secreta-gerada                  |
| NODE_ENV            | Ambiente de execução                  | development                           |
| NEXT_PUBLIC_API_URL | URL base da API                       | http://localhost:3000                 |
| NEXT_PUBLIC_APP_URL | URL base da aplicação                 | http://localhost:3000                 |

## Implantação

Para implantar a aplicação no Vercel:

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Defina comandos de build e inicialização
4. Conecte ao banco de dados Neon

## Usuário Inicial

Após a inicialização do banco de dados, um usuário proprietário é criado com as seguintes credenciais:

- **Email**: admin@finsfera.com
- **Senha**: admin123

É altamente recomendado alterar essas credenciais após o primeiro login.
