# Spec — OG image por produto (next/og per-page)

_Data: 2026-07-14 · Frente: v0.2 SEO · Status na entrada: `[0]` → alvo `[4-C]` (build) → `[5-T]` (prod, no próximo deploy R24)_

## Contexto e objetivo

Hoje o site tem **uma** OG image default global (`services/web/app/opengraph-image.tsx`, `next/og`, 1200×630). Toda página de produto (`/produtos/[slug]`) herda esse card genérico ao ser compartilhada. Objetivo: **cada produto ter seu próprio share card** com nome, tagline e categoria, gerado por `next/og` per-page.

Direção visual aprovada no gate R10 (mockup fiel: `https://claude.ai/code/artifact/a63caa7b-b092-45bf-9532-d9963fb24690`), **direção A** — estende o padrão da OG default, não é tela nova.

## Não-objetivos (YAGNI)

- **Fonte custom** (Space Grotesk) no edge — adiciona fetch/latência; fica `system-ui` (fiel ao default). Melhoria futura.
- **Ícone lucide** no card — complexo no `next/og` edge; o default também não tem.
- **Cor própria por produto** — não existe em `products.ts`; diferenciação vem do acento de categoria.
- **Curadoria de conteúdo** — o card renderiza `products.ts` verbatim; texto definitivo é item separado do backlog.

## Direção visual (A) — anatomia do card

1200×630, gradiente `linear-gradient(135deg, #0a6ad8, #064a99)`, texto branco, `system-ui`, padding ~80px, `column` + `space-between` (mesmo esqueleto do default):

- **Topo:** eyebrow `HUB.OPERACIONAL` (≈24px, 600, letter-spacing, branco 72%) à esquerda; **badge de categoria** à direita (pill translúcido `rgba(255,255,255,0.14)` + borda `rgba(255,255,255,0.22)`, dot colorido + label).
- **Meio:** `title` do produto (≈76px, 800, line-height 1.03, wrap em 2 linhas se longo) + `tagline` (≈32px, branco 90%).
- **Base:** `huboperacional.com.br` (mono, ≈22px, branco 60%) à esquerda; **tag de status opcional** à direita.

## Mapa de dados (tudo de `lib/products.ts`, verbatim)

| Elemento | Fonte |
|---|---|
| Título | `product.title` |
| Tagline | `product.tagline` |
| Badge (label + dot) | `product.category` via mapa abaixo |
| Tag de status | `product.status` (ver regra) |

**Categoria → { label, dot }** (aprovado):

| `category` | label | dot (hex) |
|---|---|---|
| `b2c` | Para você | `#34d399` (emerald) |
| `b2b` | Para empresas | `#38bdf8` (sky) |
| `integracao` | Integração | `#a78bfa` (violet) |
| `agencia` | Para agências | `#fb7185` (rose) |

**Status → tag** (aprovado, incluído): `desenvolvimento` → "Em desenvolvimento"; `beta` → "Beta"; `producao` → **nenhuma tag**. Tag = fundo `rgba(255,255,255,0.1)`, uppercase, letter-spacing.

## Arquitetura

**Novo arquivo:** `services/web/app/produtos/[slug]/opengraph-image.tsx` — co-locado com a página de produto.
- Exports padrão do `next/og`: `runtime = 'edge'`, `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, `alt` (derivado do produto).
- `generateStaticParams()` retornando os slugs (`getAllSlugs()`) — pré-gera as imagens no build (consistente com a página SSG + `revalidate 3600`).
- `default async function` recebe `{ params: { slug } }` → `getProductBySlug(slug)`. Se achar, renderiza o card. **Se `undefined`** (defensivo — não deve ocorrer, slugs vêm de `generateStaticParams`): renderiza um card genérico "Hub Operacional" (fallback).
- `alt` dinâmico: `` `${product.title} — Hub Operacional` `` (ou genérico no fallback).

**Wiring de metadata:** automático. A `generateMetadata` da página (`app/produtos/[slug]/page.tsx`) seta `openGraph: { title, description }` **sem** `images` → o Next injeta `og:image` **e** `twitter:image` a partir do arquivo co-locado. Nenhuma mudança na página é necessária.

**Constantes de estilo:** inline no arquivo (o default OG também é self-contained). Não extrair helper compartilhado agora (só 2 rotas OG — YAGNI); se virar 3+, considerar um `lib/og-theme.ts`.

## Critério de "pronto"

- **`[4-C]` (build, alcançável nesta sessão):** `NODE_ENV=production npm run build` gera as imagens sem erro; inspeção local do PNG de ≥2 produtos (categorias diferentes + um com status tag) confirma layout/cores/dados corretos; o HTML da página de produto referencia `og:image`/`twitter:image` apontando pra `/produtos/[slug]/opengraph-image/...`.
- **`[5-T]` (prod, no próximo deploy — cadência R24, não per-feature):** `curl` do PNG em prod → HTTP 200 `image/png`; validador OG (ex.: cartão do WhatsApp/Twitter) mostra o card certo. Segue o mesmo padrão do SEO v0.2 (código shippado, verificado em prod depois).

## Riscos

- **`generateStaticParams` no arquivo OG:** se ausente e `dynamicParams` default, a imagem gera on-demand no 1º acesso (aceitável, mas preferimos build-time). Incluir o export.
- **Satori (engine do next/og) só suporta um subconjunto de flexbox/CSS** — sem `gap` em alguns casos, sem `text-wrap: balance`. Implementar com `display:flex` explícito + `margin`/`lineHeight`; validar no build. O mockup HTML é aproximação; a fonte da verdade do layout é o PNG gerado.
- **Título longo** (ex.: "GHL-Evolution Adapter", "Robo de Vendas / TiAtendo") deve quebrar sem estourar — limitar `font-size` e permitir wrap; validar os slugs mais longos no build.

## Implementação

Mecânica (1 arquivo `next/og` espelhando o default) → **delegável ao DeepSeek (R13)** com revisão Claude (R1–R12) + cross-provider (R11). Marcar `🤖` no PLANO.
