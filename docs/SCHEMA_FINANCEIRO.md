# HB Finance – Schema completo do sistema financeiro

## Visão geral

O banco foi desenhado para um sistema financeiro pessoal/empresarial com multi-tenant, contas bancárias, transações, categorias, orçamentos, contas a pagar/receber, favorecidos, etiquetas, conciliação e transações recorrentes.

---

## Tabelas

| Tabela | Descrição |
|--------|-----------|
| **Tenant** | Organização (pessoal/empresa); multi-tenant |
| **User** | Usuário (email, senha, tenant, role) |
| **Account** | Contas (banco, caixa, cartão, investimento); saldo, agência, número |
| **Category** | Categorias (receita/despesa), hierárquicas, ordem, sistema |
| **Transaction** | Lançamentos (valor, data, conta, categoria, favorecido, transferência, conciliação) |
| **Payee** | Favorecidos/beneficiários (nome, documento, notas) |
| **Tag** | Etiquetas para filtrar transações |
| **TransactionTag** | N:N entre Transaction e Tag |
| **Bill** | Contas a pagar/receber (vencimento, status, recorrência, parcelas) |
| **Budget** | Orçamento por categoria e período (ex.: mês) |
| **RecurringTemplate** | Modelo de transação recorrente (mensal/trimestral/anual) |
| **Reconciliation** | Conciliação bancária (período, saldo inicial/final, status) |
| **Notification** | Notificações ao usuário |
| **NotificationPreference** | Preferências de canal (e-mail, WhatsApp) |
| **AuditLog** | Log de ações (quem, o quê, quando) |

---

## Triggers

- **updatedAt** – Atualiza a coluna `"updatedAt"` em: Tenant, User, Account, Category, Transaction, Bill, Budget, NotificationPreference, Payee, Tag, RecurringTemplate, Reconciliation.
- **sync_account_balance** – Após INSERT/UPDATE/DELETE em `Transaction`, recalcula o saldo da `Account` (soma/subtrai o valor da conta).

---

## Funções e procedures (SQL)

| Nome | Uso |
|------|-----|
| **create_transaction_from_bill**(bill_id, account_id, paid_at) | Cria uma transação a partir de uma conta paga/recebida (Bill com status PAID). |
| **get_dashboard_summary**(tenant_id, period, ref_date) | Retorna totais do período: receita, despesa, saldo e quantidade de transações. `period`: 'day', 'month', 'year'. |
| **create_transfer**(tenant_id, from_account_id, to_account_id, amount, description, date) | Cria uma transferência entre contas (duas transações com `transferPairId`). |
| **close_reconciliation**(reconciliation_id, closing_balance) | Fecha uma conciliação (define `closedAt`, `closingBalance`, status CLOSED). |
| **run_recurring_templates_for_month**(tenant_id, year, month) | Gera transações dos modelos recorrentes ativos para o mês e atualiza `nextRunAt`. Retorna o número de transações criadas. |
| **get_projected_balance**(tenant_id, account_id, until_date) | Retorna saldo atual, total a pagar, total a receber e saldo projetado até a data. |

---

## Como aplicar

**Banco novo (do zero):**
```bash
cd services/api
npm run db:setup
```
Isso aplica a migração inicial (0_init), a migração completa (1_complete_finance) e os triggers/procedures.

**Banco que já tem as tabelas iniciais (só novas tabelas/colunas):**
```bash
cd services/api
node scripts/run-db-setup.js --complete-only
node scripts/run-db-setup.js --triggers
```

**Só atualizar triggers e procedures:**
```bash
npm run db:setup:triggers
```

Depois, gere o cliente e (se quiser) rode o seed:
```bash
npm run db:generate
npm run db:seed
```
