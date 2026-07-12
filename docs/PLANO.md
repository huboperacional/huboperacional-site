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

- `[4-C]` Schema.org Organization (sitewide) + BreadcrumbList (página de produto) — `lib/structured-data.ts` + layout + produto. Verificado em build (prerender) — falta prod (deploy R24).
- `[4-C]` Open Graph Twitter cards (`twitter:card` summary_large_image) — em `layout.tsx`. Verificado em build — falta prod.
- `[4-C]` Sitemap com `lastmod` curado (constante por página + `updatedAt` por produto) — `sitemap.ts` + `products.ts`. Verificado (13 URLs com lastmod 2026-05-17) — falta prod.
- `[0]` OG image por produto via next/og per-page (hoje só default global)
- `[0]` Pixel Meta + Google Ads tag (gtag/fbq) — respeitar R18 (tracking ≠ auth)

## Frente: v0.2 — Qualidade

- `[5-T]` Vitest (unit) — `lib/structured-data.ts`, `lib/tracking.ts`, `lib/api.ts`. 16 testes verdes (`npm run test`). Setup `vitest` + `jsdom` + `vitest.config.ts`.
- `[0]` Playwright (E2E) — fluxo dos 2 forms + navegação. **Cuidado:** submit real dispara POST ao Painel (`/public/*`) criando leads/afiliados; precisa de network mockada ou endpoint de teste.
- `[0]` Smoke E2E real do affiliate-signup happy-path (dispara 4 WA ao operador `5567933009440`) — **gated por operador** (R5)

## Frente: v0.2 — Conteúdo

- `[0]` 🎨? Conteúdo definitivo dos 8 produtos em `services/web/lib/products.ts` (hoje placeholder coerente; curadoria do operador)

---

## Frente: v0.3 — Cadastro de Cliente (`/new-client`)

> **Núcleo em produção `[5-T]` (2026-07-12).** Spec: `docs/superpowers/specs/2026-06-30-new-client-wizard-design.md`. Feature cross-repo (site + Painel). Design usa o design system atual (exceção R10 declarada). Deployado em prod: site `huboperacional-site:v0.3.0`, Painel `ads4pros-api:newclient-202607121910`, migration aplicada em `ads4pros_affiliate`. Os 3 side-effects entram **codados mas inativos** (flag-gated pela cred) até o operador preencher o `.env` do Painel.

- `[5-T]` Wizard bilíngue `/new-client/[lang]` (pt-br/en) — welcome→país→empresa→responsável→financeiro→obrigado, i18n por dicionário, captura `?ref=` + campo oculto, validação por etapa, pagamento por país, regime só BR. Verificado no browser (2 idiomas) + prod HTTP 200 + conteúdo. **Logos reais** dos 5 brands (HOPE hero + Edifica/V4/Micro Investors/ADS4Pros) em `public/logos/` via `next/image`. Redirect `/new-client`→`/new-client/pt-br`. Campo "Endereço completo" removido (endereço só por campos).
- `[5-T]` Backend `POST /public/new-client` no Painel — Pydantic `extra='forbid'` + rate-limit 5/h + tabela `client_onboarding` + atribuição de afiliado (`_findAffiliate`, sem comissão). Verificado E2E em prod: 422 em campo extra, 201 `{ok,id}`, row persistida com `affiliate_id` resolvido do `ref_code` (test row limpo).
- `[4-C]` Side-effect WhatsApp via **GOWA** (responsável no idioma + admin) — `integrations/gowaClient.py`, flag `gowa_send_url`. **INATIVO:** falta URL de envio do GOWA no `.env` (confirmar formato do endpoint ao ativar).
- `[4-C]` Side-effect append na planilha **"V4 Clientes"** — `integrations/googleSheets.py`, flag `google_sa_json`. **INATIVO:** service-account Google ausente no `.env` (+ compartilhar planilha, conferir contagem de colunas viva).
- `[4-C]` Side-effect registro no **GHL** ("01 Marketing Pipeline", Location `ElbRWEbPclFoAfVW9bm0`) — `integrations/ghlClient.py`, flag `ghl_token`. **INATIVO:** token GHL + mapear `ghl_pipeline_id`/`ghl_stage_id` ausentes no `.env`.

## Histórico (changelog do plano em si)

- **2026-06-30** — Criação do PLANO ao trazer o projeto pro canon Percus v6.26.1 (umbrella REORGANIZAR_PROJETO). MVP v0.1.1 registrado como `[5-T]`; backlog v0.2 do HANDOFF formalizado como frentes `[0]`.
- **2026-06-30** — Frente SEO & Tracking: Schema.org Org+BreadcrumbList, Twitter cards e sitemap lastmod implementados e verificados em build → `[4-C]` (prod pendente, deploy é cadência R24 + sem push antes de 01/07). Commits `e68215c`, `17e4919`, `547403f`.
- **2026-06-30** — Frente Qualidade: Vitest + jsdom + 16 unit tests (structured-data, tracking, api) verdes → `[5-T]`. Playwright deferido (risco de submit real). Build de produção segue OK com os `.test.ts`.
- **2026-06-30** — Adicionada Frente v0.3 "Cadastro de Cliente (/new-client)" após brainstorming/plan mode. Spec aprovada. Feature cross-repo grande, NÃO iniciada. 3 side-effects (GOWA/Sheets/GHL) bloqueados por creds ausentes no `.env` do Painel.
- **2026-07-12** — Frente v0.3 implementada e deployada. Núcleo (wizard bilíngue + endpoint + persistência + atribuição de afiliado) `[5-T]` verificado E2E em prod. 3 side-effects codados flag-gated (`[4-C]`, inativos até cred no `.env`). Commits: site `d9799c8` (push OK), Painel `170e60a` (push OK). Deploy: site `v0.3.0`, Painel `newclient-202607121910`, migration `client_onboarding` aplicada. Hold de push (01/07) expirado — backlog v0.2 SEO `[4-C]` também foi pushado junto (13 commits do site).
