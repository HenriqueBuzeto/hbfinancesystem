# HB Finance – Configuração com PostgreSQL

## 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha:

```bash
cp .env.example .env
```

Edite `.env` e configure pelo menos:

- **DATABASE_URL**: conexão PostgreSQL (banco **hbfinance**). Exemplo:
  ```
  DATABASE_URL="postgresql://usuario:senha@localhost:5432/hbfinance?schema=public"
  ```
  O Prisma usa o `.env` em **services/api/.env**. Use o usuário e a senha do seu PostgreSQL; o usuário precisa ter permissão no banco `hbfinance`.
- **JWT_SECRET** e **JWT_REFRESH_SECRET**: chaves para tokens (mín. 32 caracteres).
- **DEMO_TENANT_ID** (opcional): ID do tenant para uso sem login em desenvolvimento.

## 2. Criar o banco, tabelas, triggers e procedures

```bash
# Criar o banco no PostgreSQL (nome: hbfinance), se ainda não existir
createdb hbfinance

# Na pasta services/api: cria todas as tabelas e aplica triggers/procedures
cd services/api
npm run db:setup
# Ou só triggers (se as tabelas já existirem):
npm run db:setup:triggers
```

O script `db:setup` usa o `.env` de **services/api** e aplica:
- **Migração inicial**: tabelas Tenant, User, Account, Category, Transaction, Bill, Budget, Notification, NotificationPreference, AuditLog.
- **Triggers**: atualização automática de `updatedAt`; sincronização do saldo da conta ao inserir/atualizar/remover transações.
- **Funções**: `create_transaction_from_bill(...)` e `get_dashboard_summary(...)`.

## 3. Gerar o Prisma Client

```bash
npm run db:generate
```

## 4. Seed – primeiro usuário e tenant

Na raiz do projeto:

```bash
npm run db:seed
```

Isso cria o tenant padrão "HB Finance (Padrão)" e o usuário admin:

- **E-mail:** `admin@hbfinance.com`
- **Senha:** `Admin@123`

Depois use **Login** no site com essas credenciais. O JWT retornado por `/api/auth/login` será usado em todas as APIs (dashboard, contas, configurações, notificações).

## 5. Fluxo da aplicação

- **Login**: `POST /api/auth/login` (email + senha) → retorna `accessToken` e `refreshToken`.
- O frontend guarda o token (ex.: `localStorage`) e envia no header `Authorization: Bearer <token>` nas requisições.
- **Configurações**: `GET /api/me` (perfil), `PATCH /api/me` (atualizar nome/telefone/email), `POST /api/auth/change-password` (alterar senha).
- **Contas a pagar/receber**: `GET /api/bills?type=PAYABLE|RECEIVABLE`, `POST /api/bills`, `PATCH /api/bills/[id]`, `DELETE /api/bills/[id]`.
- **Dashboard**: `GET /api/dashboard/summary?period=day|month|year`.
- **Notificações**: `GET /api/notifications`, `PATCH /api/notification-preferences`.

Com o PostgreSQL configurado, o seed executado e o frontend rodando (`npm run dev`), o site fica 100% funcional com dados reais.
