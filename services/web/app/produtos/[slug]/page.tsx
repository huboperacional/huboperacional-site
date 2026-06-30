import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, getProductBySlug, getAllSlugs } from '@/lib/products';
import { breadcrumbJsonLd } from '@/lib/structured-data';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Produto não encontrado' };
  return {
    title: product.title,
    description: product.tagline,
    openGraph: {
      title: `${product.title} — Hub Operacional`,
      description: product.tagline,
    },
  };
}

export const revalidate = 3600;

export default async function ProdutoDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  // JSON-LD Product schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    category: product.category,
    brand: { '@type': 'Brand', name: 'Percus' },
    ...(product.website && { url: product.website }),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Início', path: '/' },
    { name: 'Produtos', path: '/produtos' },
    { name: product.title, path: `/produtos/${product.slug}` },
  ]);

  const related = PRODUCTS.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/produtos" className="inline-flex items-center text-sm text-steel-500 hover:text-brand-500 mb-6 no-underline hover:underline">
          ← Catálogo
        </Link>

        <header className="mb-10">
          <div className="font-mono text-xs text-brand-500 mb-3 tracking-wider uppercase">{product.category}</div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">{product.title}</h1>
          <p className="text-lg text-steel-700">{product.tagline}</p>
        </header>

        <section className="prose max-w-none mb-10">
          <p className="text-base leading-relaxed text-fg">{product.description}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">O que faz</h2>
          <ul className="space-y-3">
            {product.features.map((f, i) => (
              <li key={i} className="flex gap-3 text-fg">
                <span className="text-brand-500 font-bold mt-0.5">→</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-paper-3 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Pronto pra começar?</h2>
          <p className="text-steel-500 mb-5">
            {product.status === 'producao'
              ? 'Plataforma em produção. Vamos conversar pra entender seu caso.'
              : 'Avise-me quando estiver disponível e ganhe acesso antecipado.'}
          </p>
          <Link
            href={product.cta.url}
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg no-underline hover:no-underline transition-colors"
          >
            {product.cta.label}
          </Link>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Produtos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/produtos/${p.slug}`}
                  className="block bg-white border border-paper-3 hover:border-brand-500 rounded-lg p-4 no-underline hover:no-underline transition-colors"
                >
                  <div className="font-semibold text-sm mb-1">{p.title}</div>
                  <div className="text-xs text-steel-500">{p.tagline}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
