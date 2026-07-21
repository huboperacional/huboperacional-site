# HANDOFF — huboperacional-site

## Estado agora

Site **v0.3.5** em produção (`https://huboperacional.com.br`), canon Percus **6.30.6** (alinhado). Tudo do MVP v0.1 + v0.2 (SEO, GA4 + Meta Pixel consent-gated, Vitest+Playwright, **#3 affiliate happy-path fechado 2026-07-21**) + v0.3 `/new-client` (wizard bilíngue + endpoint no Painel + 3 side-effects GOWA/Sheets/GHL) está `[5-T]` verificado em prod. Repo `github.com/huboperacional/huboperacional-site` (`main`, tags `v0.1.0`..`v0.3.5`, imagem prod `v0.3.5`). Backend é o Painel (`api.ads4pros.com`) — este site não tem backend próprio. **Nenhuma feature em obra e nenhum código pendente.**

## Próximo passo

Não há trabalho obrigatório no site. Candidatos, em ordem: (1) **self-host de fontes** (`<link>` Google Fonts → `next/font/local`; perf + LGPD), que passa pelo gate de design R10; (2) re-verificar o welcome em **cold reach-out real depois de ~27/07** (só confirmação de infra, o código já está `[5-T]`).

## Bloqueios

- **WhatsApp (infra, não código)**: a conta `5567920015872` segue sob `reachout_timelock` até **~2026-07-27 20:15 UTC** — afiliado real que se cadastrar até lá recebe **463** e o welcome não sai (Painel aborta na 1ª falha e alerta o admin com `onboarding incompleto: N/4`). O smoke de 21/07 passou porque a janela foi aberta com inbound-first entre dois números nossos. Memória `whatsapp-companion-enforcement`.
- Nenhum bloqueio de código no site.

## Em obra

| Feature | Estado | O que falta |
|---|---|---|
| Self-host de fontes (opcional) | `[0]` | `<link>` Google Fonts → `next/font/local` (perf sem render-block + LGPD); mexe em página → gate de design R10 |

## Onde está o resto

- Plano e estados de feature: `docs/PLANO.md`
- Vocabulário do domínio: `CONTEXT.md`
- Decisões: `docs/adrs/` (0001 feature-catalog · 0002 separação site/Painel · 0003 consolidação gestão)
- Histórico: `docs/historico/`
- Referência operacional (deploy, comandos, arquitetura, env vars): `docs/referencia-operacional.md`
- Migração gestão→huboperacional (executada pelo Painel): spec no repo do Painel (`docs/superpowers/specs/2026-07-14-migracao-gestao-huboperacional-design.md`)
