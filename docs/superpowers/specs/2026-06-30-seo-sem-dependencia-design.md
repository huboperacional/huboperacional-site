---
spec: huboperacional-site v0.2 — SEO sem dependência
data: 2026-06-30
fase: v0.2 / Frente "SEO & Tracking" (docs/PLANO.md)
status: approved (brainstorming + decisões do operador)
escopo: 3 entregas não-visuais de SEO; sem dependência de IDs externos ou curadoria
---

# SEO sem dependência — Design Spec

## Contexto

A MVP v0.1.1 está em produção mas o SEO estrutural está incompleto: não há JSON-LD
de `Organization`, não há `BreadcrumbList` nas páginas de produto, não há Twitter cards,
e o `sitemap.xml` usa `new Date()` (`now`) em todas as URLs — sinalizando falsamente que
todo conteúdo muda a cada deploy. Estas são melhorias de metadata invisíveis ao usuário,
de alto valor para indexação/rich results, e sem dependência de assets ou IDs externos.

**Nota R10:** feature não-visual (JSON-LD, meta tags, sitemap). Sem tela nova nem redesenho
→ o gate de design visual não se aplica (exceção declarada).

## Decisões do operador (brainstorming 2026-06-30)

| Pergunta | Decisão |
|---|---|
| Contato no Organization | email `trafego@percus.com.br` + WhatsApp `+5567933009440` |
| Logo da Organization | `https://huboperacional.com.br/opengraph-image` (PNG existente) |
| Perfis sociais (`sameAs`) | omitir (não há perfis ainda) |
| Estratégia `lastmod` | datas curadas (constante por página estática + `updatedAt` por produto) |

## Escopo (Functional Requirements)

### FR1 — Organization JSON-LD (sitewide)
- Helper novo `services/web/lib/structured-data.ts` exporta funções puras retornando objetos JSON-LD.
- `organizationJsonLd()` retorna `Organization` com: `name: "Percus"`, `alternateName: "Hub Operacional"`,
  `url`, `logo` (→ `/opengraph-image`), `contactPoint` (customer support, email + telephone, `areaServed: "BR"`,
  `availableLanguage: "Portuguese"`). Sem `sameAs`.
- Renderizado em `app/layout.tsx` via `<script type="application/ld+json">` (presente em todas as páginas).

### FR2 — BreadcrumbList JSON-LD (página de produto)
- `breadcrumbJsonLd(items)` retorna `BreadcrumbList` com `itemListElement` ordenado (`position`, `name`, `item` URL absoluta).
- `app/produtos/[slug]/page.tsx` (que já emite `Product` JSON-LD) passa a emitir também o `BreadcrumbList`:
  Início (`/`) → Produtos (`/produtos`) → `<título do produto>` (`/produtos/<slug>`).

### FR3 — Twitter cards
- `app/layout.tsx`: adicionar `twitter: { card: 'summary_large_image', title, description }` ao `metadata`.
- Imagem do card: reaproveitada automaticamente do `app/opengraph-image.tsx` pelo Next (sem `twitter-image` dedicado).
- Sem `site`/`creator` (não há handle X).

### FR4 — sitemap lastmod curado
- `lib/products.ts`: adicionar campo `updatedAt: string` (ISO `YYYY-MM-DD`) ao type `Product` e aos 8 produtos
  (default `'2026-05-17'`, data de ship da MVP).
- `app/sitemap.ts`: substituir `new Date()` por datas curadas — mapa `STATIC_LASTMOD: Record<string,string>`
  para as 5 rotas estáticas + `product.updatedAt` para as rotas de produto.

## Entidades / contrato

- `Product` ganha `updatedAt: string` (ISO date). Não há outras mudanças de tipo.
- Funções JSON-LD retornam objetos serializáveis (`Record<string, unknown>`), renderizados via
  `JSON.stringify` em `dangerouslySetInnerHTML`.

## Arquivos

- **Novo:** `services/web/lib/structured-data.ts`
- **Editados:** `services/web/app/layout.tsx`, `services/web/app/produtos/[slug]/page.tsx`,
  `services/web/app/sitemap.ts`, `services/web/lib/products.ts`

## Fora de escopo (YAGNI)

- `WebSite` schema + `SearchAction` (não há busca interna).
- OG image por produto (next/og per-page) — outra frente.
- Pixels Meta + Google Ads — outra frente (precisa de IDs).
- `sameAs` / links sociais no Footer — quando houver perfis.
- Logo dedicado — quando houver asset quadrado ≥112px.

## Success Criteria

- SC1: `npm run build` passa (sanity — não conta como "pronto", R1).
- SC2: HTML renderizado contém `Organization` JSON-LD válido (Schema Markup Validator sem erros).
- SC3: `/produtos/<slug>` contém `BreadcrumbList` + `Product` JSON-LD válidos.
- SC4: `<head>` contém `twitter:card = summary_large_image`.
- SC5: `/sitemap.xml` mostra `lastmod` curado (não muda a cada build).
- SC6 (pós-deploy, quando ocorrer): re-verificar SC2–SC5 em produção via `curl` + validador.

## Edge cases

- Produto sem `updatedAt` → fallback pra constante de release (defensivo, embora todos tenham).
- `opengraph-image` é 1200x630 (não quadrado) — aceitável como `logo` por ora; trocar quando houver logo dedicado.

## Verificação E2E

1. `cd services/web && npm run build` → sem erro de tipo/build.
2. `npm run dev` + `curl -s localhost:3000 | grep -o 'application/ld+json'` e inspeção do conteúdo Organization.
3. `curl -s localhost:3000/produtos/familia-milionaria` → BreadcrumbList + Product presentes.
4. `curl -s localhost:3000/sitemap.xml` → lastmod curado por URL.
5. Validar JSON-LD no Schema Markup Validator (https://validator.schema.org/).
