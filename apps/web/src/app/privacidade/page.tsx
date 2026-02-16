import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade | HB Finance',
  description: 'Política de privacidade do sistema HB Finance.',
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-nebula-black px-4 py-12">
      <div className="mx-auto max-w-3xl text-zinc-300">
        <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-zinc-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        <div className="prose prose-invert mt-8 space-y-4">
          <p>
            O HB Finance trata seus dados financeiros e pessoais com confidencialidade. Coletamos apenas o
            necessário para o funcionamento do serviço: e-mail, nome, dados de transações e contas que você cadastrar.
          </p>
          <p>
            Não vendemos seus dados. Podemos utilizá-los para melhorar o produto, enviar notificações que você autorizar
            (e-mail, WhatsApp) e cumprir obrigações legais. Seus dados são armazenados de forma segura e podem ser
            exportados ou excluídos mediante solicitação.
          </p>
          <p>
            Ao criar conta ou usar o sistema, você aceita esta política. Alterações serão comunicadas por e-mail ou
            no aplicativo.
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
