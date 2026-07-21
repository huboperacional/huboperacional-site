# ADR-0002: Manter huboperacional-site e Painel como projetos separados (não monorepo)

- **Status:** Accepted — reafirmada 2026-07-20 (ver ADR-0003)
- **Date:** 2026-06-28
- **Applied-to:** huboperacional-site, gestao-projetos-afiliados
- **Feature-slug:** arquitetura-separacao-site-painel
- **Authors:** operador + Claude

## Context

O `huboperacional-site` (vitrine, topo de funil) e o Painel Gestão e Afiliados (sistema de registro dos leads/afiliados/comissões) precisam se integrar. Havia a opção de fundi-los num monorepo/stack único. Decidir agora evita retrabalho de acoplamento errado.

## Decision

Mantê-los **separados** — dois repos, dois stacks Swarm. O acoplamento é via **contrato de API pública** (`/public/leads`, `/public/affiliate-signup`, `/public/new-client` em `api.ads4pros.com`): o site é um cliente fino que fala com um subconjunto estreito da API. Nenhum código compartilhado.

## Consequences

- **O que melhora:** superfícies de segurança isoladas (site público cacheável vs Painel com PII/auth/financeiro → blast radius menor); cadências de release independentes; cada stack evolui na sua linguagem (Next/TS vs FastAPI/Python).
- **O que piora ou exige cuidado:** o contrato de API vira fronteira que precisa ser versionada/respeitada; mudanças cross-repo exigem coordenação (caixas).
- **Reversível?** Sim, mas caro — fundir depois exigiria unir 2 stacks + 2 pipelines. Por isso a decisão é registrada.

## Alternatives considered

- Monorepo (site + Painel juntos) — descartado: aumenta o blast radius de segurança e vai contra as mitigações do pré-mortem.
- Fundir os stacks Swarm — descartado: custo alto, benefício baixo, stacks de linguagens diferentes.

## References

- `docs/historico/2026-07-huboperacional-site.md` (seção Decisões).
- ADR-0003 (consolidação da gestão sob huboperacional — reafirma esta ao NÃO fazer monorepo).
