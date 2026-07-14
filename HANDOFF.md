# HANDOFF — huboperacional-site

**Status:** ✅ MVP v0.1.1 + **v0.3 `/new-client`** em produção em `https://huboperacional.com.br`. Site image `v0.3.2`, Painel `ads4pros-api:newclient-202607121910`.
**Última atualização:** 2026-07-14

> **2026-07-14 (tudo em `main`, pushado):** (1) **tag git `v0.3.3`** criada + pushada (alinha git à imagem prod já no ar). (2) **Frente v0.2 Qualidade — Playwright E2E `[5-T]`:** suíte E2E (17 specs, route interception, **zero chamada real ao Painel**) + contract-guard Vitest (4 casos). Vitest 20/20 + Playwright 17/17 verdes local. Feita via subagent-driven (fresh subagent/task + review 2-estágios) + review do conselho na spec + review final APPROVED_WITH_MINOR. Merged de `feat/playwright-e2e` → `main` (`1262d3d`). **Sem deploy** (dev-tooling; `data-testid` inerte no wizard; deploy é cadência R24). Gotchas do next dev/mock em memória `e2e-playwright-gotchas`. Spec `docs/superpowers/specs/2026-07-14-playwright-e2e-design.md`, plano `docs/superpowers/plans/2026-07-14-playwright-e2e.md`.

> **Iterações pós-deploy (2026-07-12, tudo em prod e verificado):** (1) redirect `/new-client` → `/new-client/pt-br` (URL curta sem idioma dava 404); (2) **fix Dockerfile.web: `COPY public/`** — standalone não inclui `public/` e o MVP tinha removido o COPY, então os logos davam 404 em prod; agora os 5 assets servem 200; (3) logos reais dos 5 brands (`public/logos/*.png`, hero HOPE + Edifica/V4/Micro Investors/ADS4Pros) via `next/image` + `images.unoptimized`; (4) campo "Endereço completo" removido do wizard — endereço só nos campos separados (`address_full` segue auto-composto no `buildPayload`); (5) **data de nascimento no formato do país** (BR `DD/MM/AAAA`, US `MM/DD/YYYY`) via campo mascarado — `<input type=date>` seguia o locale do browser; converte pra ISO no submit; (6) **CTAs dos produtos** apontam pras plataformas (Tasks/Coach/Tickets `*.plexco.com.br`, Família `familiamilionaria.app`) + **novo produto GHL-Gowa Adapter** (categoria integração, agora 9 produtos). Site prod `v0.3.3`. Commits site `193559c`,`2ffc8aa`,`a2509f6`,`d337a7c` (pushados).
>
> **GOWA ATIVADO (2026-07-12, verificado E2E):** o side-effect WhatsApp do `/public/new-client` está **funcionando em prod**. GOWA é self-hosted no VPS (serviço `gowa_whatsapp`, `gowa-operator` — multi-device) em `https://gowa.huboperacional.com.br`, device **`Notificador`** (jid 5567920015872). `gowaClient` manda header `X-Device-Id`; `_waPhone` normaliza BR (prepend 55). Painel prod `ads4pros-api:gowa-fix-*`, commits `cb9acfb`,`34e74da` (pushados). **⚠️ As 3 env vars (`GOWA_SEND_URL`,`GOWA_BASIC_AUTH`,`GOWA_DEVICE_ID`) foram setadas via `docker service update --env-add`** — persistem em `service update --image`, mas **um `docker stack deploy` do Portainer/compose SEM elas no arquivo as apaga.** Adicionar ao stack canônico do `ads4pros-api` pra não perder.
**Canon Percus:** v6.26.1 (ver `.percus-version`; canônica atual 6.28.0 — divergente, considerar REORGANIZAR antes de trabalho grande).
**Repo:** `github.com/huboperacional/huboperacional-site` (público, branch `main`, tags `v0.1.0` + `v0.1.1`; imagem prod `v0.3.0`).
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
- **Próximo passo imediato (retomada):** v0.3 /new-client **100% completa** (`[5-T]`), SEO v0.2 verificado em prod (`[5-T]`), tag `v0.3.3` criada, **Playwright E2E `[5-T]`** (2026-07-14). Backlog v0.2 restante — **todos gated por input do operador:** (1) **OG image por produto** (next/og per-page) — gate de design R10 (decidir direção/mockup antes de codar); (2) **Pixels Meta + Google Ads** — precisa dos IDs de pixel + decisão de consentimento LGPD (R18); (3) **conteúdo definitivo dos 8/9 produtos** — curadoria do operador.

## Status de Features

> Fonte da verdade: `docs/PLANO.md`. Tags frontend: `[0]` planejado · `[4-C]` renderiza/verificado em build · `[5-T]` ✅ verificado E2E.

| Frente | Feature | Status | Próxima etapa |
|--------|---------|--------|---------------|
| MVP v0.1 | 6 páginas + 2 forms + tracking + sitemap | `[5-T]` ✓ | — (em produção) |
| v0.2 SEO | Organization+Breadcrumb JSON-LD, Twitter cards, sitemap lastmod | `[5-T]` ✓ | **Verificado em prod (2026-07-13)** — smoke `curl` OK |
| v0.2 SEO | OG por produto (next/og per-page) | `[0]` | Gate de design R10 (mockup) |
| v0.2 SEO | Pixels Meta + Google Ads | `[0]` | Operador: IDs + decisão LGPD |
| v0.2 Qualidade | Vitest unit (structured-data, tracking, api) | `[5-T]` | — (16 testes verdes) |
| v0.2 Qualidade | Playwright E2E | `[5-T]` ✓ | **Concluído (2026-07-14)** — 17 specs route interception + contract-guard Vitest; verde local, zero chamada real |
| v0.2 Conteúdo | Conteúdo definitivo dos 8 produtos | `[0]` 🎨? | Curadoria do operador |
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
tar --exclude='services/web/node_modules' --exclude='services/web/.next' --exclude='.git' --exclude='.deepseek' -czf /tmp/hub-site.tar.gz .
scp /tmp/hub-site.tar.gz root@161.97.129.138:/opt/huboperacional-site/source.tar.gz
ssh root@161.97.129.138 "cd /opt/huboperacional-site && tar -xzf source.tar.gz && rm source.tar.gz && docker build -f deploy/Dockerfile.web -t huboperacional-site:vX.Y.Z . && docker service update --image huboperacional-site:vX.Y.Z --force huboperacional-site_web"
```

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
