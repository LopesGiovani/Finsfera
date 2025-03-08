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

Problemas:
reactas soluções caso o problema persista:

### 1. Verifica problemas específicos que podem estar causando a falha do Fast Refresh:

- **Componentes com erros de sintaxe**: Verifique se algum componente React não está sendo exportado corretamente ou tem erros de sintaxe.

- **Hooks React usados incorretamente**: Certifique-se de que todos os hooks React (como `useState`, `useEffect`) estão sendo usados de acordo com as regras de hooks (apenas no nível superior, não em condicionais).

### 2. Atualize suas dependências do Next.js:Vejo que há algumas dependências que podem ser atualizadas para as versões mais recentes dentro da mesma versão principal. Vamos atualizar as que são seguras (sem mudança de versão principal):Muito bom! Atualizamos algumas dependências que podem ajudar a resolver problemas de compatibilidade.

### 3. Verifique as configurações do Next.js:Vamos tentar uma abordagem diferente:Parece que estamos tendo problemas com as ferramentas de busca. Vamos tentar diretamente verificar se existe o arquivo:Agora vamos verificar o conteúdo do arquivo:Estamos tendo problemas com algumas ferramentas. Vamos usar o comando do terminal para visualizar o arquivo:Vamos ver o restante da configuração:## Resumo das ações tomadas e recomendações

Baseado na nossa análise e nas ações que já tomamos, aqui está um resumo do que fizemos e o que mais pode ser feito para resolver o problema de Fast Refresh:

### O que já fizemos:

1. **Limpamos o cache do Next.js** removendo a pasta `.next`
2. **Atualizamos pacotes desatualizados** que poderiam estar causando conflitos
3. **Reiniciamos o servidor de desenvolvimento**
4. **Verificamos o arquivo `next.config.js`** para possíveis configurações problemáticas

### O que você pode fazer se o problema persistir:

1. **Verifique erros em componentes React**:

   - Confira erros de sintaxe
   - Certifique-se de que os hooks React estão sendo usados corretamente
   - Verifique se os componentes estão exportados corretamente

2. **Procure por `useEffect` que podem estar causando loops infinitos**:

   - Problemas comuns incluem dependências ausentes ou incorretas no array de dependências

3. **Desative temporariamente o strict mode**:
   No seu `next.config.js`, você pode definir:
   ```js
   reactStrictMode: false,
   ```

4StrictMode: false,s de diagnóstico\*\*:

- Observe o console do navegador (F12) para ver erros mais detalhados
- Verifique os logs do terminal onde o Next.js está sendo executado

5. **Reinstale os node_modules como último recurso**:
   ```
   npm ci
   ```

O Fast Refresh geralmente falha quando há:

- Erros de sintaxe
- Erros de runtime
- Estado global sendo incorretamente manipulado
- Efeitos colaterais sendo executados de forma inconsistente

Se precisar de mais ajuda, me informe se o problema persiste e compartilhe quaisquer mensagens de erro específicas que aparecerem no console do navegador ou no terminal.
