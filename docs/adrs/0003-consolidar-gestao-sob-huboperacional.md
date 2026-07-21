# ADR-0003: Consolidar a gestão sob o guarda-chuva huboperacional (domínio + marca, sem monorepo)

- **Status:** Accepted
- **Date:** 2026-07-20
- **Applied-to:** gestao-projetos-afiliados, huboperacional-site
- **Feature-slug:** consolidacao-gestao-huboperacional
- **Authors:** operador + Claude

## Context

`huboperacional` é a holding que controla todas as empresas; a gestão (backoffice de afiliados/vendas/produtos) vivia em `gestao.ads4pros.com` — domínio de uma das agências. Isso é *drift de identidade*: o backoffice holding-level morando na marca de um produto confunde ownership em auditoria/compliance. O operador quis trazer a gestão pra debaixo do huboperacional, reaproveitando o que já existe. Isso reabre conscientemente a ADR-0002 (manter separados).

## Decision

Migrar **domínio + marca** da gestão: `gestao.ads4pros.com` → `gestao.huboperacional.com.br` e `parceiros.ads4pros.com` → `parceiros.huboperacional.com.br`. Chave técnica: expor a MESMA API `ads4pros-api` também em `api.huboperacional.com.br` (alias dual-host no Traefik) + cookie com **domínio dinâmico por Host** (antigo e novo convivem). **NÃO** vira monorepo — código/stacks continuam separados (ADR-0002 preservada); "código sob o org" já estava feito. O `huboperacional-site` **não é tocado**: segue chamando `api.ads4pros.com`.

## Consequences

- **O que melhora:** ownership/marca coerentes (gestão da holding sob o domínio da holding); a separação de segurança da ADR-0002 é mantida; rollback barato (remover os `Host()` novos + reverter cookie/audience).
- **O que piora ou exige cuidado:** parte sensível = auth/cookies (cross-repo pro auth-service, audiences `gestao`+`painel`); gate = login real (OTP) antes de cortar o antigo; o `sleep(8)` fixo do welcome precisa virar 6–12s random pra não re-triggerar enforcement do WhatsApp.
- **Reversível?** Sim, em minutos, enquanto o domínio antigo (301, Fase 4) não for cortado.

## Alternatives considered

- Monorepo (site+Painel+auth juntos) — descartado: reintroduz o blast radius que a ADR-0002 evitou.
- Mover a API inteira pra `api.huboperacional.com.br` e aposentar `api.ads4pros.com` — descartado: obrigaria mexer no site (`NEXT_PUBLIC_PAINEL_URL`) e na agência.
- Cookie por Bearer token (JS lê token não-httpOnly) em vez do dual-host — descartado: expõe o token a XSS.

## References

- Spec/plano: `D:\Claud Automations\Painel Gestao e Afiliados\docs\superpowers\specs\2026-07-14-migracao-gestao-huboperacional-design.md` + `.../plans/2026-07-14-migracao-gestao-huboperacional.md`.
- ADR-0002 (separação — esta a reafirma). Memória `consolidacao-gestao-huboperacional`.
