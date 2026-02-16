/**
 * HB Finance - Aplica migrações (tabelas) e triggers/procedures no PostgreSQL.
 * Uso: node scripts/run-db-setup.js [--init] [--complete-only] [--triggers]
 *   --init          aplica 0_init e 1_complete_finance (banco vazio)
 *   --complete-only aplica só 1_complete_finance (novas tabelas/colunas em banco existente)
 *   --triggers      aplica triggers e procedures
 *   Sem flags: aplica --init e --triggers
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env não encontrado em services/api. Configure DATABASE_URL.');
  }
  const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      env[m[1].trim()] = val;
    }
  }
  return env;
}

async function runSql(client, sql, label) {
  try {
    await client.query(sql);
    console.log('OK:', label);
  } catch (err) {
    console.error('Erro em', label, ':', err.message);
    throw err;
  }
}

async function main() {
  const env = loadEnv();
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida no .env');
  }

  const args = process.argv.slice(2);
  const doInit = args.length === 0 || args.includes('--init');
  const doCompleteOnly = args.includes('--complete-only');
  const doTriggers = args.length === 0 || args.includes('--triggers');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    if (doInit) {
      const initPath = path.join(__dirname, '..', 'prisma', 'migrations', '0_init', 'migration.sql');
      const initSql = fs.readFileSync(initPath, 'utf8');
      await runSql(client, initSql, 'Migração inicial (tabelas)');
      const completePath = path.join(__dirname, '..', 'prisma', 'migrations', '1_complete_finance', 'migration.sql');
      if (fs.existsSync(completePath)) {
        const completeSql = fs.readFileSync(completePath, 'utf8');
        await runSql(client, completeSql, 'Schema completo (Payee, Tag, Reconciliation, etc.)');
      }
    }
    if (doCompleteOnly) {
      const completePath = path.join(__dirname, '..', 'prisma', 'migrations', '1_complete_finance', 'migration.sql');
      if (!fs.existsSync(completePath)) throw new Error('Migração 1_complete_finance não encontrada.');
      const completeSql = fs.readFileSync(completePath, 'utf8');
      await runSql(client, completeSql, 'Schema completo (novas tabelas/colunas)');
    }

    if (doTriggers) {
      const trigPath = path.join(__dirname, '..', 'prisma', 'triggers_procedures.sql');
      const trigSql = fs.readFileSync(trigPath, 'utf8');
      await runSql(client, trigSql, 'Triggers e procedures');
    }

    console.log('Setup do banco concluído.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
