# HANDOFF — huboperacional-site

**Status:** ✅ MVP v0.1.1 em produção em `https://huboperacional.com.br` (Eixo D / Fase 6 do plano mestre Percus — 100% concluído).
**Última atualização:** 2026-06-30
**Canon Percus:** v6.26.1 (ver `.percus-version`). Tracking files + diretivas adotadas em 2026-06-30.
**Repo:** `github.com/huboperacional/huboperacional-site` (público, branch `main`, tags `v0.1.0` + `v0.1.1`).
**Último commit:** `c63ca84 docs(tracking): frente Qualidade [5-T] no PLANO` (local; push só ≥01/07).

---

## ⚠️ Push pendente

**9+ commits locais na `main` ainda NÃO pushados** (operador pediu: sem push antes de 01/07). Inclui: adoção do canon, fix do catalog (description), frente SEO (3 commits), frente Qualidade. A partir de 01/07: `git push` + considerar tag nova. **Também há 1 commit local no repo do Painel** (`13cc94f` fix do catalog ingest — já deployado em prod, mas não pushado).

## Estado atual

- **Funcionando end-to-end (verificado em prod):** 6 páginas + 2 forms + tracking 15 campos + sitemap/robots. MVP v0.1.1 no ar.
- **Implementado nesta sessão (verificado LOCAL, falta prod):** SEO — Organization + BreadcrumbList JSON-LD, Twitter cards, sitemap lastmod curado (`[4-C]`). Qualidade — Vitest + jsdom + 16 unit tests verdes (`[5-T]`).
- **Quebrado / regressão:** nenhum. ⚠️ Build local exige `NODE_ENV=production npm run build` (settings.json seta development e quebra prerender /404 — ver CLAUDE.md / memória).
- **Último passo concluído:** frente Qualidade (Vitest) — 16 testes verdes, commits `ebdb5e8`/`3f57122`/`c63ca84`.
- **Próximo passo imediato:** a partir de 01/07 fazer push; depois deploy (R24) e re-verificar SEO em prod (curl + Schema Validator) → subir SEO de `[4-C]` pra `[5-T]`. Frentes v0.2 restantes (OG por produto, Pixels, Conteúdo) **dependem de input do operador** (design/IDs/textos).

## Status de Features

> Fonte da verdade: `docs/PLANO.md`. Tags frontend: `[0]` planejado · `[4-C]` renderiza/verificado em build · `[5-T]` ✅ verificado E2E.

| Frente | Feature | Status | Próxima etapa |
|--------|---------|--------|---------------|
| MVP v0.1 | 6 páginas + 2 forms + tracking + sitemap | `[5-T]` ✓ | — (em produção) |
| v0.2 SEO | Organization+Breadcrumb JSON-LD, Twitter cards, sitemap lastmod | `[4-C]` | Deploy + verificar prod → `[5-T]` |
| v0.2 SEO | OG por produto (next/og per-page) | `[0]` | Gate de design R10 (mockup) |
| v0.2 SEO | Pixels Meta + Google Ads | `[0]` | Operador: IDs + decisão LGPD |
| v0.2 Qualidade | Vitest unit (structured-data, tracking, api) | `[5-T]` | — (16 testes verdes) |
| v0.2 Qualidade | Playwright E2E | `[0]` | Estratégia de mock (submit real = risco) |
| v0.2 Conteúdo | Conteúdo definitivo dos 8 produtos | `[0]` 🎨? | Curadoria do operador |

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
