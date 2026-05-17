import Link from 'next/link';
import type { Product } from '@/lib/products';

const STATUS_LABEL: Record<Product['status'], { label: string; cls: string }> = {
  producao: { label: 'em produção', cls: 'bg-emerald-50 text-emerald-700' },
  beta: { label: 'beta', cls: 'bg-amber-50 text-amber-700' },
  desenvolvimento: { label: 'em desenvolvimento', cls: 'bg-slate-100 text-slate-600' },
};

const CATEGORY_LABEL: Record<Product['category'], string> = {
  b2c: 'B2C',
  b2b: 'B2B',
  integracao: 'Integração',
  agencia: 'Agência',
};

export function ProductCard({ product }: { product: Product }) {
  const status = STATUS_LABEL[product.status];
  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group block bg-white rounded-xl border border-paper-3 p-6 hover:border-brand-500 transition-colors no-underline hover:no-underline"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${status.cls}`}>{status.label}</span>
        <span className="text-xs font-mono text-steel-500">{CATEGORY_LABEL[product.category]}</span>
      </div>
      <h3 className="font-semibold text-lg mb-1 group-hover:text-brand-500 transition-colors">
        {product.title}
      </h3>
      <p className="text-sm text-steel-500 mb-4">{product.tagline}</p>
      <span className="text-xs font-medium text-brand-500 group-hover:underline">
        Conhecer →
      </span>
    </Link>
  );
}
