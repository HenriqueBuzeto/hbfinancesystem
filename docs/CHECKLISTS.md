# HB Finance – Checklists

## Segurança

- [ ] JWT short-lived (ex.: 15 min) + refresh token em httpOnly cookie
- [ ] Validação de entrada com Zod em todos os endpoints
- [ ] Rate limiting (API Gateway ou middleware Next.js)
- [ ] CORS whitelist (NEXT_PUBLIC_APP_URL e domínios permitidos)
- [ ] Helmet ou headers de segurança (X-Frame-Options, CSP)
- [ ] Campos sensíveis criptografados at rest (tokens de pagamento, etc.)
- [ ] Logs de auditoria para ações administrativas (AuditLog)
- [ ] LGPD/GDPR: mínimo de PII, fluxo de anonimização/remoção

## Performance (Core Web Vitals)

- [ ] LCP: next/image para imagens, fontes com next/font (Inter), critical CSS
- [ ] CLS: dimensões explícitas em imagens e placeholders, evitar layout shift na Sidebar
- [ ] INP: debounce em inputs pesados, workers para cálculos pesados
- [ ] Code-splitting: dynamic import para partículas e gráficos
- [ ] Caching: revalidate em fetch, cache de API quando fizer sentido
- [ ] Lighthouse CI no pipeline (branch main/preview)

## Acessibilidade (WCAG 2.1 AA)

- [ ] Contraste de texto (mín. 4.5:1 para texto normal)
- [ ] Foco visível em todos os interativos (outline com cor do tema)
- [ ] Navegação por teclado (Sidebar, modais, formulários)
- [ ] Labels associados a inputs (sr-only quando necessário)
- [ ] aria-current na navegação atual
- [ ] prefers-reduced-motion respeitado (globals.css)
- [ ] Landmarks: main, nav, aside com roles/ids apropriados

## Testes

- [ ] Unit: 2+ componentes React (ex.: Sidebar, Card financeiro) com Jest + Testing Library
- [ ] Integração: 1+ teste de API (ex.: POST /api/ai/advisor) com supertest ou fetch
- [ ] E2E: fluxo login → dashboard com Playwright
- [ ] Coverage mínimo definido (ex.: 70% em serviços críticos)
