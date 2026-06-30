import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';

const BASE = 'https://huboperacional.com.br';

// Curated lastmod dates. Git is excluded from the Docker build context, so we
// can't derive file mtime at build time. Bump a date when that page's content
// actually changes.
const STATIC_LASTMOD: Record<string, string> = {
  '/': '2026-05-17',
  '/produtos': '2026-05-17',
  '/afiliados': '2026-05-17',
  '/sobre': '2026-05-17',
  '/contato': '2026-05-17',
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                 lastModified: STATIC_LASTMOD['/'],          changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/produtos`,   lastModified: STATIC_LASTMOD['/produtos'],  changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/afiliados`,  lastModified: STATIC_LASTMOD['/afiliados'], changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/sobre`,      lastModified: STATIC_LASTMOD['/sobre'],     changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contato`,    lastModified: STATIC_LASTMOD['/contato'],   changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE}/produtos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
