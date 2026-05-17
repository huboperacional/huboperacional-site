import Link from 'next/link';
import { PRODUCTS } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-paper border-b border-paper-3">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="font-mono text-xs text-brand-500 mb-4 tracking-wider">
              SOFTWAREHOUSE • PERCUS
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Software pra <span className="gradient-text">operação que cresce</span>
            </h1>
            <p className="text-lg md:text-xl text-steel-700 mb-8 max-w-2xl">
              Hub Operacional é o ponto de entrada pros produtos Percus:
              automação WhatsApp, IA aplicada e gestão para times brasileiros que querem operar sem fricção.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/produtos"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-lg no-underline hover:no-underline transition-colors text-center"
              >
                Ver produtos
              </Link>
              <Link
                href="/afiliados"
                className="bg-white hover:bg-paper border border-paper-3 hover:border-brand-500 text-fg font-semibold px-8 py-3.5 rounded-lg no-underline hover:no-underline transition-colors text-center"
              >
                Ser parceiro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Nossos produtos</h2>
            <p className="text-steel-500">{PRODUCTS.length} produtos em operação — todos rodando em produção no nosso stack.</p>
          </div>
          <Link href="/produtos" className="hidden md:block text-sm font-semibold text-brand-500 hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="md:hidden mt-8 text-center">
          <Link href="/produtos" className="text-sm font-semibold text-brand-500 hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
      </section>

      {/* CTA afiliados */}
      <section className="bg-white border-y border-paper-3">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="font-mono text-xs text-brand-500 mb-3 tracking-wider">PROGRAMA DE AFILIADOS</div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Indique nossos produtos. Receba comissão recorrente.
          </h2>
          <p className="text-steel-700 mb-8 max-w-2xl mx-auto">
            Cada venda feita via seu link gera comissão. Portal próprio mostra cliques,
            conversões e extrato em tempo real.
          </p>
          <Link
            href="/afiliados"
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-lg no-underline hover:no-underline transition-colors"
          >
            Conhecer o programa
          </Link>
        </div>
      </section>
    </>
  );
}
