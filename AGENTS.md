# huboperacional-site — AGENTS.md

> Regras Percus deste projeto. Lido pelo **revisor cross-provider** (DeepSeek + Cross-Claude) durante `/percus-review:review` e `/percus-review:milestone-review`.
> Mantenha sincronizado com `CLAUDE.md`. Em conflito, `CLAUDE.md` prevalece (fonte canônica).

---

## Papel do revisor neste projeto

**Revisor é REVISOR, não desenvolvedor.**

- ✅ **Faz:** revisa diffs antes do commit, aponta bugs, regressões, violações de regras Percus, melhorias de clareza.
- ❌ **Não faz:** escreve código novo, refatora, propõe arquiteturas, executa deploy.

Fluxo quando review dispara (manual `/percus-review:review` ou auto-trigger via `scripts/percus-review-auto.ps1`):
1. Router lê `git diff` ativo + paths tocados + último commit message.
2. Decide reviewer(s).
3. Reviewer lê este `AGENTS.md` pra conhecer as regras.
4. Reporta findings com severidade (bug / risco / preferência).
5. Sugere fix mas NÃO aplica.

**Skills vs slash commands:** skills do plugin (`feature-flow`, `delegate-impl`, `catalog-publish`, etc.) são auto-trigger pelo agente via `Skill` tool — não existem como slash command. Ref: `${env:PERCUS_CANON_DIR}/comandos/SKILLS_VS_COMMANDS.md`.

---

## O que é este projeto

Site vitrine público (`huboperacional.com.br`) dos produtos Percus + porta de entrada do programa de afiliados. **Frontend puro, sem backend próprio** — os 2 forms POSTam pra API pública do Painel.

## Stack

- **Frontend:** Next.js 15.5.4 (App Router + RSC) + TypeScript strict + Tailwind 3. Output `standalone`.
- **Backend próprio:** ❌ nenhum. Consome `https://api.ads4pros.com/public/{leads,affiliate-signup}`.
- **Deploy:** Docker Swarm via Portainer no VPS `161.97.129.138` (Traefik + letsencrypt).

> Sem Python, sem banco/Redis/auth próprios neste repo. Regras backend (R6/R7/R14–R19) **não se aplicam** aqui — não as aponte.

---

## Regras Percus em cada review (escopo deste projeto)

Versão completa: `${env:PERCUS_CANON_DIR}/01_REGRAS_INEGOCIAVEIS.md`

| Regra | O que apontar |
|---|---|
| R1 — feito = verificado | Diff que declara "feito" sem evidência (página verificada em prod / form com submit real ao Painel). "Build passa" não conta. |
| R2 — tracking `[0]→[5-T]` | Feature mexida sem update no `docs/PLANO.md`, ou pulou etapas |
| R3 — zero mock escondido | `toast.success("Salvo!")` sem `await` na chamada real ao Painel; falta de banner MODO DEMO em dado local. (Produtos estáticos em `lib/products.ts` são intencionais — não apontar.) |
| R5 — confirmar ações custosas/irreversíveis | Push externo, deploy, força sem confirmação |
| R10 — gate de design | Tela/componente novo sem referência a draft de design aprovado (Claude Design / shadcn) |
| R13 — output DeepSeek | Diff vindo de delegação que toca algo sensível ou esconde mock |
| R18 — tracking ≠ auth | `lib/tracking.ts` (UTM/pixels/click-IDs) acoplado a lógica de identidade/login |
| R24 — deploy ao marco | Sinais de deploy per-feature em vez de marco/fim-do-dia/sob-demanda |
| R25 — single source of truth | Diretiva copiada pra dentro do repo em vez de apontar pro canon |

---

## Padrões de código (TypeScript / React)

- Funções e variáveis: `camelCase`; componentes: `PascalCase`; hooks com prefixo `use*`.
- **Vetado:** `localStorage` para token de auth (R7 — N/A aqui, mas não introduzir auth client-side insegura); Redux (usar estado React/Zustand); CSS-in-JS runtime (usar Tailwind).
- Server Components por padrão; `"use client"` só onde há interatividade (forms, TrackingProvider).
- `fetch` com timeout/AbortController em chamadas externas (já padrão em `lib/api.ts`).

### Comentários
- No código: **inglês**. Em docs/markdown do projeto: **português**.

---

## Formato dos findings

```
[SEV: bug | risco | preferência]
Arquivo: caminho/relativo.tsx:linha
Regra violada: R{N} (se aplicável)
Problema: descrição em 1-2 frases
Sugestão: código alternativo ou ação concreta
```

Exemplo:
```
[SEV: bug]
Arquivo: services/web/components/ContactForm.tsx:42
Regra violada: R3 (zero mock escondido)
Problema: toast.success("Enviado!") chamado sem await na chamada a submitLead().
Sugestão: await submitLead(...) e checar resp.ok antes do toast de sucesso.
```

---

## NÃO apontar

- Estilo subjetivo sem violação concreta de regra.
- Refactor de código fora do diff.
- Regras backend (R6/R7/R14–R19) — não há backend neste repo.
- Os 8 produtos estáticos em `lib/products.ts` como "mock".
- Sugestões que contradigam o stack canônico em `${env:PERCUS_CANON_DIR}/02_INFRA_E_STACK_PERCUS.md`.

---

## Quando o revisor DEVE se recusar

Se o diff não está disponível, inclui binários, ou inclui `.env`/credenciais, **abortar e reportar** em vez de revisar. Não suprimir o aviso.

---

## Atualização deste arquivo

Sempre que `CLAUDE.md` mudar regras de codificação ou stack, **atualize aqui também**. Revisão sugerida: a cada release ou a cada 2 semanas, comparar `AGENTS.md` vs `CLAUDE.md` e sincronizar.
