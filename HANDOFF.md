# HANDOFF — huboperacional-site

## Estado agora

Site **v0.3.5** em produção (`https://huboperacional.com.br`), canon Percus **6.30.4** (V2 adotado 2026-07-21, gate verificado vivo+curado). Tudo do MVP v0.1 + v0.2 (SEO, GA4 + Meta Pixel consent-gated, Vitest+Playwright) + v0.3 `/new-client` (wizard bilíngue + endpoint no Painel + 3 side-effects GOWA/Sheets/GHL) está `[5-T]` verificado em prod, sem regressão (smoke 8 páginas 200). Repo `github.com/huboperacional/huboperacional-site` (`main`, tags `v0.1.0`..`v0.3.5`, imagem prod `v0.3.5`). Backend é o Painel (`api.ads4pros.com`) — este site não tem backend próprio.

## Próximo passo

**Re-smoke do #3 (affiliate happy-path E2E)** — mas está travado externamente: só rodar quando o Painel trocar o `asyncio.sleep(8)` fixo por 6–12s random no welcome (`affiliateRoutes.py:142/153/160`), senão re-trigger do enforcement WhatsApp. Não há código pendente no site. Alternativa autônoma se quiser avançar em algo do site: self-host de fontes (`<link>` → `next/font/local`), que passa pelo gate visual.

## Bloqueios

- **#3 affiliate happy-path** `[0]`: bloqueio **externo** (Painel + WhatsApp). Devices `Notificador`/`Auth` sob `reachout_timelock` até ~2026-07-27; welcome com cadência fixa (gap no Painel). Detalhe em `docs/historico/2026-07-huboperacional-site.md` (bloco 2026-07-20).
- Nenhum bloqueio de código no site.

## Em obra

| Feature | Estado | O que falta |
|---|---|---|
| Smoke E2E affiliate happy-path | `[0]` | Painel trocar cadência 6–12s → eu re-smoko (200 + `identity_id` + as 4 msgs chegando) |
| Self-host de fontes (opcional) | `[0]` | `<link>` Google Fonts → `next/font/local` (perf sem render-block + LGPD); mexe em página → gate de design R10 |

## Onde está o resto

- Plano e estados de feature: `docs/PLANO.md`
- Vocabulário do domínio: `CONTEXT.md`
- Decisões: `docs/adrs/` (0001 feature-catalog · 0002 separação site/Painel · 0003 consolidação gestão)
- Histórico: `docs/historico/`
- Referência operacional (deploy, comandos, arquitetura, env vars): `docs/referencia-operacional.md`
- Migração gestão→huboperacional (executada pelo Painel): spec no repo do Painel (`docs/superpowers/specs/2026-07-14-migracao-gestao-huboperacional-design.md`)
