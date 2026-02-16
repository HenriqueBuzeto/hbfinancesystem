# HB Finance – Integração com Supabase (PostgreSQL)

## 1. Projeto Supabase

- **Project ID:** `qgwcmzpjsxqpbzuphhre`
- **URL do projeto:** `https://qgwcmzpjsxqpbzuphhre.supabase.co`

## 2. Variáveis de ambiente

Configure no **services/api/.env** (e, se o Next.js carregar da raiz, no **.env** da raiz ou em **apps/web/.env.local**):

### Conexão com o banco (Prisma)

A aplicação usa **Prisma** contra o PostgreSQL do Supabase. É preciso a **senha do banco**, não a API key.

1. No [Dashboard do Supabase](https://supabase.com/dashboard) abra o projeto.
2. Vá em **Project Settings** (ícone de engrenagem) → **Database**.
3. Em **Connection string** escolha **URI** e copie. Ou monte assim:
   - **Conexão direta:**  
     `postgresql://postgres:[YOUR-PASSWORD]@db.qgwcmzpjsxqpbzuphhre.supabase.co:5432/postgres`
   - Substitua `[YOUR-PASSWORD]` pela senha do banco (a mesma da tela Database; se esqueceu, use **Reset database password**).

Exemplo no `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_DO_BANCO@db.qgwcmzpjsxqpbzuphhre.supabase.co:5432/postgres"
```

### Chaves da API Supabase (client e server)

Para usar o cliente JavaScript do Supabase (Auth, Realtime, Storage) no app:

- **NEXT_PUBLIC_SUPABASE_URL** – URL do projeto (pode ir no client).
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** – chave pública (anon/publishable).
- **SUPABASE_SERVICE_ROLE_KEY** – chave secreta (só no server; nunca no client).

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qgwcmzpjsxqpbzuphhre.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

## 3. Criar tabelas e triggers no Supabase

Com o `DATABASE_URL` apontando para o Supabase:

```bash
cd services/api
npm run db:setup
```

Se as tabelas já existirem e você quiser só atualizar triggers/procedures:

```bash
npm run db:setup:triggers
```

## 4. Seed (primeiro usuário)

Na raiz do projeto:

```bash
npm run db:seed
```

Isso cria o tenant padrão e o usuário **admin@hbfinance.com** / **Admin@123**.

## 5. Cliente Supabase no app

O projeto inclui um cliente Supabase em **apps/web/src/lib/supabase.ts**:

- **Browser:** `createBrowserClient()` – usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Server:** `createServerClient()` – usa a service role key para operações privilegiadas.

Use esses clientes quando for integrar Supabase Auth, Realtime ou Storage; o restante do app continua usando **Prisma** + **DATABASE_URL** para o PostgreSQL.
