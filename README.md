# Finsfera - Sistema de Gestao Empresarial com IA

Finsfera e uma plataforma completa de gestao empresarial que usa IA para otimizar processos de negocios.

## Visao Geral

O sistema gerencia:

- Ordens de Servico (Em Aberto, Em Andamento, Concluido)
- Clientes
- Equipe/Time
- Dashboards e Relatorios
- Faturamento

## Tecnologias

- **Frontend**: Next.js, React, Tailwind CSS, React Query
- **Backend**: API Routes do Next.js, PostgreSQL no Neon
- **Deploy**: Vercel Serverless Functions
- **Autenticacao**: JWT

## Principais Funcionalidades

### Modulo de Ordens de Servico

- Criacao e acompanhamento de atendimentos
- Atribuicao de responsaveis
- Comentarios e anexos
- Controle de tempo
- Relatorios de produtividade

### Modulo de Clientes

- Cadastro completo 
- Historico de atendimentos
- Segmentacao

### Modulo de Equipe

- Niveis de acesso: Proprietario, Administrador, Usuario
- Gerenciamento de permissoes
- Status de atividade

## Como Usar

1. Clone o repositorio
2. Instale as dependencias: `npm install`
3. Configure o `.env.local` com dados de conexao
4. Inicialize o banco: `npm run initdb`
5. Gere chave JWT: `npm run generate-secret`
6. Inicie o servidor: `npm run dev`

## Estrutura de Diretorios

```
/src
  /components      # Componentes React
  /contexts        # Contextos React
  /hooks           # Custom hooks
  /lib             # Bibliotecas
  /middleware      # Autenticacao
  /pages           # Paginas e API
  /scripts         # Scripts de setup
  /services        # Servicos API
  /utils           # Utilitarios
```

## API

Endpoints principais:

- `/api/auth`: Autenticacao
- `/api/customers`: Gerenciamento de clientes
- `/api/service-orders`: Gerenciamento de OS
- `/api/team`: Gerenciamento de equipe

## Acesso Inicial

- Email: admin@finsfera.com
- Senha: admin123

Altere essas credenciais apos o primeiro login.
