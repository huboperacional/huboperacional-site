# ADR-0001: Adopt Percus feature tracking

- **Status:** Accepted
- **Date:** 2026-06-30
- **Applied-to:** huboperacional-site
- **Feature-slug:** catalog-info-adoption
- **Authors:** team-percus

## Context

O `huboperacional-site` (MVP v0.1.1 em produção) foi trazido ao canon Percus v6.26.1 via o umbrella `REORGANIZAR_PROJETO.md`. O canon Fase 6 introduziu feature-tracking cross-projeto: cada projeto declara suas features globais em `catalog-info.yaml`, e o Painel de Gestão agrega/rastreia a evolução cross-projeto. Sem esse arquivo, o projeto fica invisível no dashboard de features e no drift-detect.

## Decision

Adotar o feature-tracking cross-projeto: criar `catalog-info.yaml` na raiz declarando as 3 features globais já implementadas (`tracking-15-campos`, `lead-form-v2`, `affiliate-public-signup`) e publicar no Painel via a skill `catalog-publish`. O projeto é `type: site`, `lifecycle: production`, `system: conteudo`, dependente de `component:painel-gestao` (consome a API pública).

## Consequences

- **O que melhora:** o site passa a aparecer no dashboard de features (`gestao.ads4pros.com/gestao/features.html`); habilita drift-detect; documenta o acoplamento com o Painel de forma rastreável.
- **O que piora ou exige cuidado:** `catalog-info.yaml` precisa ser atualizado manualmente ao aplicar feature global nova (a skill `catalog-publish` sincroniza no on-stop quando o arquivo muda).
- **Reversível?** Sim. Remover `catalog-info.yaml` + `docs/adrs/` e o projeto some do crawler na próxima passagem.

## Alternatives considered

- Não adotar catalog — descartada porque deixaria o projeto fora da visibilidade cross-projeto que a Fase 6 padroniza.
- Declarar feature genérica `auth`/`lead` sem slug canônico — descartada: slugs precisam ser canônicos kebab-case sem prefixo (`05_FEATURE_TRACKING.md`).

## References

- `${env:PERCUS_CANON_DIR}\05_FEATURE_TRACKING.md`
- `${env:PERCUS_CANON_DIR}\comandos\SETUP_CATALOG.md`
- `catalog-info.yaml` (raiz deste repo)
