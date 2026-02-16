/**
 * Nebula Finance API (standalone)
 * Para desenvolvimento local ou deploy em container.
 * Em produção com Vercel, as rotas ficam em apps/web/app/api/
 */
import { createServer } from 'http';

const PORT = process.env.PORT ?? 4000;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ name: 'Nebula Finance API', status: 'ok', version: '0.1.0' }));
});

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
