import Link from 'next/link';

export default function ContasPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Contas</h1>
        <p className="mt-1 text-zinc-400">
          Contas bancárias, contas a pagar e a receber
        </p>
      </header>

      <section className="rounded-2xl border border-nebula-purple/20 bg-[rgba(20,20,28,0.6)] p-6 shadow-card backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Contas bancárias</h2>
        <p className="text-zinc-400">
          Listagem e CRUD de contas virá aqui. Integração com Prisma e API REST.
        </p>
        <Link
          href="/app/dashboard"
          className="mt-4 inline-block text-nebula-violet hover:underline"
        >
          Voltar ao Dashboard
        </Link>
      </section>
    </div>
  );
}
