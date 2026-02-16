# Arquitetura de Integrações - Nebula Finance

Este documento descreve a arquitetura de notificações, integrações financeiras e automações do sistema.

---

## 1. Camadas de integração

```
┌─────────────────────────────────────────────────────────────────┐
│  APPS (Next.js)                                                  │
│  - Central de notificações (UI)                                  │
│  - Preferências por canal (WhatsApp / E-mail)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  API REST (Next.js API Routes)                                   │
│  - GET/PATCH /api/notifications                                  │
│  - GET/PATCH /api/notification-preferences                      │
│  - (futuro) Webhooks de pagamento / Open Finance                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Worker (BullMQ + Redis)                                         │
│  - Filas: nebula:whatsapp, nebula:email                          │
│  - Processadores: whatsappProcessor, emailProcessor              │
│  - Dead-letter: nebula:whatsapp:dlq, nebula:email:dlq           │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Provedores externos                                             │
│  - WhatsApp: Twilio (WhatsApp Business API)                      │
│  - E-mail: Resend (ou SendGrid, SES)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Notificações inteligentes

### 2.1 Eventos que disparam notificações

| Evento                | Descrição                          | Canal padrão |
|------------------------|------------------------------------|--------------|
| `BILL_DUE`             | Conta a pagar próxima do vencimento | WhatsApp, E-mail |
| `BILL_OVERDUE`         | Conta a pagar vencida              | WhatsApp, E-mail |
| `RECEIVABLE_DUE`       | Conta a receber próxima do vencimento | WhatsApp, E-mail |
| `RECEIVABLE_RECEIVED`  | Conta recebida com sucesso         | WhatsApp, E-mail |
| `EXPENSE_REGISTERED`   | Despesa registrada automaticamente | WhatsApp, E-mail |
| `WEEKLY_SUMMARY`       | Resumo financeiro semanal          | WhatsApp, E-mail |
| `MONTHLY_SUMMARY`      | Resumo financeiro mensal           | WhatsApp, E-mail |
| `BUDGET_ALERT`         | Alerta de orçamento                | IN_APP, E-mail |
| `LOW_BALANCE`          | Saldo baixo                        | IN_APP, E-mail |
| `AI_TIP`               | Dica inteligente                   | IN_APP |

### 2.2 Conteúdo das mensagens

- **WhatsApp**: templates em `services/worker/src/lib/notification-templates.ts`  
  Variáveis: `{{nome}}`, `{{valor}}`, `{{vencimento}}`, `{{descricao}}`, `{{status}}`, `{{saldo}}`, `{{link}}`.
- **E-mail**: HTML gerado em `notification-service.ts` (assunto + corpo com link para o app).

### 2.3 Preferências do usuário

- Modelo `NotificationPreference`: por usuário e canal (WHATSAPP | EMAIL).
- Campos: `enabled`, `eventTypes` (array de eventos), `dailyTime`, `weeklyDay`, `monthlyDay`.
- Usuário precisa ter `User.phone` (E.164) para receber WhatsApp.
- API: `GET/PATCH /api/notification-preferences`.

---

## 3. WhatsApp

- **Prioridade**: canal principal de alertas em tempo real.
- **APIs recomendadas**:
  - **Twilio** (implementado): variáveis `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`.
  - Alternativas: WhatsApp Business API (Meta), Z-API, 360Dialog.
- **Fluxo**: Scheduler ou API enfileira job em `nebula:whatsapp` → Worker processa → TwilioProvider envia mensagem.
- **Retry**: 3 tentativas com backoff exponencial; falha final → dead-letter queue.

---

## 4. E-mail

- **Provedor implementado**: Resend.
  - Variáveis: `RESEND_API_KEY`, `EMAIL_FROM` (ex: `"Nebula Finance <notificacoes@seu-dominio.com>"`).
- **Alternativas**: SendGrid, Amazon SES (trocar provider em `processors/email.ts`).
- **Templates**: HTML inline em `notification-service.ts` (estilo dark, botão CTA).

---

## 5. Scheduler (agendamento)

- **Ferramenta**: `node-cron` no processo `services/worker` (script `scheduler`).
- **Jobs**:
  - **Diário 08:00**: contas a pagar a vencer (próximos 3 dias) e contas vencidas → enfileira WhatsApp/E-mail conforme preferências.
  - **Segunda 08:00**: resumo semanal (WEEKLY_SUMMARY).
  - **Dia 1 do mês 08:00**: resumo mensal (MONTHLY_SUMMARY).
- **Produção**: rodar como processo separado (`npm run scheduler` no worker) ou invocar via Vercel Cron / AWS EventBridge que chama uma API que enfileira os jobs.

---

## 6. Integrações financeiras (preparação)

### 6.1 Open Finance Brasil

- **Estado**: preparado no schema (contas, transações, conciliação).
- **Próximos passos**: integrar com instituições certificadas (plug-and-play por banco), usar `Transaction.externalId` para conciliação e atualização automática de saldo.

### 6.2 Gateways de pagamento

- **Recomendados**: Mercado Pago, Stripe, Pagar.me, Pix (via banco ou intermediador).
- **Uso**: webhooks de confirmação de pagamento → marcar `Bill` como PAID e criar/atualizar `Transaction`; opcionalmente disparar notificação `RECEIVABLE_RECEIVED`.

---

## 7. Segurança e confiabilidade

- **Autenticação**: JWT (access + refresh); rotas de notificação e preferências exigem Bearer.
- **Dados sensíveis**: não armazenar tokens de terceiros em log; variáveis em ambiente.
- **Auditoria**: modelo `AuditLog` para ações críticas (alteração de contas, transações).
- **Fila**: Redis com retry e DLQ; monitorar falhas nas filas e alertar (ex: Sentry).

---

## 8. Boas práticas

- **Webhooks**: receber callbacks de pagamento em rotas dedicadas (`/api/webhooks/...`), validar assinatura e enfileirar processamento.
- **Retry**: sempre com backoff (exponencial) e limite de tentativas.
- **Monitoramento**: logs estruturados, métricas de jobs concluídos/falhos, alertas em caso de pico de falhas ou DLQ crescendo.

---

## 9. Como rodar

1. **Redis**: `docker run -d -p 6379:6379 redis` (ou REDIS_HOST/REDIS_PORT).
2. **Worker**: `cd services/worker && npm run worker`.
3. **Scheduler**: `cd services/worker && npm run scheduler` (ou em conjunto com o worker em um único processo, se desejado).
4. **Variáveis** (exemplo):
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` (WhatsApp).
   - `RESEND_API_KEY`, `EMAIL_FROM` (e-mail).
   - `DATABASE_URL` (Prisma).
   - `NEXT_PUBLIC_APP_URL` ou `APP_URL` (links nas mensagens).

Após alterar o schema Prisma (User.phone, NotificationPreference), rodar:

- `npm run db:generate` (em apps/web e services/worker).
- `npx prisma migrate dev` ou `db push` (em services/api).
