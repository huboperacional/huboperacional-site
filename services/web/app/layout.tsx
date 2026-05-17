import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrackingProvider } from '@/components/TrackingProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Hub Operacional — Software Percus',
    template: '%s | Hub Operacional',
  },
  description:
    'Hub Operacional é a vitrine da Percus: softwarehouse focada em automação WhatsApp, IA aplicada e gestão para times brasileiros.',
  metadataBase: new URL('https://huboperacional.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://huboperacional.com.br',
    siteName: 'Hub Operacional',
    title: 'Hub Operacional — Software Percus',
    description: 'Softwarehouse Percus: produtos B2C, B2B e integrações.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <TrackingProvider />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
