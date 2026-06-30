import { describe, it, expect } from 'vitest';
import { organizationJsonLd, breadcrumbJsonLd } from './structured-data';

describe('organizationJsonLd', () => {
  const org = organizationJsonLd() as Record<string, any>;

  it('is an Organization with the Percus identity', () => {
    expect(org['@type']).toBe('Organization');
    expect(org.name).toBe('Percus');
    expect(org.alternateName).toBe('Hub Operacional');
    expect(org.url).toBe('https://huboperacional.com.br');
  });

  it('points logo to the opengraph image', () => {
    expect(org.logo).toBe('https://huboperacional.com.br/opengraph-image');
  });

  it('exposes the configured contact point', () => {
    const cp = org.contactPoint[0];
    expect(cp['@type']).toBe('ContactPoint');
    expect(cp.email).toBe('trafego@percus.com.br');
    expect(cp.telephone).toBe('+5567933009440');
    expect(cp.areaServed).toBe('BR');
  });
});

describe('breadcrumbJsonLd', () => {
  const crumb = breadcrumbJsonLd([
    { name: 'Início', path: '/' },
    { name: 'Produtos', path: '/produtos' },
    { name: 'Família Milionária', path: '/produtos/familia-milionaria' },
  ]) as Record<string, any>;

  it('is a BreadcrumbList with ordered positions', () => {
    expect(crumb['@type']).toBe('BreadcrumbList');
    expect(crumb.itemListElement).toHaveLength(3);
    expect(crumb.itemListElement.map((e: any) => e.position)).toEqual([1, 2, 3]);
  });

  it('builds absolute item URLs from the base', () => {
    expect(crumb.itemListElement[0].item).toBe('https://huboperacional.com.br/');
    expect(crumb.itemListElement[2].item).toBe(
      'https://huboperacional.com.br/produtos/familia-milionaria',
    );
    expect(crumb.itemListElement[1].name).toBe('Produtos');
  });
});
