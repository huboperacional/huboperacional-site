# SEO sem dependência — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar JSON-LD `Organization` (sitewide) + `BreadcrumbList` (páginas de produto), Twitter cards e `lastmod` curado no sitemap — melhorias de SEO não-visuais, sem dependência externa.

**Architecture:** Um helper puro `lib/structured-data.ts` gera objetos JSON-LD; `layout.tsx` injeta `Organization` em todas as páginas e declara o Twitter card no `metadata`; a página de produto injeta `BreadcrumbList`; `sitemap.ts` passa a usar datas curadas (constante por página estática + `updatedAt` por produto).

**Tech Stack:** Next.js 15 App Router (RSC), TypeScript strict. Sem test runner no projeto → verificação por `npm run build` + `curl` no dev server.

**Nota R10:** feature não-visual (sem tela nova/redesenho) — gate de design não se aplica.
**Nota commits:** R11 (review-auto) antes de cada commit; `git push` **proibido antes de 01/07** (não pushar).

---

### Task 1: Helper JSON-LD + Organization sitewide + Twitter card

**Files:**
- Create: `services/web/lib/structured-data.ts`
- Modify: `services/web/app/layout.tsx`

- [ ] **Step 1: Criar o helper `lib/structured-data.ts`**

```typescript
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
```

- [ ] **Step 2: Editar `app/layout.tsx`** — import do helper, Twitter card no `metadata`, e render do Organization no `<body>`.

Adicionar o import (após a linha `import { TrackingProvider } ...`):
```typescript
import { organizationJsonLd } from '@/lib/structured-data';
```

Adicionar `twitter` ao objeto `metadata` (logo após o bloco `openGraph: { ... },`):
```typescript
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Operacional — Software Percus',
    description: 'Softwarehouse Percus: produtos B2C, B2B e integrações.',
  },
```

Injetar o script logo após a abertura do `<body ...>` (antes de `<TrackingProvider />`):
```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
```

- [ ] **Step 3: Build sanity**

Run: `cd services/web && npm run build`
Expected: build conclui sem erro de tipo/lint (output `standalone`).

- [ ] **Step 4: Verificar render no dev server**

Run:
```bash
cd services/web && (npm run dev >/tmp/next-dev.log 2>&1 &) && sleep 8 && \
  curl -s http://localhost:3000/ | grep -o '"@type":"Organization"' && \
  curl -s http://localhost:3000/ | grep -o 'twitter:card' && \
  pkill -f "next dev" || true
```
Expected: imprime `"@type":"Organization"` e `twitter:card`.

- [ ] **Step 5: Review (R11) + commit (sem push)**

Run:
```bash
cd "d:/Claud Automations/huboperacional-site" && \
pwsh -NoProfile -ExecutionPolicy Bypass -File "D:/Claud Automations/_Novo_Projeto/scripts/percus-review-auto.ps1"
```
Tratar findings críticos. Então:
```bash
git add services/web/lib/structured-data.ts services/web/app/layout.tsx
git commit -m "feat(seo): Organization JSON-LD sitewide + Twitter card"
```
NÃO rodar `git push`.

---

### Task 2: BreadcrumbList na página de produto

**Files:**
- Modify: `services/web/app/produtos/[slug]/page.tsx`

- [ ] **Step 1: Import do helper** — adicionar após `import { PRODUCTS, getProductBySlug, getAllSlugs } from '@/lib/products';`:

```typescript
import { breadcrumbJsonLd } from '@/lib/structured-data';
```

- [ ] **Step 2: Montar o breadcrumb** — logo após o objeto `const jsonLd = { ... };` (o Product JSON-LD existente, que termina em `};`):

```typescript
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Início', path: '/' },
    { name: 'Produtos', path: '/produtos' },
    { name: product.title, path: `/produtos/${product.slug}` },
  ]);
```

- [ ] **Step 3: Renderizar o segundo script** — logo após o `<script ... JSON.stringify(jsonLd) ... />` existente:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
```

- [ ] **Step 4: Build sanity**

Run: `cd services/web && npm run build`
Expected: build OK.

- [ ] **Step 5: Verificar render**

Run:
```bash
cd services/web && (npm run dev >/tmp/next-dev.log 2>&1 &) && sleep 8 && \
  curl -s http://localhost:3000/produtos/familia-milionaria | grep -o '"@type":"BreadcrumbList"' && \
  curl -s http://localhost:3000/produtos/familia-milionaria | grep -o '"@type":"Product"' && \
  pkill -f "next dev" || true
```
Expected: imprime `"@type":"BreadcrumbList"` e `"@type":"Product"`.

- [ ] **Step 6: Review (R11) + commit (sem push)**

```bash
cd "d:/Claud Automations/huboperacional-site" && \
pwsh -NoProfile -ExecutionPolicy Bypass -File "D:/Claud Automations/_Novo_Projeto/scripts/percus-review-auto.ps1"
```
Tratar findings. Então:
```bash
git add services/web/app/produtos/[slug]/page.tsx
git commit -m "feat(seo): BreadcrumbList JSON-LD na pagina de produto"
```
NÃO pushar.

---

### Task 3: sitemap lastmod curado + `updatedAt` por produto

**Files:**
- Modify: `services/web/lib/products.ts`
- Modify: `services/web/app/sitemap.ts`

- [ ] **Step 1: Adicionar campo ao type `Product`** em `lib/products.ts` — dentro do `export type Product = { ... }`, após `status: 'producao' | 'beta' | 'desenvolvimento';`:

```typescript
  updatedAt: string;   // ISO YYYY-MM-DD — last meaningful content change (sitemap lastmod)
```

- [ ] **Step 2: Adicionar `updatedAt: '2026-05-17',` a cada um dos 8 produtos** no array `PRODUCTS` (mesma indentação dos outros campos do objeto, ex. logo após a linha `status: '...',` de cada produto). Todos os 8 recebem `'2026-05-17'` (data de ship da MVP).

- [ ] **Step 3: Reescrever `app/sitemap.ts`** com datas curadas:

```typescript
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
```

- [ ] **Step 4: Build sanity**

Run: `cd services/web && npm run build`
Expected: build OK (sem erro de tipo — `updatedAt` agora obrigatório nos 8 produtos).

- [ ] **Step 5: Verificar sitemap**

Run:
```bash
cd services/web && (npm run dev >/tmp/next-dev.log 2>&1 &) && sleep 8 && \
  curl -s http://localhost:3000/sitemap.xml | grep -o '<lastmod>2026-05-17</lastmod>' | head -3 && \
  pkill -f "next dev" || true
```
Expected: imprime linhas `<lastmod>2026-05-17</lastmod>` (não a data/hora de "agora").

- [ ] **Step 6: Review (R11) + commit (sem push)**

```bash
cd "d:/Claud Automations/huboperacional-site" && \
pwsh -NoProfile -ExecutionPolicy Bypass -File "D:/Claud Automations/_Novo_Projeto/scripts/percus-review-auto.ps1"
```
Tratar findings. Então:
```bash
git add services/web/lib/products.ts services/web/app/sitemap.ts
git commit -m "feat(seo): sitemap lastmod curado + updatedAt por produto"
```
NÃO pushar.

---

### Task 4: Tracking + fecho

- [ ] **Step 1: Atualizar `docs/PLANO.md`** — na Frente "v0.2 — SEO & Tracking", mover Schema.org Org+BreadcrumbList, sitemap lastmod e Twitter cards de `[0]` para `[5-T]` quando verificados E2E (ou `[4-C]` se ainda não verificado em prod — deploy é separado, R24). OG por produto e pixels permanecem `[0]`.

- [ ] **Step 2: Atualizar `docs/mock-audit.md`** — sem novas telas/mocks; só registrar no histórico que a sessão mexeu em metadata (não em UI). Opcional.

- [ ] **Step 3: Commit do tracking (sem push)**

```bash
cd "d:/Claud Automations/huboperacional-site" && \
pwsh -NoProfile -ExecutionPolicy Bypass -File "D:/Claud Automations/_Novo_Projeto/scripts/percus-review-auto.ps1" && \
git add docs/PLANO.md docs/mock-audit.md && \
git commit -m "docs(tracking): v0.2 SEO frente atualizada no PLANO"
```

---

## Verificação final (E2E local)

- `cd services/web && npm run build` → sem erros.
- Dev server + `curl`:
  - `/` contém `"@type":"Organization"` + `twitter:card`.
  - `/produtos/<slug>` contém `"@type":"BreadcrumbList"` + `"@type":"Product"`.
  - `/sitemap.xml` mostra `<lastmod>2026-05-17</lastmod>` (curado).
- Validar os 3 tipos no Schema Markup Validator (https://validator.schema.org/) colando o HTML renderizado.
- Pós-deploy (quando ocorrer, R24): repetir os curls contra `https://huboperacional.com.br`.

## Notas de status (tags PLANO)
- Marcar `[5-T]` só após verificação E2E (build + render confirmado). Deploy em prod é cadência R24 (separado) — até lá, `[4-C]` é defensável.
