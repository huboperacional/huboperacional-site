# Referência operacional — huboperacional-site

> Consulta operacional movida do `HANDOFF.md` na adoção do canon V2 (2026-07-21). Deploy, comandos, arquitetura, env — o que você consulta sob demanda, não o estado do dia.

## Arquitetura

- **Frontend:** Next.js 15.5.4 (patched CVE-2025-66478) + TypeScript strict + Tailwind 3. Output `standalone` → Docker. Código em `D:\Claud Automations\huboperacional-site\services\web\`.
- **Backend:** SEM backend próprio. Os forms POSTam direto pro Painel Ads4Pros:
  - `POST https://api.ads4pros.com/public/leads` — form /contato → tabela `site_leads` (rate limit 5/h por IPv6 /64, Pydantic `extra='forbid'`).
  - `POST https://api.ads4pros.com/public/affiliate-signup` — form /afiliados → reusa `createAffiliate` + welcome WA (rate limit 3/h).
  - `POST https://api.ads4pros.com/public/new-client` — wizard /new-client.
  - Implementação no Painel: `D:\Claud Automations\Painel Gestao e Afiliados\execution\api\siteRoutes.py` (prefix `/public`). Rate limit em `execution\core\rateLimit.py`. CORS allowlist `huboperacional.com.br` em `server.py`.
- **Brand:** paleta Ads4Pros (`#0a6ad8` + Space Grotesk + JetBrains Mono via CSS vars + Tailwind `theme.extend`).
- ⚠️ **Build local exige `NODE_ENV=production npm run build`** — o `.claude/settings.json` seta `development` e vaza pro `next build`, quebrando o prerender de `/404`. Docker não é afetado. Ver memória `build-nodeenv-production`.

## O que está no ar

| Item | Estado |
|---|---|
| Páginas (home, /produtos, /produtos/[slug], /afiliados, /contato, /sobre) | ✅ HTTPS 200 |
| Sitemap (13 URLs) + robots | ✅ `/sitemap.xml` + `/robots.txt` |
| 9 produtos catalogados | ✅ `services/web/lib/products.ts` |
| Tracking 15 campos canon R2 (localStorage, TTL 90d) | ✅ `services/web/lib/tracking.ts` |
| Favicon SVG + OG image dinâmica (next/og) | ✅ `app/icon.svg` + `app/opengraph-image.tsx` |
| GA4 + Meta Pixel (consent-gated) | ✅ `components/CookieConsent`+`Analytics`+`MetaPixel` |
| Deploy Docker Swarm + Traefik | ✅ stack `huboperacional-site`, service 1/1 |

## Variáveis de ambiente

- `NEXT_PUBLIC_PAINEL_URL` — base da API Painel (default no código: `https://api.ads4pros.com`). Definida no `deploy/docker-compose.yml`.
- ⚠️ **`NEXT_PUBLIC_*` é inline no BUILD**, não runtime. GA_ID (`G-K60P2FZ61K`) e PIXEL_ID (`641491994507686`) são **baked via `deploy/Dockerfile.web` ARG** (default = prod; `--build-arg` vazio p/ staging). Ver memória `deploy-vps-gotchas`.

## Deploy do site (após mexer no código)

```bash
cd "D:/Claud Automations/huboperacional-site"
cd services/web && NODE_ENV=production npm run build   # sanity
cd ../..
tar --exclude='services/web/node_modules' --exclude='services/web/.next' --exclude='.git' --exclude='.deepseek' --exclude='services/web/test-results' --exclude='services/web/playwright-report' -czf /tmp/hub-site.tar.gz .
scp /tmp/hub-site.tar.gz root@161.97.129.138:/opt/huboperacional-site/source.tar.gz
# 1) extrair + build ISOLADO. Checar o exit de verdade. GA_ID/PIXEL_ID baked pelo ARG default.
ssh root@161.97.129.138 "cd /opt/huboperacional-site && tar -xzf source.tar.gz && rm -f source.tar.gz && docker build -f deploy/Dockerfile.web -t huboperacional-site:vX.Y.Z . > /tmp/build.log 2>&1; echo BUILD_EXIT=\$?; tail -15 /tmp/build.log"
# 2) SÓ com BUILD_EXIT=0: service update (rolling). Se falhar → rollback pra imagem anterior.
ssh root@161.97.129.138 "docker service update --image huboperacional-site:vX.Y.Z --force huboperacional-site_web"
# rollback: ssh root@161.97.129.138 "docker service update --image huboperacional-site:<anterior> --force huboperacional-site_web"
```

> ⚠️ **NUNCA** encadear `docker build ... | tail && docker service update` — o pipe pro `tail` mascara o exit code do build; um build falho segue pro update com imagem inexistente → Swarm para a task antiga → **outage 404**. Build e update em passos SEPARADOS, checando `BUILD_EXIT`. (Incidente 2026-07-14; memória `deploy-vps-gotchas`.)

## Deploy do backend Painel (após mexer no Python — cross-repo)

```bash
scp "D:/Claud Automations/Painel Gestao e Afiliados/execution/api/siteRoutes.py" root@161.97.129.138:/opt/ads4pros-api/execution/api/
ssh root@161.97.129.138 "cd /opt/ads4pros-api && docker build -f Dockerfile.api -t ads4pros-api:fase6-NNNNN . && docker service update --image ads4pros-api:fase6-NNNNN --force ads4pros-api_api"
```

## Smoke prod (health check)

```bash
for url in / /produtos /produtos/familia-milionaria /afiliados /contato /sobre /sitemap.xml /robots.txt /icon.svg /opengraph-image; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://huboperacional.com.br$url")
  echo "$code $url"
done
```

## Feature Catalog

Adotado 2026-06-30 (ADR-0001). Features rastreadas no Painel de Gestão via `catalog-info.yaml`. Atualizar manualmente ao aplicar feature global nova; skill `catalog-publish` sincroniza no on-stop. ⚠️ `description` ≤100 chars senão o ingest do Painel dá 500 (memória `catalog-ingest-description-limit`).

## Referências

- Spec MVP: `D:\Claud Automations\huboperacional-site\docs\superpowers\specs\2026-05-16-huboperacional-site-design.md`
- Stack canon: `D:\Claud Automations\_Novo_Projeto\02_INFRA_E_STACK_PERCUS.md`
- Tracking 15 campos: `D:\Claud Automations\_Novo_Projeto\03_TRACKING_ATTRIBUITION.md`
- Migração gestão→huboperacional (Painel): `D:\Claud Automations\Painel Gestao e Afiliados\docs\superpowers\specs\2026-07-14-migracao-gestao-huboperacional-design.md`
- VPS: `161.97.129.138` (Docker Swarm + Traefik). Painel API: `https://api.ads4pros.com`.
