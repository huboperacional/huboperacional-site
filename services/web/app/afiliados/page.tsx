import type { Metadata } from 'next';
import { AffiliateForm } from '@/components/AffiliateForm';

export const metadata: Metadata = {
  title: 'Afiliados',
  description: 'Programa de parceiros Percus: indique e receba comissão recorrente em cada venda.',
};

const BENEFITS = [
  { title: 'Comissão recorrente', body: 'Você ganha tanto na adesão quanto nas mensalidades, automaticamente.' },
  { title: 'Portal próprio', body: 'Cliques, conversões, comissões e extrato em tempo real em parceiros.ads4pros.com.' },
  { title: 'Links rastreados', body: 'Cada produto tem seu link de indicação único. Atribuição via 15 campos canon (UTM + click IDs).' },
  { title: 'Pagamento via PIX', body: 'Comissões aprovadas viram payout PIX automático seguindo regras transparentes.' },
];

export default function AfiliadosPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-10 max-w-2xl">
        <div className="font-mono text-xs text-brand-500 mb-3 tracking-wider">PROGRAMA DE AFILIADOS</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Indique. Receba comissão. Sem complicação.
        </h1>
        <p className="text-steel-700">
          Cadastro grátis. Você recebe seu código + links em 4 mensagens no WhatsApp logo após confirmar.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {BENEFITS.map((b) => (
          <div key={b.title} className="bg-white border border-paper-3 rounded-xl p-5">
            <h3 className="font-semibold mb-2">{b.title}</h3>
            <p className="text-sm text-steel-500">{b.body}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border border-paper-3 rounded-xl p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-2">Cadastro de parceiro</h2>
        <p className="text-sm text-steel-500 mb-6">
          Em ~1 minuto você está com seu código e seus primeiros links de indicação no WhatsApp.
        </p>
        <AffiliateForm />
      </section>

      <section className="mt-12 text-sm text-steel-500 max-w-2xl">
        <h3 className="font-semibold text-fg mb-2">Como funciona</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Você cadastra e recebe seu código (ex: <code className="font-mono text-fg">nome-sobrenome-x1y2</code>) por WhatsApp.</li>
          <li>Compartilha seus links de indicação (formato <code className="font-mono text-fg">vendas.ads4pros.com/i/CODE/produto</code>).</li>
          <li>Conforme alguém compra pelo seu link, comissão é registrada e aprovada após o período de garantia do produto.</li>
          <li>Comissões aprovadas viram payout PIX no dia configurado.</li>
        </ol>
      </section>
    </div>
  );
}
