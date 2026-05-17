import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com o time Percus. Resposta em até 24h via email ou WhatsApp.',
};

function ContactFormSection({ produto }: { produto?: string }) {
  const defaultMessage = produto
    ? `Tenho interesse em saber mais sobre ${produto}.`
    : '';
  return <ContactForm defaultMessage={defaultMessage} />;
}

export default async function ContatoPage({ searchParams }: { searchParams: Promise<{ produto?: string }> }) {
  const params = await searchParams;
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <header className="mb-10">
        <div className="font-mono text-xs text-brand-500 mb-3 tracking-wider">CONTATO</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Fala com a gente</h1>
        <p className="text-steel-700">
          Conta o que você precisa. Respondemos em até 24h via email ou WhatsApp.
        </p>
      </header>

      <Suspense fallback={<div className="text-steel-500">Carregando…</div>}>
        <ContactFormSection produto={params.produto} />
      </Suspense>

      <div className="mt-12 pt-8 border-t border-paper-3 text-sm text-steel-500">
        <p>
          Prefere outro canal? Email:{' '}
          <a href="mailto:operacao@huboperacional.com.br" className="text-brand-500 hover:underline">
            operacao@huboperacional.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
