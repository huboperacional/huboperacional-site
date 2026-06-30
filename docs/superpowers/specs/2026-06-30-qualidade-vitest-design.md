---
spec: huboperacional-site v0.2 — Qualidade (Vitest unit)
data: 2026-06-30
fase: v0.2 / Frente "Qualidade" (docs/PLANO.md)
status: approved (brainstorming + decisões do operador)
escopo: adicionar test runner Vitest + 3 suites de unit pros módulos puros/lógicos; Playwright deferido
---

# Qualidade (Vitest unit) — Design Spec

## Contexto

O projeto não tem test runner (R1: "build passa não conta"). Os módulos de lógica
(`lib/structured-data.ts`, `lib/tracking.ts`, `lib/api.ts`) carregam comportamento testável
(serialização JSON-LD, captura/TTL de atribuição, tratamento de erro de fetch) sem cobertura.
Esta frente adiciona Vitest + unit tests, dando uma base de qualidade ao repo.

**Nota R10:** não-visual (sem tela/componente novo) → gate de design não se aplica.

## Decisões (brainstorming 2026-06-30)

| Tema | Decisão |
|---|---|
| Runner | Vitest (`vitest` + `jsdom`), config `vitest.config.ts`, `environment: 'jsdom'`, `globals: true` |
| Scripts | `"test": "vitest run"`, `"test:watch": "vitest"` |
| Escopo | unit dos 3 módulos: structured-data, tracking, api |
| Playwright E2E | **deferido** — testar forms de verdade dispara POST real ao Painel (leads/afiliados + WA). Sub-frente futura com network mockada |
| CI | fora de escopo (não há CI no repo) |

## Functional Requirements

### FR1 — Setup Vitest
- Adicionar devDeps `vitest` + `jsdom`.
- `services/web/vitest.config.ts`: `test.environment = 'jsdom'`, `test.globals = true`.
- `package.json`: scripts `test` (vitest run) e `test:watch` (vitest).

### FR2 — `lib/structured-data.test.ts`
- `organizationJsonLd()`: `@type` Organization, `name: 'Percus'`, `alternateName: 'Hub Operacional'`, `logo` aponta pra `/opengraph-image`, `contactPoint[0]` com email + telephone esperados.
- `breadcrumbJsonLd(items)`: `@type` BreadcrumbList; cada item vira `ListItem` com `position` 1..n e `item` = BASE + path absoluto.

### FR3 — `lib/tracking.test.ts` (jsdom)
- `captureOnFirstVisit()` grava UTMs/click-IDs presentes na URL + cookies `_fbp`/`_fbc` no localStorage (sob `STORAGE_KEY`).
- `getAttribution()` retorna a atribuição (sem `captured_at`) quando válida.
- TTL expirado (>90d via fake timers) → `getAttribution()` retorna `null` e remove a chave.
- Idempotência: 2ª `captureOnFirstVisit()` com URL diferente não sobrescreve captura válida existente.
- Reset de `localStorage`/cookies entre testes.

### FR4 — `lib/api.test.ts` (jsdom, fetch mockado)
- `submitLead` sucesso: `fetch` ok → `{ ok: true, data }`; body inclui `tracking`.
- 429 → `{ ok: false, status: 429 }` com mensagem de "muitas requisicoes".
- resposta não-ok com `detail` string → `error` = detail.
- erro de rede (fetch rejeita) → mensagem "erro de conexao".
- `AbortError` (DOMException) → mensagem de "tempo de resposta esgotado".
- `submitAffiliate` happy path análogo.

## Arquivos
- **Novos:** `services/web/vitest.config.ts`, `services/web/lib/structured-data.test.ts`,
  `services/web/lib/tracking.test.ts`, `services/web/lib/api.test.ts`
- **Editado:** `services/web/package.json` (devDeps + scripts)

## Success Criteria
- SC1: `npm install` instala vitest + jsdom.
- SC2: `npm run test` roda e **todas as suites passam** (verde).
- SC3: os 3 módulos têm cobertura dos caminhos descritos (sucesso + erros + TTL).
- SC4: `npm run build` (NODE_ENV=production) continua passando (arquivos `.test.ts` não entram no bundle).

## Edge cases
- `localStorage` indisponível: `tracking` engole erro silenciosamente — testar que não lança.
- Vitest roda sob NODE_ENV herdado (development) — ok, não usa `next build`.
- `.test.ts` deve ser ignorado pelo `tsconfig`/build do Next (Next ignora `*.test.*` por padrão; confirmar no build).

## Verificação E2E
1. `cd services/web && npm install`
2. `npm run test` → todas verdes.
3. `NODE_ENV=production npm run build` → segue passando (sanity de que os testes não quebram o bundle).
