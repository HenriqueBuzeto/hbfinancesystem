/**
 * Teste de integração do endpoint /api/ai/advisor
 * Em ambiente Jest (Node), simulamos o handler da rota.
 * @jest-environment node
 */
import { POST } from '../route';

const mockRequest = (body: unknown) =>
  new Request('http://localhost/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/ai/advisor', () => {
  it('retorna 400 quando payload é inválido (sem userId)', async () => {
    const req = mockRequest({
      anonymizedTransactions: [],
      balances: [],
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('retorna 200 e estrutura AdvisorResponse com payload válido', async () => {
    const req = mockRequest({
      userId: 'user_abc',
      anonymizedTransactions: [
        { date: '2025-01-15', amount: -150, type: 'expense', category: 'Alimentação' },
        { date: '2025-01-10', amount: 5000, type: 'income', category: 'Salário' },
      ],
      balances: [{ accountId: 'acc_1', balance: 6200, currency: 'BRL' }],
      income: 5000,
      goals: [{ name: 'Reserva', target: 10000, current: 3000 }],
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('recommendations');
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data).toHaveProperty('projection');
    expect(data).toHaveProperty('riskAlerts');
    expect(data).toHaveProperty('confidence');
    expect(data).toHaveProperty('disclaimer');
    expect(['baixa', 'média', 'alta']).toContain(data.confidence);
  });
});
