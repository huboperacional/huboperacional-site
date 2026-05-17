import type { Metadata } from 'next';
import { PRODUCTS } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Produtos',
  description: `Catálogo completo: ${PRODUCTS.length} produtos Percus em operação. WhatsApp + IA + gestão.`,
};

const CATEGORIES = [
  { id: 'b2b', label: 'B2B' },
  { id: 'b2c', label: 'B2C' },
  { id: 'agencia', label: 'Agência' },
  { id: 'integracao', label: 'Integração' },
] as const;

export default function ProdutosPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 max-w-2xl">
        <div className="font-mono text-xs text-brand-500 mb-3 tracking-wider">CATÁLOGO</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Produtos Percus</h1>
        <p className="text-steel-700">
          {PRODUCTS.length} produtos em operação. Tudo construído no mesmo stack (FastAPI + Next.js + Postgres) e
          deployado no nosso VPS — sem dependência de SaaS pago.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = PRODUCTS.filter((p) => p.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="mb-12">
            <h2 className="text-sm font-mono uppercase tracking-wider text-steel-500 mb-4">{cat.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
