# huboperacional-site — CLAUDE.md

## Versão do canon Percus adotada

**Versão:** ver `.percus-version` na raiz deste projeto (`6.30.4`) — **alinhado** ao canon (V2 adotado no PASSO B3 2026-07-20: roteador de loops abaixo + gate mecânico em `.git/hooks/pre-commit`, verificado VIVO 2026-07-21; execução de plano = subagent-driven).

Esse arquivo (uma linha com semver) declara qual versão do canon Percus este projeto adotou no último upgrade.

**Protocolo no primeiro turno de cada sessão** (não negociável):
1. `Get-Content .percus-version` — versão do projeto.
2. `Get-Content "${env:PERCUS_CANON_DIR}\CANON_VERSION.md" -TotalCount 5` — versão canônica atual.
3. Declarar no primeiro turno: "Projeto na versão X.Y.Z, canônica atual A.B.C — alinhado/divergente."
4. Se divergente, sugerir rodar `${env:PERCUS_CANON_DIR}\comandos\REORGANIZAR_PROJETO.md` antes de trabalho não-trivial.

## Roteador de loops (canon V2 — v6.30.0+)

Procedimento não mora neste arquivo: mora em `${env:PERCUS_CANON_DIR}/v2/loops/` e você
carrega **só o loop da situação**. Invariantes: `${env:PERCUS_CANON_DIR}/v2/CONSTITUICAO.md`.

| Situação | Leia AGORA |
|---|---|
| Feature/pedido novo, intenção ainda vaga | `v2/loops/grilling.md` |
| Intenção clara → escrever requisito | `v2/loops/spec.md` |
| Spec ou plano acabou de fechar | `v2/loops/conselho.md` (automático, não pergunte) |
| Vai começar a implementar | `v2/loops/tdd.md` |
| Vai commitar | `v2/loops/review.md` |
| Marco pronto pra prod | `v2/loops/deploy.md` |
| Sessão terminando / contexto cheio | `v2/loops/checkpoint.md` |
| Algo repetidamente estranho (escape reincidente, doc que não bate) | `v2/loops/drift.md` |

Sem situação da tabela → não carregue loop nenhum. Formatos de artefato (HANDOFF/CONTEXT/
ADR/PLANO): `${env:PERCUS_CANON_DIR}/v2/artefatos/`.

## O que é este projeto

Site vitrine público da softwarehouse Percus em `huboperacional.com.br` — apresenta os 8 produtos e serve de porta de entrada pro programa de afiliados. Topo de funil: captura lead (form /contato) e cadastro público de afiliado (form /afiliados), ambos POSTando direto pra API do Painel Ads4Pros. **Não tem backend próprio.**

## Stack

- **Frontend:** Next.js 15.5.4 (App Router + RSC) + TypeScript strict + Tailwind CSS 3.
- **Backend próprio:** ❌ nenhum. Os 2 forms consomem a API pública do Painel (`https://api.ads4pros.com/public/leads` e `/public/affiliate-signup`).
- **Banco / Cache / Auth:** N/A neste repo (vivem no Painel). Site é estático/SSG + ISR; sem login.
- **Tracking:** `services/web/lib/tracking.ts` captura 15 campos canon (R2 / `03_TRACKING_ATTRIBUITION.md`), persiste em `localStorage` (TTL 90d), anexa às submissions.
- **Deploy:** Docker Swarm via Portainer no VPS `161.97.129.138`, Traefik `Host('huboperacional.com.br')` + letsencrypt. Imagem `huboperacional-site:vX.Y.Z` (`node:20-slim` debian).
- **Domínio:** `huboperacional.com.br`.

## Estrutura relevante

```
huboperacional-site/
├── services/web/               # Next.js 15 app (único service)
│   ├── app/                    # rotas: /, /produtos, /produtos/[slug], /afiliados, /contato, /sobre, sitemap.ts, robots.ts
│   ├── components/             # Header, Footer, ProductCard, ContactForm, AffiliateForm, TrackingProvider
│   ├── lib/                    # products.ts (8 produtos), tracking.ts (15 campos), api.ts (clients /public/*)
│   └── .env.example            # NEXT_PUBLIC_PAINEL_URL
├── deploy/                     # Dockerfile.web + docker-compose.yml (Swarm + Traefik)
├── docs/
│   ├── PLANO.md                # tracking [0]→[5-T] (fonte da verdade)
│   ├── mock-audit.md           # estado real de cada tela (R3)
│   ├── adrs/                   # Architecture Decision Records
│   └── superpowers/specs/      # specs de features grandes
├── catalog-info.yaml           # feature catalog cross-projeto (R22/Fase 6)
├── HANDOFF.md
├── AGENTS.md                   # regras pro revisor cross-provider (R11)
└── .percus-version
```

## Como rodar localmente

```bash
cd services/web
npm install
npm run dev        # http://localhost:3000
NODE_ENV=production npm run build   # sanity (output standalone)
```

> ⚠️ Build local **precisa** de `NODE_ENV=production`. O `.claude/settings.json` (canon) seta `NODE_ENV=development` pro dev server, e isso vaza pro `next build`, quebrando o prerender de `/404` (`<Html> should not be imported...`). O Docker não é afetado (builder stage não força development). Ver memória [[build-nodeenv-production]].

## Critério de "pronto" para qualquer feature

Build passando **não conta** (R1). Como é frontend sem CRUD de banco próprio, "pronto" aqui é:
- **Página / SEO:** renderiza com dado real + verificada em prod (`curl` HTTP 200 + inspeção de meta/JSON-LD).
- **Form:** submit real dispara entry no Painel (`site_leads` / affiliate criado) — não só "toast de sucesso".

Tags e pipeline adaptados em `docs/PLANO.md`. R1 completo em `${env:PERCUS_CANON_DIR}\01_REGRAS_INEGOCIAVEIS.md`.

## Tracking de features

Fonte da verdade: `docs/PLANO.md`. **Atualizar imediatamente após cada etapa** (R2).

Tags: `[0]` planejado · `[4-C]` componente renderiza dado real · `[5-T]` ✅ verificado E2E. (As tags backend `[1-S]/[2-E]/[3-H]` não se aplicam — ver nota no PLANO.)

Marcações visuais (acumulam): `🎨` design aprovado · `🎨?` precisa draft antes de sair de `[0]` · `🤖` delegado ao DeepSeek (R13) · `✓` revisor aprovou no marco (R11).

## Regra de mock (R3)

Tela com dado mock = banner `MODO DEMO` + toast `"salvo localmente"`, nunca só `"salvo"`. Os 8 produtos em `lib/products.ts` são **conteúdo estático intencional** (não mock-data, não MODO DEMO). Auditoria em `docs/mock-audit.md`, atualizada toda sessão com frontend.

## Workflow obrigatório para features novas

Brainstorming → plano → execução vertical `[0]→[5-T]` → `/percus-review:review` → commit. Feature visual de tela nova passa pelo gate de design (R10) ANTES de codar.

## Autonomia — resolva o máximo sem perguntar (R5, R9, R11)

O operador quer que você **resolva o máximo possível sozinho**. Confirmação é EXCEÇÃO, não default.

- **Rode review/conselho/testes/lint/build/checkpoint sozinho.** ❌ Nunca peça "rode `/percus-review:review`" — você dispara o wrapper (auto-trigger). Ao finalizar uma **spec** → roda `spec-analyze` sozinho; ao finalizar um **plano** → roda `council-pre-mortem` sozinho. Sempre, sem perguntar.
- **Maximize paralelo (default):** subagents pra tasks independentes, frentes disjuntas, múltiplos tool calls concorrentes numa só mensagem. Serial só com dependência real. Não paralelizar quando cabia = anti-padrão.
- **Execução de plano = subagent-driven por default (R9):** plano/frente com 2+ tasks independentes → **um subagente por task, revisando entre tasks**, sem perguntar "subagent ou inline?" (pergunta boba, família da trava do R5). Inline só pra tarefa única trivial.
- **Limpe lixo que VOCÊ criou** (scratchpad, worktrees temp, arquivos efêmeros, branches locais próprias) sem confirmar. R5 não se aplica a lixo auto-criado.
- **Deploy/mutação de prod é autônomo (padrão Percus):** troca de env, `--env-add`, restart/redeploy, rollback, migration com `downgrade` testado → **execute direto, sem confirmar caso a caso**; escolha o caminho padrão (faça tudo, ex.: via SSH). Ler segredo do `.env` e usá-lo sem imprimir = ok.
- **Quando confirmar for legítimo** (destruição irreversível de dados: `DELETE`/`DROP` em prod, force-push que apaga história): **uma pergunta binária "confirmo X? sim/não" com o caminho já decidido — NUNCA um menu "(a)/(b)/(c) quem faz o quê".**

## Review cross-provider (R11)

Obrigatório em dois momentos: (1) antes de cada commit que muda código — review router auto; (2) ao concluir cada marco — `milestone-review` duplo (DeepSeek + Cross-Claude).

**Matriz de roteamento (`/percus-review:review`):**

| Cenário | Reviewer |
|---|---|
| Pre-commit rotineiro | DeepSeek (`deepseek-chat`) |
| Pre-commit de saída DeepSeek (trailer `Co-implemented-by: deepseek-v4`) | Cross-Claude apenas |
| Marco | DeepSeek + Cross-Claude duplo |

> Pasta sensível (`auth/`, `payment*/`, `migrations/`, `.env*`) → duplo. **Este projeto não tem nenhuma** — review rotineiro é DeepSeek simples.

**Tratamento de findings:** bug/regressão → corrigir antes do commit; violação de regra → corrigir OU declarar em voz alta por que ignora; preferência de estilo → ignorar OK declarando.

Sem review nos últimos 5 min antes do commit = não pode commitar. Chaves `DEEPSEEK_API_KEY` + `GROQ_API_KEY` já no ambiente da máquina.

### Workflow de commit do agente (auto-trigger)

ANTES de qualquer `git commit` que toca código, rodar via Bash:
```
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}\scripts\percus-review-auto.ps1"
```
Ler findings DeepSeek e tratar críticos. Se aparecer `__PERCUS_NEEDS_CROSS_CLAUDE__` no stderr → dispatch Sonnet subagent (Agent tool) com prompt R11 cross-claude-review e salvar output em `.deepseek/reviews/<ts>-cross-claude.jsonl`. Apresentar consolidado, declarar ignorados, então commitar.

**Skills vs slash commands:** skills do plugin (`feature-flow`, `delegate-impl`, `catalog-publish`, `close-milestone`, etc.) são **auto-trigger pelo agente** via `Skill` tool — não peça pro user "rodar /percus-review:feature-flow". Ref: `${env:PERCUS_CANON_DIR}\comandos\SKILLS_VS_COMMANDS.md`.

## Routing de modelos (R13)

Implementação mecânica delegável ao DeepSeek V4 via `${env:PERCUS_CANON_DIR}\scripts\deepseek-impl.{ps1,sh}` — saída é rascunho, sempre revisada por Claude (R1–R12) + cross-provider (R11). Commit com saída DeepSeek termina com `Co-implemented-by: deepseek-v4`. Marcar `🤖` no PLANO.

**Quando delegar (todos):** plano explícito + arquivos nomeados + sem decisão arquitetural pendente + ≤3 arquivos ou padrão repetido. **Quando NÃO:** brainstorm, decisão arquitetural, debug não-trivial, tarefa visual (segue R10).

## Design (R10)

Tela/componente novo: **não** usar Claude artifacts (vetado p/ produção). Componente isolado → shadcn MCP; tela/fluxo novo → Claude Design (`https://claude.ai/design`); diagrama → Excalidraw/Mermaid. Workflow: `${env:PERCUS_CANON_DIR}\comandos\DESIGN_WORKFLOW.md`.

## Deploy (R24)

Cadência: marco / fim-do-dia / sob-demanda — **não** per-feature. Smoke pós-deploy obrigatório + rollback conhecido. Playbook em `${env:PERCUS_CANON_DIR}\comandos\DEPLOY.md`. Comandos específicos do site no `HANDOFF.md`.

## Decisões arquiteturais deste projeto

- **Frontend e backend de afiliados ficam em projetos SEPARADOS** (huboperacional-site vs Painel Gestao e Afiliados) — decidido 2026-06-28. Acoplamento via contrato de API público (`/public/leads`, `/public/affiliate-signup`). Razão completa em `HANDOFF.md` e `docs/adrs/`. Site = topo de funil; Painel = sistema de registro (dono dos dados).
- Produtos como `const` tipada em `lib/products.ts` (não `.mdx`) — fallback do pré-mortem aplicado.
- Dockerfile `node:20-slim` (debian, não alpine) — fallback do pré-mortem (musl).

## Coding conventions

- Funções/variáveis: `camelCase` · Componentes/classes: `PascalCase` · Constantes: `UPPER_SNAKE_CASE`.
- Hooks com prefixo `use*`. **Vetado:** `localStorage` para token de auth (N/A aqui — site sem auth), Redux (usar estado React/Zustand), CSS-in-JS runtime (usar Tailwind).
- Comentários no código em **inglês**, documentação de projeto em **português**.

## Referências externas

- **Regras universais:** `${env:PERCUS_CANON_DIR}\01_REGRAS_INEGOCIAVEIS.md`
- **Stack e infra:** `${env:PERCUS_CANON_DIR}\02_INFRA_E_STACK_PERCUS.md`
- **Tracking de atribuição:** `${env:PERCUS_CANON_DIR}\03_TRACKING_ATTRIBUITION.md`
- **Routing de modelos:** `${env:PERCUS_CANON_DIR}\04_MODEL_ROUTING.md`
- **Feature tracking:** `${env:PERCUS_CANON_DIR}\05_FEATURE_TRACKING.md`
- **Design workflow (R10):** `${env:PERCUS_CANON_DIR}\comandos\DESIGN_WORKFLOW.md`
- **Deploy (R24):** `${env:PERCUS_CANON_DIR}\comandos\DEPLOY.md`
- **Umbrella reorganizar:** `${env:PERCUS_CANON_DIR}\comandos\REORGANIZAR_PROJETO.md`
- **AGENTS.md (irmão):** regras espelhadas pro revisor cross-provider — manter sincronizado.
