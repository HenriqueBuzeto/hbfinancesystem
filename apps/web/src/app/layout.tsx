import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ChakraProviders } from '@/providers/ChakraProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
};

export const metadata: Metadata = {
  title: 'HB Finance | Sistema Financeiro Pessoal',
  description: 'Controle suas finanças com HB Finance. Dashboard, contas a pagar e receber, relatórios, Assistente IA e notificações.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-nebula-black text-zinc-100 antialiased">
        <ChakraProviders>
          {children}
        </ChakraProviders>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: { background: 'rgba(20, 20, 28, 0.95)', border: '1px solid rgba(124, 58, 237, 0.3)' },
          }}
        />
      </body>
    </html>
  );
}
