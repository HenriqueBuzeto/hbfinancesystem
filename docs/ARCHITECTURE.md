# Nebula Finance – Arquitetura e trade-offs

## Checklist de arquitetura

- [x] Monorepo feature-based (apps/web, packages/ui, services/api, services/worker, infra)
- [x] Next.js App Router com rotas: /, /login, /app/*, /admin, /api/*
- [x] Prisma schema multi-tenant (Tenant, User, Account, Transaction, Bill, Budget, Category, Notification, AuditLog)
- [x] API REST em Next.js (API Routes) + opção de API standalone em services/api
- [x] Worker BullMQ com abstração de provedor WhatsApp (Twilio vs dev mock)
- [x] Endpoint /api/ai/advisor com system prompt e request/response tipados
- [x] Design tokens e tema (Deep Black, Electric Purple, Cyber Violet)
- [ ] Autenticação JWT + refresh (estrutura pronta; implementação completa em sprint)
- [ ] Rate limiting, CORS, Helmet (configurar em produção)
- [ ] Sentry/Prometheus (variáveis de ambiente documentadas)
- [ ] CI/CD GitHub Actions (lint, typecheck, test, deploy Vercel)
- [ ] Edge Functions para endpoints que se beneficiam (cotação, notícias)

## Trade-offs técnicos

### Edge Functions vs Serverless vs Serverful

| Abordagem | Uso no Nebula | Justificativa |
|-----------|----------------|---------------|
| **Edge (Vercel)** | Cotação, notícias, health check | Baixa latência, cache global; sem acesso direto ao DB. |
| **Serverless (Vercel API Routes)** | /api/ai/advisor, CRUD, auth | Integração natural com Next.js; cold start aceitável para APIs de usuário. |
| **Serverful (container)** | Worker BullMQ, cron jobs | Jobs longos e filas não se encaixam em serverless; Redis e Prisma em processo. |

Recomendação: manter API no Next.js para MVP; se carga crescer, extrair serviços críticos para NestJS em container com connection pool (pgBouncer).

### Twilio vs Baileys (WhatsApp)

| Provedor | Custo | Manutenção | Uso recomendado |
|----------|------|------------|------------------|
| **Twilio** | Pago por mensagem | Baixa; templates aprovados | Produção, conformidade. |
| **Baileys** | Self-hosted, gratuito | Alta; quebras com updates WhatsApp | Dev/staging ou custo zero; risco de ban. |

Implementação: abstração `WhatsAppProvider` em `services/worker` permite trocar sem alterar fila. Em dev, provider que apenas loga no console.

### Prisma vs Drizzle

- **Prisma:** escolhido para type-safety, migrations maduras, Prisma Studio e ecossistema. Ideal para equipe e velocidade.
- **Drizzle:** alternativa mais leve e SQL-like; migrar só se houver necessidade de queries muito complexas ou bundle menor em edge.

## Estrutura de pastas (referência)

```
nebula-finance/
├── apps/web          # Next.js (App Router + API Routes)
├── packages/ui       # Design tokens, cn(), componentes compartilhados
├── services/api      # Prisma schema, lógica compartilhada, opcional API standalone
├── services/worker   # BullMQ worker (WhatsApp, cron jobs)
├── infra             # Dockerfile, docker-compose (Postgres + Redis)
└── docs              # Arquitetura, API, checklists
```

## Milestones sugeridos

1. **MVP (4 semanas):** Auth JWT completo, CRUD transações/contas/bills, dashboard com dados reais, AI Advisor com OpenAI, worker WhatsApp em produção.
2. **Sprint 2:** Conciliação OFX/CSV, regras de categorização, relatórios (cashflow, DRE).
3. **Sprint 3:** Open Banking (abstração), Smart Alerts (email + WhatsApp), testes E2E, Lighthouse CI.
4. **Sprint 4:** Admin completo, observabilidade (Sentry, Prometheus), segurança e performance.
