# Relatório QA – HB Finance (Pronto para ir ao ar)

**Data:** 2025  
**Escopo:** Testes automatizados, revisão de código, otimização e checklist para produção e mobile.

---

## 1. Resumo executivo

| Item | Status |
|------|--------|
| Testes unitários (Jest) | ✅ Passando |
| Fluxos críticos mapeados | ✅ OK |
| Código não utilizado identificado | ✅ Documentado |
| Viewport / mobile | ✅ Configurado |
| Recomendações para produção | ✅ Listadas abaixo |

O sistema está **apto para ir ao ar** desde que as variáveis de ambiente e o banco estejam configurados (incluindo colunas de perfil na tabela `User` quando aplicável).

---

## 2. Testes realizados

### 2.1 Testes automatizados (Jest)

- **Sidebar** (`components/layout/__tests__/Sidebar.test.tsx`)
  - Renderiza nome "HB Finance" e links (Dashboard, Contas, Relatórios).
  - Região de navegação acessível (role navigation e complementary "Menu principal").
  - Botão "Recolher menu" com label acessível.
- **API AI Advisor** (`app/api/ai/advisor/__tests__/advisor.test.ts`)
  - Retorna 400 quando payload é inválido (sem `userId`).
  - Retorna 200 com estrutura esperada (summary, recommendations, projection, riskAlerts, confidence, disclaimer) para payload válido.

**Comando:** `npm run test` (em `apps/web`).

### 2.2 Fluxos críticos (checklist manual recomendado)

Recomenda-se rodar manualmente antes do go-live:

| # | Fluxo | Passos | Observação |
|---|--------|--------|------------|
| 1 | Criação de conta | Acessar /criar-conta → preencher nome, e-mail, senha → Criar conta | Redireciona para /app/dashboard; tokens em localStorage |
| 2 | Login | /login → e-mail/senha → Entrar | Redireciona; DATABASE_URL e colunas User (monthlyIncome etc.) devem existir |
| 3 | Perfil (Configurações) | /app/configuracoes → Aba Perfil → conferir nome, sobrenome, e-mail, telefone preenchidos → editar → Salvar perfil | Dados vêm de GET /api/me |
| 4 | Mais dados | Aba "Mais dados" → Renda, Objetivo, Ano → Salvar dados | Requer colunas no banco (script add_user_profile_columns.sql) |
| 5 | Planos e cupom | /app/planos → cupom ex.: HBDEVBJJ → Aplicar | Retry com refresh em 401; cupom no seed |
| 6 | Contas a pagar/receber | /app/contas-a-pagar e /app/contas-a-receber → listar/criar/editar | APIs /api/bills |
| 7 | Notificações | /app/notificacoes → preferências → Enviar teste (WhatsApp) | Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER |
| 8 | Relatórios | /app/relatorios → Mensal/Anual → Exportar Excel/PDF | Dados zerados até integrar com API real |
| 9 | Assistente IA | /app/assistente-ia → enviar mensagem | Plano START+; OPENAI_API_KEY |
| 10 | Alterar senha | Configurações → Segurança → Alterar senha | /api/auth/change-password |
| 11 | Logout | Configurações → Sair | Limpa tokens e redireciona para /login |

---

## 3. Mobile e responsividade

- **Viewport** configurado no `app/layout.tsx`:
  - `width: device-width`, `initialScale: 1`, `maximumScale: 5`
  - `themeColor: #0a0a0f`
- **Sidebar**: menu recolhível e adaptável (max-w-[85vw] em mobile).
- **Páginas**: uso de Tailwind responsivo (sm:, md:, lg:) e Chakra em várias telas.
- **Recomendação:** Testar em dispositivo real ou Chrome DevTools (mobile) em: login, criar conta, dashboard, configurações, planos e notificações.

---

## 4. Código não utilizado / otimização

| Item | Situação | Ação |
|------|----------|------|
| `lib/supabase.ts` | Nenhum import em `apps/web/src` | Mantido para possível uso futuro (Realtime). Pode ser removido se não for usar Supabase no cliente. |
| `app/(app)/` vs `app/app/` | `app/app/*` reexporta de `(app)/*` para URLs /app/* | Estrutura intencional; não remover. |
| AlertsPanel | Dados mock (comentado "em produção viriam de API") | Mantido; depois conectar a /api/notifications ou similar. |
| Auth0 | Middleware e lib/auth0 usados para rotas /api/auth0 e /app | Em uso; login principal é e-mail/senha (JWT). |

Nenhum arquivo inteiro foi removido para não quebrar referências; apenas itens claramente mortos poderiam ser apagados em uma segunda passagem (ex.: remover `supabase.ts` se a decisão for não usar Supabase no front).

---

## 5. Ajustes feitos durante o QA

1. **Teste Sidebar:** Ajuste do seletor de acessibilidade (role navigation + complementary "Menu principal") para bater com o DOM atual.
2. **Teste API Advisor:** Uso de `@jest-environment node` para evitar "Response is not defined" ao testar a rota.
3. **Layout raiz:** Export de `viewport` e `themeColor` para mobile (Next 14).

---

## 6. Requisitos para produção

- **Ambiente**
  - `DATABASE_URL` (Supabase ou Postgres) acessível pelo Next (apps/web e/ou services/api).
  - Colunas opcionais em `User`: rodar `services/api/prisma/add_user_profile_columns.sql` se usar perfil completo.
  - `JWT_SECRET` e `JWT_REFRESH_SECRET` em produção (evitar fallback de dev).
- **Twilio (WhatsApp)**  
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` para "Enviar teste" e notificações.
- **Stripe**  
  - Chaves e Price/Product IDs configurados para planos Start e Pro.
- **OpenAI**  
  - `OPENAI_API_KEY` para o Assistente IA (planos que tenham o recurso).
- **Build**  
  - `npm run build` (em apps/web). Em alguns ambientes Windows, limpar `.next` antes em caso de erro de cache.

---

## 7. Avisos conhecidos (não bloqueantes)

- **React `fetchPriority`:** Aviso do Next.js Image no teste do Sidebar (atributo DOM); não impacta uso em produção.
- **Build Windows:** Possível falha de TypeScript por diferença de path (/) vs (\); limpar `apps/web/.next` e rodar o build de novo costuma resolver.

---

## 8. Conclusão

O sistema está **pronto para ir ao ar** após:

1. Configurar variáveis de ambiente e banco (incluindo colunas de perfil, se usar).
2. Executar o checklist manual dos fluxos críticos (criação de conta até logout).
3. Testar em mobile (viewport já configurado).
4. Manter os testes atuais (`npm run test`) e, se possível, acrescentar e2e (Playwright) para os fluxos principais.

Este documento serve como **relatório de QA** e **checklist de go-live** para o cliente.
