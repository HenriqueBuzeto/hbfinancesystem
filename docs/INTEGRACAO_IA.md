# HB Finance – Integração da IA (Assistente Financeiro)

O Assistente IA ajuda os clientes com dúvidas sobre finanças pessoais, investimentos, orçamento e metas. A integração usa a API da **OpenAI** (modelo GPT).

---

## Passo a passo para ativar a IA

### 1. Obter chave da OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com) e faça login (ou crie uma conta).
2. Vá em **API keys** (ou [platform.openai.com/api-keys](https://platform.openai.com/api-keys)).
3. Clique em **Create new secret key**.
4. Copie a chave (começa com `sk-`). Ela não será exibida novamente.

### 2. Configurar no projeto

- O Next.js **já carrega** o `.env` de **services/api** (configurado em `apps/web/next.config.js`).
- Crie ou edite o arquivo **services/api/.env** e adicione:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

- Não é necessário duplicar a chave na raiz ou em `apps/web`; use apenas **services/api/.env**.

### 3. Reiniciar o servidor

Após salvar o `.env`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

### 4. Testar no app

1. Acesse **Assistente IA** no menu (ou `/app/assistente-ia`).
2. Envie uma pergunta (ex.: "Como montar uma reserva de emergência?").
3. Se a chave estiver correta, a resposta será gerada pela IA.

---

## Segurança e custos

- **Nunca** commite o `.env` ou a chave no repositório (o `.env` já está no `.gitignore`).
- O uso da API OpenAI é **pago** conforme o consumo. Acompanhe em [platform.openai.com/usage](https://platform.openai.com/usage).
- O modelo usado no código é o **gpt-4o-mini** (mais barato). Você pode alterar em `apps/web/src/app/api/ai/chat/route.ts` (campo `model`).

---

## Onde está no código

| Item | Arquivo |
|------|--------|
| Rota da API (chat) | `apps/web/src/app/api/ai/chat/route.ts` |
| Tela do Assistente | `apps/web/src/app/(app)/assistente-ia/page.tsx` |
| Link no menu | `VisionSidebar.tsx` e `Sidebar.tsx` (item "Assistente IA") |

O prompt do sistema está em `route.ts` e define o assistente como especialista em finanças pessoais em português.
