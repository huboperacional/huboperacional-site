import { ImageResponse } from 'next/og';
import { getProductBySlug, getAllSlugs } from '@/lib/products';

// Node runtime (default): next/og needs it to pair with generateStaticParams for
// build-time SSG of one image per slug (edge runtime forbids generateStaticParams).
export const alt = 'Produto — Hub Operacional';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Pre-generate one image per product slug at build time (matches the page's SSG).
export function generateStaticParams(): { slug: string }[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Category → badge label + accent dot (approved in the R10 gate).
const CATEGORY: Record<string, { label: string; dot: string }> = {
  b2c: { label: 'Para você', dot: '#34d399' },
  b2b: { label: 'Para empresas', dot: '#38bdf8' },
  integracao: { label: 'Integração', dot: '#a78bfa' },
  agencia: { label: 'Para agências', dot: '#fb7185' },
};

// Status → bottom-right tag (only shown for non-production products).
const STATUS_TAG: Record<string, string> = {
  desenvolvimento: 'Em desenvolvimento',
  beta: 'Beta',
  producao: '',
};

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Defensive fallback (slugs come from generateStaticParams, so this is rare).
  const title = product?.title ?? 'Hub Operacional';
  const tagline = product?.tagline ?? 'Software pra operação que cresce';
  const category = product ? CATEGORY[product.category] : undefined;
  const statusTag = product ? STATUS_TAG[product.status] ?? '' : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0a6ad8, #064a99)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: parent-brand eyebrow + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, letterSpacing: 3, color: 'rgba(255,255,255,0.72)' }}>
            HUB.OPERACIONAL
          </div>
          {category ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 999,
                padding: '12px 26px',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', width: 16, height: 16, borderRadius: 8, background: category.dot, marginRight: 14 }} />
              {category.label}
            </div>
          ) : null}
        </div>

        {/* Middle: product title + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.9)', marginTop: 20 }}>
            {tagline}
          </div>
        </div>

        {/* Bottom: domain + optional status tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
            huboperacional.com.br
          </div>
          {statusTag ? (
            <div
              style={{
                display: 'flex',
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 2,
                color: 'rgba(255,255,255,0.85)',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '8px 16px',
              }}
            >
              {statusTag.toUpperCase()}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
