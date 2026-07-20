# HANDOFF — huboperacional-site

**Status:** ✅ MVP v0.1.1 + **v0.3 `/new-client`** em produção em `https://huboperacional.com.br`. Site image **`v0.3.5`** (conteúdo definitivo 9 produtos + Meta Pixel + BuildKit cache), Painel `ads4pros-api:newclient-202607121910`.
**Última atualização:** 2026-07-14

> **2026-07-14 (sessão smoke affiliate happy-path — 3 bugs no Painel achados):** rodei o **happy-path real** do `/afiliados` no browser contra prod (telefone livre `5567920024429`, afiliado de teste `e81273d6` limpo do banco depois — DELETE-ME). **Site 100% OK** (OPTIONS preflight 200, POST chega, afiliado persistido com `ref_code afiliado-percus-cba4`, CORS/payload provados). Mas 3 achados **todos no Painel** (cross-repo, caixa entregue): **(A)** `POST /public/affiliate-signup` responde **>15s** → estoura o timeout de 15s do `api.ts` (`net::ERR_ABORTED`, UI "Tempo de resposta esgotado") mesmo tendo criado o afiliado — side-effects síncronos travam a resposta HTTP. **(B)** provisionamento de identidade no auth-service falha **422** (`POST /internal/identities/v2` exige `name`; Painel manda `display_name`) → afiliado criado com `identity_id` **NULL** (sem login no portal). **(C)** o **welcome WhatsApp nunca disparou** (device `Notificador` `5567920015872` não enviou nada nos logs do GOWA; handler morre/cancela antes do passo GOWA — provável cascata do bug B). Hipótese pro Painel: B causa A/C (compor o welcome depende da identidade que ficou NULL). **Fix estrutural recomendado: tornar os side-effects (identity + WA) assíncronos** (BackgroundTasks/fila) e retornar 201 com `ref_code` em <1s. **Bug 500-on-duplicado: RESOLVIDO** (Painel confirmou — 409 em prod, commit `083dd3e`). #3 happy-path segue `[0]` (bloqueado cross-repo) até o Painel corrigir + re-smoke.
>
> **2026-07-14 (sessão canon-reorg + DEPLOY `v0.3.5`):** site image **`v0.3.5`** no ar e verificado E2E em prod. Nesta ordem: **reorg 6.28.0** (bloco abaixo) → #1 → #2 → deploy → #3.
> - **#1 conteúdo definitivo dos 9 produtos `[5-T]`** — `lib/products.ts` reescrito (acentos + polish, fatos do MVP preservados, comentário "8"→"9"), domínio do Família Milionária alinhado em `.app`. Verificado no browser (taglines acentuadas + "9 produtos" no ar). Curadoria fina do operador pode refinar mais, mas o placeholder ASCII saiu.
> - **#2 Meta Pixel `641491994507686` `[5-T]`** — novo `components/MetaPixel.tsx` (loader `fbevents.js` + SPA PageView, espelha `Analytics.tsx`) + banner **adaptativo** em `CookieConsent`: sem Pixel id = texto analytics-only idêntico ao anterior; com Pixel = "análise e marketing" num aceite só (direção "ampliar o banner" aprovada). ID **baked no `Dockerfile.web` ARG** (default = prod, `--build-arg` vazio p/ staging), igual ao GA_ID. Review R11 sem crítico (`JSON.stringify(pixelId)` no `fbq('init')` aplicado de finding preferência). **Verificado E2E em prod (browser real):** após "Aceitar", `fbevents.js` 200 + `signals/config/641491994507686` 200 + `facebook.com/tr ...ev=PageView` 200; GA4 carrega junto; zero erro console.
> - **DEPLOY `v0.3.5`** (imagem `huboperacional-site:v0.3.5`) — fluxo isolado corrigido: build separado no VPS **BUILD_EXIT=0** (os cache mounts BuildKit foram honrados num build real → fecha a ressalva do reorg), depois `service update --force` rolling **convergiu 1/1 sem outage**. Smoke prod: 8 páginas 200 + conteúdo refinado no ar + OG 200 + browser confirmou Pixel/GA4. Tags git **`v0.3.4`** (retroativa em `3108a14`, imagem prod anterior) + **`v0.3.5`** (em `94cef78`). Commits: reorg `b3392b8`, feature `94cef78` (pushados).
> - **#3 smoke affiliate — PARCIAL (achado real):** `POST /public/affiliate-signup` com `whatsapp=5567933009440` deu **HTTP 500** → o número **já é afiliado** (`uniq_affiliates_phone`), então **nada foi criado e nenhum WA disparou**. Isso (a) impede o smoke do happy-path com número novo (precisa de um telefone livre) e (b) revelou **bug de robustez no Painel**: 500 genérico em telefone duplicado em vez de 409/422. **Fix entregue como caixa cross-repo — operador já enviou pro Painel (em andamento na sessão do Painel).** Não afeta o site.
> - **Nota:** plugin `percus-review` instalado é **v6.28.0** (o script de review confirmou) — tooling alinhado ao canon, não só os docs.
>
> **2026-07-14 (reorganização canon 6.26.1 → 6.28.0, caixa Delta):** projeto **alinhado** à canônica atual. O delta inteiro (v6.27.0 + v6.28.0) é housekeeping interno do canon, **exceto** a diretiva opt-in de **build Docker frio** (v6.27.0 `deploy-build-cache`). Aplicada só a parte que cabe: **cache incremental BuildKit** em `deploy/Dockerfile.web` — `# syntax=docker/dockerfile:1` + `RUN --mount=type=cache,target=/root/.npm npm ci` (deps) + `RUN --mount=type=cache,target=/app/.next/cache npm run build` (build); `npm install`→`npm ci` (lockfile em sync). **Fontes self-hosted = N/A** (projeto **não** usa `next/font/google`; fontes vêm de `<link>` runtime pro Google Fonts em `app/layout.tsx` → não há fetch de fonte no build a eliminar). **Pilot npm verde:** `npm ci` OK (186 pkgs) + `NODE_ENV=production npm run build` BUILD_EXIT=0 (31 páginas). ⚠️ **Efeito do cache confirma no PRÓXIMO deploy** — Docker ausente na máquina local, não deu pra rodar `docker build`; VPS roda Docker 28.5.2 (BuildKit default → honra `# syntax` + `--mount` automaticamente), 2º build em diante ~1-3min vs ~7-8min frio. `.percus-version` 6.26.1→6.28.0; CLAUDE.md sincronizado. **Self-host de fontes** (converter o `<link>` → `next/font/local`: ganho de perf sem render-block + LGPD sem vazar IP pro Google) fica como **melhoria separada adiada** — mexe em página, pede verificação visual. Zero mudança de página/negócio nesta reorganização. **Commitado `b3392b8` + pushado** (R11 DeepSeek, sem findings críticos). O BuildKit cache foi depois **provado num build real do VPS** no deploy v0.3.5 (BUILD_EXIT=0, mounts honrados) — ressalva fechada.
>
> **2026-07-14 (tudo em `main`, pushado):** (1) **tag git `v0.3.3`** criada + pushada (alinha git à imagem prod já no ar). (2) **Frente v0.2 Qualidade — Playwright E2E `[5-T]`:** suíte E2E (17 specs, route interception, **zero chamada real ao Painel**) + contract-guard Vitest (4 casos). Vitest 20/20 + Playwright 17/17 verdes local. Feita via subagent-driven (fresh subagent/task + review 2-estágios) + review do conselho na spec + review final APPROVED_WITH_MINOR. Merged de `feat/playwright-e2e` → `main` (`1262d3d`). **Sem deploy** (dev-tooling; `data-testid` inerte no wizard; deploy é cadência R24). Gotchas do next dev/mock em memória `e2e-playwright-gotchas`. Spec `docs/superpowers/specs/2026-07-14-playwright-e2e-design.md`, plano `docs/superpowers/plans/2026-07-14-playwright-e2e.md`.
>
> **(3) OG image por produto `[4-C]`** — `app/produtos/[slug]/opengraph-image.tsx` (next/og SSG por slug, runtime Node). Gate R10 aprovado via mockup. Build gera 9 PNGs (inspeção visual OK). Commit `9c890ba`. **(4) GA4 + banner de consentimento LGPD `[5-T]`** — `components/CookieConsent`+`Analytics`; gtag só carrega após aceite, revogável via link "Cookies" no footer; `tracking.ts` intocado. GA_ID `G-K60P2FZ61K` **baked no build via `Dockerfile.web` ARG** (NEXT_PUBLIC é inline em build, não runtime — achado de review). E2E `consent.spec.ts` (22/22 verde c/ `globalSetup` de warmup). Measurement Protocol secret **fora do repo**. Commit `f90de47`. **(5) DEPLOY `v0.3.4` feito** — OG (3 PNGs `200 image/png`) + GA4 (browser real: banner renderiza, aceitar → `gtag/js` 200 + `/g/collect page_view` 204 + SPA nav) **verificados em prod → OG e GA4 agora `[5-T]`**. Incidente de deploy (~1min, rollback OK — comando de redeploy corrigido, ver ⚠️ abaixo). Operador pode confirmar a sessão no GA4 Realtime. Meta Pixel: adiado.

> **Iterações pós-deploy (2026-07-12, tudo em prod e verificado):** (1) redirect `/new-client` → `/new-client/pt-br` (URL curta sem idioma dava 404); (2) **fix Dockerfile.web: `COPY public/`** — standalone não inclui `public/` e o MVP tinha removido o COPY, então os logos davam 404 em prod; agora os 5 assets servem 200; (3) logos reais dos 5 brands (`public/logos/*.png`, hero HOPE + Edifica/V4/Micro Investors/ADS4Pros) via `next/image` + `images.unoptimized`; (4) campo "Endereço completo" removido do wizard — endereço só nos campos separados (`address_full` segue auto-composto no `buildPayload`); (5) **data de nascimento no formato do país** (BR `DD/MM/AAAA`, US `MM/DD/YYYY`) via campo mascarado — `<input type=date>` seguia o locale do browser; converte pra ISO no submit; (6) **CTAs dos produtos** apontam pras plataformas (Tasks/Coach/Tickets `*.plexco.com.br`, Família `familiamilionaria.app`) + **novo produto GHL-Gowa Adapter** (categoria integração, agora 9 produtos). Site prod `v0.3.3`. Commits site `193559c`,`2ffc8aa`,`a2509f6`,`d337a7c` (pushados).
>
> **GOWA ATIVADO (2026-07-12, verificado E2E):** o side-effect WhatsApp do `/public/new-client` está **funcionando em prod**. GOWA é self-hosted no VPS (serviço `gowa_whatsapp`, `gowa-operator` — multi-device) em `https://gowa.huboperacional.com.br`, device **`Notificador`** (jid 5567920015872). `gowaClient` manda header `X-Device-Id`; `_waPhone` normaliza BR (prepend 55). Painel prod `ads4pros-api:gowa-fix-*`, commits `cb9acfb`,`34e74da` (pushados). **⚠️ As 3 env vars (`GOWA_SEND_URL`,`GOWA_BASIC_AUTH`,`GOWA_DEVICE_ID`) foram setadas via `docker service update --env-add`** — persistem em `service update --image`, mas **um `docker stack deploy` do Portainer/compose SEM elas no arquivo as apaga.** Adicionar ao stack canônico do `ads4pros-api` pra não perder.
**Canon Percus:** v6.28.0 (ver `.percus-version`; **alinhado** à canônica atual — reorganizado via caixa Delta 2026-07-14).
**Repo:** `github.com/huboperacional/huboperacional-site` (público, branch `main`, tags `v0.1.0`..`v0.3.5`; imagem prod `v0.3.5`).
**Último commit:** `d9799c8 feat(new-client): wizard bilingue …` (pushado).

---

## ✅ Push feito (hold 01/07 expirou)

**2026-07-12:** ambos os repos pushados. Site `main` → `d9799c8` (13 commits: canon, fix catalog, SEO v0.2 `[4-C]`, Qualidade, docs v0.3, + a feature v0.3). Painel `main` → `170e60a` (endpoint `/public/new-client` + integrações). Considerar criar tag `v0.3.0` no git do site (imagem já é v0.3.0).

## Estado atual

- **Funcionando end-to-end (verificado em prod):** 6 páginas + 2 forms + tracking 15 campos + sitemap/robots (MVP v0.1.1) **+ wizard `/new-client/[lang]` (pt-br/en) + endpoint `POST /public/new-client`** (v0.3).
- **Implementado nesta sessão (2026-07-12) — v0.3 `/new-client`, deployado e verificado E2E em prod:**
  - Wizard bilíngue (welcome→país→empresa→responsável→financeiro→obrigado): dirigido no browser nos 2 idiomas (validação por etapa, financeiro condicional, pagamento BR=cartão/boleto-pix vs US=cartão/bank-transfer, regime só BR, sem erro no console) + prod HTTP 200 + conteúdo confirmado. `/new-client/fr` → 404 (dynamicParams=false).
  - Endpoint Painel: migration `client_onboarding` aplicada em `ads4pros_affiliate`; smoke prod = 422 em campo extra (`extra='forbid'`), 201 `{ok,id}`, row persistida com `affiliate_id` resolvido do `ref_code` real `vinicius-almeida-90f9` (test row deletado).
  - 3 integrações (`gowaClient`/`googleSheets`/`ghlClient`) codadas **flag-gated pela cred** — inativas até o `.env` do Painel receber as creds. Não quebram o cadastro (best-effort try/except).
- **SEO v0.2 `[4-C]`:** o deploy `v0.3.0` shippou também o código SEO (Organization+Breadcrumb JSON-LD, Twitter cards, sitemap lastmod) — **agora está em prod mas os meta-tags específicos NÃO foram smoke-testados** nesta sessão. Próximo: `curl` + inspeção → mover pra `[5-T]`.
- **Quebrado / regressão:** nenhum (smoke: /, /produtos, /afiliados, /contato, /sobre, /sitemap.xml todos 200). ⚠️ Build local exige `NODE_ENV=production npm run build` (ver CLAUDE.md / memória).
- **⚠️ BLOQUEIO pro operador — Sheets (2 cliques no Google) + GHL:**
  - **Sheets ✅ RESOLVIDO (2026-07-13):** operador habilitou a Sheets API (projeto `538510710999`) + compartilhou a planilha V4 (`1rGtbHa-sq0I1qUzVxIF5c1Y-yR5Nq37viDgoSCNmbDg`, aba `V4 Clientes`) como Editor com `plexco-backend-invoker@plexco-media-2026.iam.gserviceaccount.com`. Teste E2E DELETE-ME (`POST /public/new-client`) appendou a linha correta na ordem da spec e foi limpo. Side-effect **ATIVO**. `GOOGLE_SA_JSON` persistido no compose.
  - **GHL ✅ RESOLVIDO (2026-07-13):** o operador tinha um Private Integration Token (`pit-…`, 40 chars) — mas colado no `.env` errado (raiz do repo do site, `D:\Claud Automations\huboperacional-site\.env`, gitignored/não-commitado ⇒ sem vazamento) e com nomes que o pydantic ignora (`GHL_PRIVATE_TOKEN`/`GHL_SUBACCOUNT_ID` em vez de `GHL_TOKEN`/`GHL_LOCATION_ID`). PIT validado na API (HTTP 200), mapeado pipeline "01 Marketing Pipeline" `blBrCsr8YPOPkDQukiQ6` / stage inicial "New Lead" `c421b90a-2bb0-427a-b353-0e640f77253f`. Injetadas `GHL_TOKEN`/`GHL_LOCATION_ID`/`GHL_PIPELINE_ID`/`GHL_STAGE_ID` via `--env-add` + persistidas no compose. Teste E2E: contato + opportunity criados no pipeline/stage certos (status open), limpos. NÃO usar os adapters OAuth (`ghlgowa`/`ghlevo`) como fonte de token — expiram/rotacionam.
  - **Os 3 side-effects (GOWA + Sheets + GHL) estão ATIVOS e verificados E2E.** v0.3 /new-client 100% funcional.
- **✅ Env vars persistidas no stack (2026-07-13):** as 4 (`GOWA_*` + `GOOGLE_SA_JSON`) agora estão no compose autoritativo `/opt/ads4pros-api/docker-compose.api.yml` (bloco `environment:`, single-quoted, JSON compactado). Validado `docker stack config` + round-trip. Backup `.bak.20260713-144216-preSideEffects`. Stack é **CLI-managed (não Portainer)** — deploy via `docker stack deploy -c /opt/ads4pros-api/docker-compose.api.yml ads4pros-api`. Confirmado `GOOGLE_SA_JSON` parseia dentro do container (SA válido).
- **Próximo passo imediato (retomada):** Site `v0.3.5` em prod, canon 6.28.0 (alinhado). #1 conteúdo + #2 Meta Pixel `[5-T]` verificados E2E. Backlog: **(a) #3 happy-path do affiliate-signup** — tentado 2026-07-14 com telefone livre `5567920024429`: afiliado criado, mas **3 bugs no Painel** (endpoint >15s → timeout do cliente; identity provisioning 422 → afiliado sem login; welcome WA não disparou). Caixa cross-repo entregue; **aguarda fix do Painel** (side-effects assíncronos + field `name`) pra re-smoke. **(b) 500-on-duplicado: RESOLVIDO** (Painel confirmou 409 em prod, commit `083dd3e`). **(c) Self-host de fontes** — `<link>` Google Fonts → `next/font/local` (perf sem render-block + LGPD sem vazar IP); mexe em página, pede verificação visual. **(d) Curadoria fina** do conteúdo dos 9 produtos (opcional; placeholder ASCII já saiu). Meta Pixel: operador pode conferir no Meta Events Manager (opcional, já provado E2E).

## Status de Features

> Fonte da verdade: `docs/PLANO.md`. Tags frontend: `[0]` planejado · `[4-C]` renderiza/verificado em build · `[5-T]` ✅ verificado E2E.

| Frente | Feature | Status | Próxima etapa |
|--------|---------|--------|---------------|
| MVP v0.1 | 6 páginas + 2 forms + tracking + sitemap | `[5-T]` ✓ | — (em produção) |
| v0.2 SEO | Organization+Breadcrumb JSON-LD, Twitter cards, sitemap lastmod | `[5-T]` ✓ | **Verificado em prod (2026-07-13)** — smoke `curl` OK |
| v0.2 SEO | OG por produto (next/og per-page) | `[5-T]` ✓ | Em prod (deploy v0.3.4) |
| v0.2 SEO | GA4 + Meta Pixel (consent-gated) | `[5-T]` ✓ | Em prod (v0.3.5) — ambos verificados E2E em prod |
| v0.2 Qualidade | Vitest unit (structured-data, tracking, api) | `[5-T]` | — (16 testes verdes) |
| v0.2 Qualidade | Playwright E2E | `[5-T]` ✓ | **Concluído (2026-07-14)** — 17 specs route interception + contract-guard Vitest; verde local, zero chamada real |
| v0.2 Conteúdo | Conteúdo definitivo dos 9 produtos | `[5-T]` ✓ | Em prod (v0.3.5); curadoria fina do operador é opcional |
| v0.2 Qualidade | Smoke E2E real affiliate happy-path | `[0]` | **Bloqueado cross-repo** — happy-path 2026-07-14 achou 3 bugs no Painel (endpoint >15s→timeout; identity 422; welcome WA não disparou). Caixa entregue; re-smoke após fix. 500→409 resolvido. |
| **v0.3 /new-client** | Wizard bilíngue + endpoint Painel + atribuição afiliado | `[5-T]` ✓ | Em prod (v0.3.0). Falta: logos reais (operador) |
| **v0.3 /new-client** | Side-effect GOWA (WhatsApp) | `[5-T]` ✓ | Em prod (device Notificador). Verificado E2E |
| **v0.3 /new-client** | Side-effect Sheets ("V4 Clientes") | `[5-T]` ✓ | **ATIVO** (2026-07-13) — SA compartilhado + Sheets API on; teste E2E OK |
| **v0.3 /new-client** | Side-effect GHL ("01 Marketing Pipeline") | `[5-T]` ✓ | **ATIVO** (2026-07-13) — PIT injetado, pipeline/stage mapeados, teste E2E criou contato+opportunity |

## O que está no ar

| Item | Estado |
|---|---|
| 5 páginas (home, /produtos, /produtos/[slug], /afiliados, /contato, /sobre) | ✅ HTTPS 200 |
| Sitemap (13 URLs) + robots | ✅ `/sitemap.xml` + `/robots.txt` |
| 8 produtos catalogados | ✅ em `services/web/lib/products.ts` |
| Tracking 15 campos canon R2 (localStorage, TTL 90d) | ✅ `services/web/lib/tracking.ts` |
| Favicon SVG + OG image dinâmica (next/og) | ✅ `app/icon.svg` + `app/opengraph-image.tsx` |
| Deploy Docker Swarm + Traefik | ✅ stack `huboperacional-site`, service 1/1 |

## Arquitetura

- **Frontend:** Next.js 15.5.4 (patched CVE-2025-66478) + TypeScript strict + Tailwind 3. Output `standalone` → Docker. Código em `D:\Claud Automations\huboperacional-site\services\web\`.
- **Backend:** SEM backend próprio. Os 2 forms POSTam direto pro Painel Ads4Pros:
  - `POST https://api.ads4pros.com/public/leads` — form /contato → tabela `site_leads` (rate limit 5/h por IPv6 /64, Pydantic `extra='forbid'`).
  - `POST https://api.ads4pros.com/public/affiliate-signup` — form /afiliados → reusa `createAffiliate` + welcome WA (rate limit 3/h).
  - Implementação: `D:\Claud Automations\Painel Gestao e Afiliados\execution\api\siteRoutes.py` (router prefix `/public`). Rate limit em `execution\core\rateLimit.py`. CORS allowlist `huboperacional.com.br` em `server.py`.
- **Brand:** paleta Ads4Pros (`#0a6ad8` + Space Grotesk + JetBrains Mono via CSS vars + Tailwind `theme.extend`).

## Decisões / desvios da spec

- **2026-06-28 — Manter `huboperacional-site` e `Painel Gestao e Afiliados` como projetos SEPARADOS** (não fundir, não monorepo). Avaliado e decidido pelo operador. Razão: stacks diferentes (Next/TS vs FastAPI/Python), superfícies de segurança diferentes (site público cacheável vs Painel com PII/auth/financeiro — fundir aumentaria o blast radius e iria contra as mitigações do pré-mortem), cadências de release diferentes, e custo alto / benefício baixo de mexer em 2 repos + 2 stacks Swarm. O acoplamento correto é via o **contrato de API público** (`/public/leads`, `/public/affiliate-signup`) — site fino que fala com um subconjunto estreito da API. Não é duplicação: o site é o topo de funil (formulário), o Painel é o sistema de registro (dono dos dados).
- Produtos ficaram em `lib/products.ts` (const tipada), **não** em `.mdx` — fallback registrado no pré-mortem aplicado. Conteúdo é placeholder coerente; curadoria definitiva é do operador.
- Endpoints públicos ficaram em `/public/leads` e `/public/affiliate-signup` (não `/admin/leads/inbound` e `/affiliates/public-signup` da spec). `api.ts` aponta pros caminhos reais.
- Dockerfile usa `node:20-slim` (debian), não alpine — fallback do pré-mortem (musl). `COPY public` removido (sem assets estáticos no MVP).

## Comandos úteis

**Sanity build local:**
```bash
cd "D:/Claud Automations/huboperacional-site/services/web" && npm run build
```

**Re-deploy do site (após mexer no código):**
```bash
cd "D:/Claud Automations/huboperacional-site"
cd services/web && npm run build   # sanity
cd ../..
tar --exclude='services/web/node_modules' --exclude='services/web/.next' --exclude='.git' --exclude='.deepseek' --exclude='services/web/test-results' --exclude='services/web/playwright-report' -czf /tmp/hub-site.tar.gz .
scp /tmp/hub-site.tar.gz root@161.97.129.138:/opt/huboperacional-site/source.tar.gz
# 1) extrair + build ISOLADO. Checar o exit de verdade. GA_ID já é baked pelo ARG default.
ssh root@161.97.129.138 "cd /opt/huboperacional-site && tar -xzf source.tar.gz && rm -f source.tar.gz && docker build -f deploy/Dockerfile.web -t huboperacional-site:vX.Y.Z . > /tmp/build.log 2>&1; echo BUILD_EXIT=\$?; tail -15 /tmp/build.log"
# 2) SÓ com BUILD_EXIT=0: service update (rolling). Se falhar → rollback pra imagem anterior.
ssh root@161.97.129.138 "docker service update --image huboperacional-site:vX.Y.Z --force huboperacional-site_web"
# rollback: ssh root@161.97.129.138 "docker service update --image huboperacional-site:<anterior> --force huboperacional-site_web"
```
> ⚠️ **NUNCA** encadear `docker build ... | tail && docker service update` — o pipe pro `tail` mascara o exit code do build; um build falho (ex.: blip de rede npm) segue pro update com imagem inexistente → Swarm para a task antiga → **outage 404**. Build e update em passos SEPARADOS, checando `BUILD_EXIT`. (Incidente 2026-07-14, resolvido por rollback; ver memória `deploy-vps-gotchas`.)

**Re-deploy do backend Painel (após mexer no Python):**
```bash
scp "D:/Claud Automations/Painel Gestao e Afiliados/execution/api/siteRoutes.py" root@161.97.129.138:/opt/ads4pros-api/execution/api/
ssh root@161.97.129.138 "cd /opt/ads4pros-api && docker build -f Dockerfile.api -t ads4pros-api:fase6-NNNNN . && docker service update --image ads4pros-api:fase6-NNNNN --force ads4pros-api_api"
```

**Smoke prod (health check):**
```bash
for url in / /produtos /produtos/familia-milionaria /afiliados /contato /sobre /sitemap.xml /robots.txt /icon.svg /opengraph-image; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://huboperacional.com.br$url")
  echo "$code $url"
done
```

## Variáveis de ambiente

- `NEXT_PUBLIC_PAINEL_URL` — base da API Painel (default no código: `https://api.ads4pros.com`). Definida no `deploy/docker-compose.yml`.

## Feature Catalog

Adotado 2026-06-30 (ADR-0001 em `docs/adrs/`). Features rastreadas no Painel de Gestão via `catalog-info.yaml`. Atualizar manualmente ao aplicar feature global nova; skill `catalog-publish` sincroniza no on-stop.

## Pendente (Sprint 2 / v0.2)

> Fonte da verdade do backlog agora é `docs/PLANO.md` (frentes v0.2). Resumo:
- SEO & Tracking: Schema.org Org+BreadcrumbList, OG por produto, sitemap lastmod, Twitter cards, Pixel Meta + Google Ads.
- Qualidade: Vitest + Playwright; smoke E2E real do affiliate signup (dispara WA ao `5567933009440` — gated, R5).
- Conteúdo: conteúdo definitivo dos 8 produtos (`services/web/lib/products.ts`).

## Referências

- Spec: `D:\Claud Automations\huboperacional-site\docs\superpowers\specs\2026-05-16-huboperacional-site-design.md`
- HANDOFF do Eixo D (plano mestre): `D:\Claud Automations\Melhoria do prompt inicial\HANDOFF.md` (seção "Eixo D … 100% CONCLUIDO").
- Stack canon: `D:\Claud Automations\_Novo_Projeto\02_INFRA_E_STACK_PERCUS.md`
- Tracking 15 campos: `D:\Claud Automations\_Novo_Projeto\03_TRACKING_ATTRIBUITION.md`
- VPS: `161.97.129.138` (Docker Swarm + Traefik). Painel API: `https://api.ads4pros.com`.
