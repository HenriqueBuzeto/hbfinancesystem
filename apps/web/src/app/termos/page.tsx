import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso | HB Finance',
  description: 'Termos de uso do sistema HB Finance.',
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-nebula-black px-4 py-12">
      <div className="mx-auto max-w-3xl text-zinc-300">
        <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
        <p className="mt-2 text-sm text-zinc-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        <div className="prose prose-invert mt-8 space-y-4">
          <p>
            Ao utilizar o HB Finance, você concorda com estes termos. O sistema destina-se a uso pessoal para
            controle financeiro. Não nos responsabilizamos por decisões tomadas com base nos dados ou relatórios.
          </p>
          <p>
            É proibido o uso para fins ilegais, revenda do serviço sem autorização ou tentativa de acessar dados de
            outros usuários. Reservamo-nos o direito de encerrar contas que violem estes termos.
          </p>
          <p>
            Para dúvidas, entre em contato pelo e-mail de suporte informado no aplicativo.
          </p>
        </div>
        <p className="mt-12">
          <Link href="/login" className="text-nebula-violet hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </main>
  );
}
