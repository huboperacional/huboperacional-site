# Plano — huboperacional-site

_Atualizado em: 2026-06-30_
_Fonte da verdade do tracking. Atualize imediatamente após cada etapa concluída (R2)._

---

## Legenda (adaptada pro perfil frontend)

Este projeto é **frontend puro sem backend próprio** — as tags backend `[1-S]` (schema), `[2-E]` (endpoint), `[3-H]` (hook) **não se aplicam**. O pipeline de uma feature aqui é:

| Tag | Significado | Condição obrigatória |
|-----|-------------|----------------------|
| `[0]` | Planejada | — |
| `[4-C]` | Componente | Tela/seção renderiza com dado real (página em build, conteúdo correto) |
| `[5-T]` | ✅ Verificado E2E | Página/SEO: `curl` HTTP 200 em prod + inspeção (meta/JSON-LD/sitemap). Form: submit real → entry no Painel (`site_leads` / affiliate criado). "Build passa" não conta (R1). |

**Marcações visuais (ortogonais, acumulam, vão ANTES da tag):**
- `🎨` design aprovado (Claude Design / shadcn) · `🎨?` feature visual sem draft (BLOQUEADA em `[0]` até virar `🎨` — ver `DESIGN_WORKFLOW.md`)
- `🤖` implementação delegada ao DeepSeek (R13)
- `✓` revisor cross-provider aprovou no marco (R11)

**Regra de profundidade:** não inicie feature nova de uma frente enquanto outra da mesma frente estiver em `[4-C]` sem fechar.

---

## Frente: MVP v0.1 (EM PRODUÇÃO)

Entregue 2026-05-17, v0.1.1 em 2026-05-17. Tudo verificado em prod (`https://huboperacional.com.br`).

- `[5-T]` ✓ Home `/` — hero + produtos featured + CTA afiliados — 2026-05-17
- `[5-T]` ✓ Catálogo `/produtos` — grid agrupado por categoria — 2026-05-17
- `[5-T]` ✓ Detalhe `/produtos/[slug]` — 8 produtos SSG + JSON-LD Product + revalidate 3600 — 2026-05-17
- `[5-T]` ✓ Página `/afiliados` — programa + form cadastro inline — 2026-05-17
- `[5-T]` ✓ Página `/contato` — form lead (defaultMessage via `?produto`) — 2026-05-17
- `[5-T]` ✓ Página `/sobre` — 2026-05-17
- `[5-T]` ✓ Form contato → `POST /public/leads` do Painel → tabela `site_leads` — 2026-05-17
- `[5-T]` ✓ Form afiliados → `POST /public/affiliate-signup` do Painel — smoke validação OK; happy-path real (dispara WA) pendente (ver Qualidade)
- `[5-T]` ✓ Tracking 15 campos (`lib/tracking.ts`, localStorage TTL 90d) anexado às submissions — 2026-05-17
- `[5-T]` ✓ `sitemap.xml` (13 URLs) + `robots.txt` — 2026-05-17
- `[5-T]` ✓ Favicon SVG (`app/icon.svg`) + OG image dinâmica default (`app/opengraph-image.tsx`, next/og) — 2026-05-17

## Frente: v0.2 — SEO & Tracking

- `[0]` Schema.org Organization + BreadcrumbList (JSON-LD global no layout)
- `[0]` OG image por produto via next/og per-page (hoje só default global)
- `[0]` Sitemap com `lastmod` real (hoje sem lastmod)
- `[0]` Open Graph Twitter cards (`twitter:card` summary_large_image)
- `[0]` Pixel Meta + Google Ads tag (gtag/fbq) — respeitar R18 (tracking ≠ auth)

## Frente: v0.2 — Qualidade

- `[0]` Vitest (unit) — `lib/tracking.ts`, `lib/api.ts`
- `[0]` Playwright (E2E) — fluxo dos 2 forms + navegação
- `[0]` Smoke E2E real do affiliate-signup happy-path (dispara 4 WA ao operador `5567933009440`) — **gated por operador** (R5)

## Frente: v0.2 — Conteúdo

- `[0]` 🎨? Conteúdo definitivo dos 8 produtos em `services/web/lib/products.ts` (hoje placeholder coerente; curadoria do operador)

---

## Histórico (changelog do plano em si)

- **2026-06-30** — Criação do PLANO ao trazer o projeto pro canon Percus v6.26.1 (umbrella REORGANIZAR_PROJETO). MVP v0.1.1 registrado como `[5-T]`; backlog v0.2 do HANDOFF formalizado como frentes `[0]`.
