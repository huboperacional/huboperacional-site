import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';

const BASE = 'https://huboperacional.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                     lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/produtos`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/afiliados`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/sobre`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contato`,        lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE}/produtos/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
