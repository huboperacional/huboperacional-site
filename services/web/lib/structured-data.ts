// JSON-LD structured data helpers (schema.org) for SEO rich results.

const BASE_URL = 'https://huboperacional.com.br';

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Percus',
    alternateName: 'Hub Operacional',
    url: BASE_URL,
    logo: `${BASE_URL}/opengraph-image`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'trafego@percus.com.br',
        telephone: '+5567933009440',
        areaServed: 'BR',
        availableLanguage: 'Portuguese',
      },
    ],
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}
