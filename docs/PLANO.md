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

- `[5-T]` Schema.org Organization (sitewide) + BreadcrumbList (página de produto) — `lib/structured-data.ts` + layout + produto. **Verificado em prod 2026-07-13** (`curl` home: `Organization`+`ContactPoint`; produto: `Product`+`Brand`+`BreadcrumbList` 3 ListItems).
- `[5-T]` Open Graph Twitter cards (`twitter:card` summary_large_image) — em `layout.tsx`. **Verificado em prod 2026-07-13** (`twitter:card=summary_large_image` + OG completo 1200×630).
- `[5-T]` Sitemap com `lastmod` curado (constante por página + `updatedAt` por produto) — `sitemap.ts` + `products.ts`. **Verificado em prod 2026-07-13** (14 URLs, todas com `<lastmod>`).
- `[5-T]` OG image por produto (next/og per-page, direção A aprovada no gate R10) — `app/produtos/[slug]/opengraph-image.tsx`, SSG por slug (runtime Node, não edge — `generateStaticParams` exige), badge de categoria (dot por cor) + tag de status opcional. Build gera 9 PNGs corretos (inspeção visual de b2c/produção + b2b/desenvolvimento OK). Wiring automático (page não seta `openGraph.images`). Spec `docs/superpowers/specs/2026-07-14-og-image-per-product-design.md`. **Verificado em prod (deploy `v0.3.4`, 2026-07-14):** 3 produtos `200 image/png`, product page com `og:image`.
- `[5-T]` GA4 (`G-K60P2FZ61K`) via **banner de consentimento LGPD opt-in** — Meta Pixel adiado pelo operador. `components/CookieConsent` + `Analytics` (gtag só carrega após "Aceitar"; revogar via link "Cookies" no footer; page_view SPA). `tracking.ts` intocado (sempre-ligado). GA_ID **baked no build** (`Dockerfile.web` ARG — NEXT_PUBLIC é inline em build, não runtime). Build + E2E verdes (5 specs consent + 17 existentes = 22; warmup no globalSetup resolveu flake do next dev). Spec `docs/superpowers/specs/2026-07-14-ga4-consent-banner-design.md`. Measurement Protocol secret **fora do repo** (site sem backend). **Verificado em prod (deploy `v0.3.4`):** browser real → banner renderiza; após "Aceitar" o `gtag/js?id=G-K60P2FZ61K` carrega (200) e `/g/collect` dispara `page_view` (204) + rastreio de navegação SPA. Falta só o operador confirmar no GA4 Realtime.
- `[5-T]` Meta Pixel (`641491994507686`, marketing) via o **mesmo banner de consent opt-in** — `components/MetaPixel.tsx` (loader `fbevents.js` + SPA PageView, espelha Analytics.tsx) + banner **adaptativo** em `CookieConsent` (sem Pixel id = texto analytics-only idêntico ao anterior; com Pixel = "análise e marketing" num aceite só — direção "ampliar o banner" aprovada pelo operador). ID baked no `Dockerfile.web` ARG (default = prod, override vazio p/ staging). Deploy v0.3.5. **Verificado E2E em prod (browser real):** após "Aceitar", `fbevents.js` 200 + `signals/config/641491994507686` 200 + `facebook.com/tr ...ev=PageView` 200 (GA4 carrega junto); zero erro no console.

## Frente: v0.2 — Qualidade

- `[5-T]` Vitest (unit) — `lib/structured-data.ts`, `lib/tracking.ts`, `lib/api.ts`. 16 testes verdes (`npm run test`). Setup `vitest` + `jsdom` + `vitest.config.ts`.
- `[5-T]` Playwright (E2E) — 3 forms via route interception (17 specs) + contract-guard Vitest (4 casos). Rede mockada, zero chamada real ao Painel. Runner via `next dev` (Chromium). Spec `docs/superpowers/specs/2026-07-14-playwright-e2e-design.md`, plano `docs/superpowers/plans/2026-07-14-playwright-e2e.md`. Verificado local (suítes verdes 2026-07-14).
- `[0]` (parcial) Smoke E2E real do affiliate-signup happy-path. **Tentado 2026-07-14:** create-affiliate já é comprovado (há afiliados reais no DB), mas o welcome-WA-em-signup-novo segue sem smoke E2E — o número usado `5567933009440` já é afiliado (`uniq_affiliates_phone`), precisa de um telefone livre. **Bug descoberto (repo Painel):** o endpoint devolve HTTP 500 genérico em telefone duplicado em vez de 409/422 — fix entregue como caixa pro Painel (cross-repo), **em andamento na sessão do Painel**. Fecha `[5-T]` quando houver número livre.

## Frente: v0.2 — Conteúdo

- `[5-T]` Conteúdo definitivo dos 9 produtos em `services/web/lib/products.ts` — acentos + polish, fatos do MVP preservados, domínio do Família Milionária alinhado em `.app`. Deploy v0.3.5 (2026-07-14). **Verificado em prod** (browser: taglines acentuadas + "9 produtos" no ar). Curadoria fina do operador pode refinar mais, mas o placeholder ASCII saiu.

---

## Frente: v0.3 — Cadastro de Cliente (`/new-client`)

> **Núcleo em produção `[5-T]` (2026-07-12).** Spec: `docs/superpowers/specs/2026-06-30-new-client-wizard-design.md`. Feature cross-repo (site + Painel). Design usa o design system atual (exceção R10 declarada). Deployado em prod: site `huboperacional-site:v0.3.0`, Painel `ads4pros-api:newclient-202607121910`, migration aplicada em `ads4pros_affiliate`. Os 3 side-effects entram **codados mas inativos** (flag-gated pela cred) até o operador preencher o `.env` do Painel.

- `[5-T]` Wizard bilíngue `/new-client/[lang]` (pt-br/en) — welcome→país→empresa→responsável→financeiro→obrigado, i18n por dicionário, captura `?ref=` + campo oculto, validação por etapa, pagamento por país, regime só BR. Verificado no browser (2 idiomas) + prod HTTP 200 + conteúdo. **Logos reais** dos 5 brands (HOPE hero + Edifica/V4/Micro Investors/ADS4Pros) em `public/logos/` via `next/image`. Redirect `/new-client`→`/new-client/pt-br`. Campo "Endereço completo" removido (endereço só por campos).
- `[5-T]` Backend `POST /public/new-client` no Painel — Pydantic `extra='forbid'` + rate-limit 5/h + tabela `client_onboarding` + atribuição de afiliado (`_findAffiliate`, sem comissão). Verificado E2E em prod: 422 em campo extra, 201 `{ok,id}`, row persistida com `affiliate_id` resolvido do `ref_code` (test row limpo).
- `[5-T]` Side-effect WhatsApp via **GOWA** (responsável no idioma + admin) — `integrations/gowaClient.py`, device `Notificador` (multi-device, header `X-Device-Id`). **ATIVO e verificado E2E em prod** (env `GOWA_SEND_URL`/`GOWA_BASIC_AUTH`/`GOWA_DEVICE_ID` setadas no service).
- `[5-T]` Side-effect append na planilha **"V4 Clientes"** — `integrations/googleSheets.py`, flag `google_sa_json` (SA `plexco-backend-invoker@plexco-media-2026.iam.gserviceaccount.com`). **ATIVO e verificado E2E em prod (2026-07-13):** operador habilitou a Sheets API (projeto `538510710999`) + compartilhou a planilha V4 como Editor; `POST /public/new-client` DELETE-ME appendou a linha correta na aba (Data/empresa/CNPJ/responsável/e-mail/telefone na ordem da spec) — linha de teste + row do `client_onboarding` limpos. `GOOGLE_SA_JSON` persistido no compose (ver HANDOFF).
- `[5-T]` Side-effect registro no **GHL** ("01 Marketing Pipeline", Location `ElbRWEbPclFoAfVW9bm0`) — `integrations/ghlClient.py`, flag `ghl_token`. **ATIVO e verificado E2E (2026-07-13):** Private Integration Token (`pit-…`) do operador injetado como `GHL_TOKEN`; pipeline `blBrCsr8YPOPkDQukiQ6` / stage inicial "New Lead" `c421b90a-…` mapeados via `GET /opportunities/pipelines`. Teste DELETE-ME criou contato + opportunity no pipeline/stage certos (status open) — tudo limpo depois. 4 vars persistidas no compose.

## Histórico (changelog do plano em si)

- **2026-06-30** — Criação do PLANO ao trazer o projeto pro canon Percus v6.26.1 (umbrella REORGANIZAR_PROJETO). MVP v0.1.1 registrado como `[5-T]`; backlog v0.2 do HANDOFF formalizado como frentes `[0]`.
- **2026-06-30** — Frente SEO & Tracking: Schema.org Org+BreadcrumbList, Twitter cards e sitemap lastmod implementados e verificados em build → `[4-C]` (prod pendente, deploy é cadência R24 + sem push antes de 01/07). Commits `e68215c`, `17e4919`, `547403f`.
- **2026-06-30** — Frente Qualidade: Vitest + jsdom + 16 unit tests (structured-data, tracking, api) verdes → `[5-T]`. Playwright deferido (risco de submit real). Build de produção segue OK com os `.test.ts`.
- **2026-06-30** — Adicionada Frente v0.3 "Cadastro de Cliente (/new-client)" após brainstorming/plan mode. Spec aprovada. Feature cross-repo grande, NÃO iniciada. 3 side-effects (GOWA/Sheets/GHL) bloqueados por creds ausentes no `.env` do Painel.
- **2026-07-12** — Frente v0.3 implementada e deployada. Núcleo (wizard bilíngue + endpoint + persistência + atribuição de afiliado) `[5-T]` verificado E2E em prod. 3 side-effects codados flag-gated (`[4-C]`, inativos até cred no `.env`). Commits: site `d9799c8` (push OK), Painel `170e60a` (push OK). Deploy: site `v0.3.0`, Painel `newclient-202607121910`, migration `client_onboarding` aplicada. Hold de push (01/07) expirado — backlog v0.2 SEO `[4-C]` também foi pushado junto (13 commits do site).
- **2026-07-12 (iterações)** — Site `v0.3.3`: logos reais dos 5 brands + redirect `/new-client`→pt-br + fix Dockerfile `public/` (logos davam 404) + data de nascimento no formato do país (BR DD/MM/AAAA) + endereço só por campos + CTAs dos produtos pras plataformas reais + **novo produto GHL-Gowa Adapter** (9 produtos). **GOWA ATIVADO** `[5-T]` (device `Notificador`, self-hosted no VPS) — WhatsApp do cadastro funciona E2E. Sheets + GHL seguem `[4-C]` bloqueados por cred. Commits site `193559c/2ffc8aa/a2509f6/d337a7c`, Painel `cb9acfb/34e74da`.
- **2026-07-13** — **Sheets ATIVADO** `[5-T]`: operador habilitou Sheets API + compartilhou planilha V4; teste E2E DELETE-ME appendou/limpou OK. Env vars dos side-effects (`GOWA_*` + `GOOGLE_SA_JSON`) **persistidas** no compose canônico `/opt/ads4pros-api/docker-compose.api.yml` (resolve o gotcha do `--env-add`). Descoberto que o stack `ads4pros-api` é CLI-managed (não Portainer).
- **2026-07-13** — **GHL ATIVADO** `[5-T]`: operador tinha colado o PIT no `.env` errado (raiz do repo do site, gitignored/não-commitado) com nomes errados (`GHL_PRIVATE_TOKEN`/`GHL_SUBACCOUNT_ID`; config espera `GHL_TOKEN`/`GHL_LOCATION_ID`). PIT validado na API (HTTP 200), pipeline "01 Marketing Pipeline" (`blBrCsr8YPOPkDQukiQ6`) / stage "New Lead" (`c421b90a`) mapeados, 4 vars injetadas (`--env-add`) + persistidas no compose. Teste E2E criou contato+opportunity certos, limpo. **Os 3 side-effects (GOWA/Sheets/GHL) agora `[5-T]` — v0.3 /new-client 100% completa.** Resta só smoke SEO (frente v0.2) + tag git v0.3.3.
- **2026-07-14** — Frente v0.2 Qualidade: suíte Playwright E2E (17 specs, route interception, zero chamada real ao Painel) + contract-guard Vitest (4 casos) → `[5-T]`, verdes local. Branch `feat/playwright-e2e`. Runner via `next dev` (evita gotcha NODE_ENV); wizard ganhou `data-testid` mínimos; fix de CORS preflight no mock-api; `new-client.spec` em serial mode (race do compilador on-demand do next dev). Review do conselho (DeepSeek+Llama) na spec + review final APPROVED_WITH_MINOR (negative-validation tests reforçados com `:invalid`).
- **2026-07-14** — Frente v0.2 SEO: **OG image por produto** `[4-C]` (`app/produtos/[slug]/opengraph-image.tsx`). Direção A aprovada no gate R10 via mockup fiel. next/og SSG por slug (runtime Node — edge proíbe `generateStaticParams`), badge de categoria (dot por cor) + tag de status opcional, `system-ui` (sem fonte custom no edge). Build gerou 9 PNGs; inspeção visual de familia-milionaria (b2c/produção, sem tag) + plexco-tickets (b2b/desenvolvimento, tag "EM DESENVOLVIMENTO") confirmou layout/cores/dados. Escrito direto (não delegado ao DeepSeek — Satori tem CSS restrito). `[5-T]` no próximo deploy (R24).
- **2026-07-14** — **DEPLOY `v0.3.4`** (imagem `huboperacional-site:v0.3.4`): OG image + GA4/consent → `[5-T]` verificados em prod (OG 200 image/png; GA4 gtag+page_view via browser real). **Incidente (~1min, resolvido):** o `docker build` do VPS falhou 1x por blip de rede do npm, e o comando encadeava `docker build | tail && docker service update` — **o pipe pro `tail` mascarou o exit code do build falho**, então o `service update` rodou com imagem inexistente e o Swarm parou a task v0.3.3 → 404. **Rollback** `--image v0.3.3 --force` restaurou em ~5s. Retry do build isolado (npm voltou) → OK → `service update v0.3.4` convergiu. **Lição:** nunca encadear `service update` após `build | tail` (checar exit do build separado). Ver memória `deploy-vps-gotchas`.
- **2026-07-14** — Frente v0.2 SEO/Tracking: **GA4 + banner de consentimento LGPD** `[4-C]`→`[5-T]` (item "Pixel Meta+Google Ads" reduzido a GA4; Meta adiado pelo operador). Abordagem A (opt-in) aprovada no gate R10 via mockup. `CookieConsent` + `Analytics` + `CookiePrefsLink`; gtag só carrega após aceite, revogável via footer. tracking.ts intocado. **Achado de review (opus):** NEXT_PUBLIC é inline em build → GA_ID tem que ir no `Dockerfile.web` ARG (compose runtime era no-op pro client) — corrigido. E2E `consent.spec.ts` (5) + `globalSetup` de warmup que resolveu o flake de cold-compile do next dev (22/22 verde). Measurement Protocol secret mantido fora do repo. Escrito direto (não DeepSeek). `[5-T]` = GA4 Realtime no próximo deploy.
- **2026-07-14** — **Reorganização canon 6.26.1 → 6.28.0** (caixa Delta do `REORGANIZAR_PROJETO`, não toca código de negócio). Delta = housekeeping interno do canon (soaks fechados, R25 pointer, parity `.sh`, `external-action-guard`), **exceto** a diretiva opt-in de build Docker frio (v6.27.0 `deploy-build-cache`). Adotado só o **cache incremental BuildKit** em `deploy/Dockerfile.web` (`# syntax=docker/dockerfile:1` + `--mount=type=cache` no `.npm` e no `.next/cache`; `npm install`→`npm ci`, lockfile em sync). **Fontes self-hosted N/A** (projeto sem `next/font/google`; fontes por `<link>` runtime → sem fetch no build a eliminar). Pilot npm verde (`npm ci` 186 pkgs + `NODE_ENV=production npm run build` BUILD_EXIT=0, 31 páginas); efeito do cache confirma no próximo deploy (Docker ausente na máquina local; VPS Docker 28.5.2 = BuildKit default). `.percus-version` 6.26.1→6.28.0 + CLAUDE.md sincronizado. Self-host de fontes (`<link>` → `next/font/local`; perf + LGPD) registrado como melhoria separada adiada.
- **2026-07-14** — **DEPLOY `v0.3.5`** (imagem `huboperacional-site:v0.3.5`) + tags git `v0.3.4` (retroativa em `3108a14`) e `v0.3.5` (em `94cef78`). Shippou: **#1 conteúdo definitivo dos 9 produtos** + **#2 Meta Pixel** (gated pelo banner de consent) + o **BuildKit cache** do reorg. Build isolado no VPS BUILD_EXIT=0 (os cache mounts `# syntax`+`--mount` foram honrados num build real → fecha a ressalva do reorg); service update rolling convergiu 1/1 **sem outage**. Smoke prod: 8 páginas 200, conteúdo refinado no ar, OG image 200, e browser real confirmou o Pixel (`fbevents.js`+`/tr PageView` 200) + GA4. #1 e #2 → `[5-T]` em prod. Review R11 (DeepSeek, sem crítico; `JSON.stringify` no `fbq('init')` aplicado de finding preferência).
- **2026-07-14** — **#3 smoke affiliate — tentado, parcial.** `POST /public/affiliate-signup` com `whatsapp=5567933009440` deu **500** — o número já é afiliado (`uniq_affiliates_phone`), então nenhum afiliado/WA foi criado. Revela um **bug de robustez no Painel** (500 genérico em duplicado, devia ser 409/422) — fix entregue como caixa cross-repo (operador enviou pro Painel; em andamento lá). O happy-path com telefone novo segue pendente (precisa de número livre). Não afeta o site.
