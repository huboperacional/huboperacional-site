# Histórico — huboperacional-site (até 2026-07)

> Arquivo de histórico movido do `HANDOFF.md` na adoção do canon V2 (2026-07-21). O HANDOFF descreve só o presente; o passado vive aqui. Ordem: mais recente no topo.

## 2026-07-20 — Re-smoke do affiliate happy-path (4/5 provas OK) + device WhatsApp kickado

Rodei o happy-path real (form de prod, telefone livre `5567920024429`, afiliado de teste `51f23e83` limpo do banco depois). **Os 3 bugs de 2026-07-14 foram corrigidos pelo Painel e verificados:** HTTP 200 em ~3s (era timeout de 15s) → BackgroundTasks OK; `identity_id` não-nulo (`f709a198`) → fix do 422 (payload v2 `{name,email,phone}`) OK; welcome dispara → migração Evolution→GOWA OK (msg 1 entregue em 3s).

**Só 1 de 4 mensagens chegou — causa NÃO é código.** Às 20:15:37, 2s após a msg 1, o WhatsApp deslogou remotamente os devices `Notificador` E `Auth`: `<stream:error code=401><conflict type=device_removed/>` + `RESTRICT_ALL_COMPANIONS`, `time_enforcement_ends`=1785183337 (2026-07-27 20:15 UTC, 7 dias exatos = fim do `reachout_timelock`). Reproduzido com curl direto no GOWA: 3 envios falham. Impacto maior: `Auth` é o device do OTP do auth-service central → login OTP-WhatsApp fora do ar em todo o ecossistema (OTP e-mail OK). Operador **re-linkou** às 20:49 (LIST_DEVICES: Auth+Notificador com JID de volta). Correção de erro meu: `RESTRICT_ALL_COMPANIONS` NÃO bloqueia re-pareamento. **Gap real:** welcome usa `asyncio.sleep(8)` fixo (`affiliateRoutes.py:142/153/160`), não o 6–12s random da política — trocar antes de re-smokear (risco de re-trigger na janela até ~27/07). Caixa cross-repo corrigida entregue ao Painel. Site 100% OK.

## 2026-07-14 — Smoke affiliate happy-path (3 bugs no Painel) + DEPLOY v0.3.5 + reorg 6.28.0

- **Smoke happy-path (browser, afiliado `e81273d6` limpo):** site OK (preflight 200, POST persistiu, CORS/payload provados). 3 achados no Painel (caixa entregue): (A) endpoint >15s → timeout do `api.ts`; (B) identity 422 (`name` vs `display_name`) → `identity_id` NULL; (C) welcome WA nunca disparou. Fix recomendado: side-effects assíncronos. Bug 500-on-duplicado RESOLVIDO pelo Painel (409, commit `083dd3e`).
- **DEPLOY `v0.3.5`** (imagem `huboperacional-site:v0.3.5`): #1 conteúdo definitivo dos 9 produtos `[5-T]` (`lib/products.ts`, Família Milionária em `.app`) + #2 Meta Pixel `641491994507686` `[5-T]` (`components/MetaPixel.tsx` + banner adaptativo no `CookieConsent`, ID baked no Dockerfile ARG). Build isolado no VPS BUILD_EXIT=0 (BuildKit cache honrado), service update rolling convergiu 1/1 sem outage. Browser confirmou Pixel (`fbevents.js`+`/tr PageView` 200) + GA4. Tags git `v0.3.4`/`v0.3.5`. Commits reorg `b3392b8`, feature `94cef78`.
- **Reorg canon 6.26.1 → 6.28.0 (caixa Delta):** adotado o cache incremental BuildKit em `deploy/Dockerfile.web` (`# syntax` + `--mount=type=cache` no `.npm` e `.next/cache`; `npm install`→`npm ci`). Fontes self-hosted N/A (projeto não usa `next/font/google`). Pilot npm verde. Self-host de fontes registrado como melhoria adiada.
- **Playwright E2E `[5-T]`:** suíte E2E (17 specs, route interception, zero chamada real) + contract-guard Vitest (4 casos). Verde local. Merged `feat/playwright-e2e`→`main` (`1262d3d`). Sem deploy (dev-tooling). Gotchas em memória `e2e-playwright-gotchas`.
- **OG image por produto `[4-C]`→`[5-T]`** (`app/produtos/[slug]/opengraph-image.tsx`, next/og SSG). Commit `9c890ba`. **GA4 + banner LGPD `[5-T]`** (`CookieConsent`+`Analytics`; gtag só após aceite). GA_ID `G-K60P2FZ61K` baked no build ARG. Commit `f90de47`. **DEPLOY `v0.3.4`** verificou OG+GA4 em prod. Incidente de deploy (~1min, rollback OK) — nunca encadear `build | tail && service update`.

## 2026-07-12/13 — v0.3 /new-client em prod + 3 side-effects ativados

- **v0.3 `/new-client`** deployada e verificada E2E: wizard bilíngue (`/new-client/[lang]` pt-br/en), endpoint `POST /public/new-client` no Painel (migration `client_onboarding` em `ads4pros_affiliate`), atribuição de afiliado via `ref_code`. Logos reais dos 5 brands. Redirect `/new-client`→pt-br. Data de nascimento no formato do país. Novo produto GHL-Gowa Adapter (9 produtos). Site prod `v0.3.3`. Commits `193559c`/`2ffc8aa`/`a2509f6`/`d337a7c`.
- **GOWA ativado** `[5-T]` (device `Notificador`, self-hosted `gowa.huboperacional.com.br`). **Sheets ativado** `[5-T]` (2026-07-13): operador habilitou Sheets API + compartilhou planilha V4 (`1rGtbHa-…`, aba `V4 Clientes`) com `plexco-backend-invoker@plexco-media-2026.iam.gserviceaccount.com`. **GHL ativado** `[5-T]` (2026-07-13): PIT do operador injetado como `GHL_TOKEN`, pipeline "01 Marketing Pipeline" `blBrCsr8YPOPkDQukiQ6` / stage "New Lead" `c421b90a`. Os 3 side-effects `[5-T]`. Env vars (`GOWA_*` + `GOOGLE_SA_JSON`) persistidas no compose `/opt/ads4pros-api/docker-compose.api.yml` (stack CLI-managed, não Portainer). Push feito 2026-07-12 (site `main`→`d9799c8`, 13 commits; Painel `main`→`170e60a`).

## Snapshot da tabela de features (2026-07-14 — fonte da verdade é `docs/PLANO.md`)

MVP v0.1 (6 páginas + 2 forms + tracking + sitemap) `[5-T]`. SEO v0.2 (Org+Breadcrumb JSON-LD, Twitter cards, sitemap lastmod, OG por produto, GA4+Pixel consent-gated) `[5-T]`. Qualidade (Vitest 16, Playwright 17) `[5-T]`. Conteúdo 9 produtos `[5-T]`. Smoke E2E affiliate happy-path `[0]` (bloqueado externo). v0.3 /new-client (wizard + endpoint + 3 side-effects GOWA/Sheets/GHL) `[5-T]`.

## Backlog antigo (Sprint 2 / v0.2 — supersequenciado por `docs/PLANO.md`)

SEO & Tracking; Qualidade (Vitest+Playwright, smoke E2E affiliate); Conteúdo definitivo dos produtos. Tudo movido pro PLANO como frentes v0.2.
