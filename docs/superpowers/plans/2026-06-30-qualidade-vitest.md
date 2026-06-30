# Qualidade (Vitest unit) — Implementation Plan

> **For agentic workers:** execução inline (streamline) nesta sessão. Steps com checkbox.

**Goal:** Adicionar Vitest + jsdom e 3 suites de unit cobrindo `structured-data`, `tracking` e `api`.

**Architecture:** Vitest com `environment: 'jsdom'` (cobre `window`/`localStorage`/`document.cookie` do tracking) e `globals: true`. Testes ao lado dos módulos em `lib/*.test.ts`. fetch e timers mockados via `vi`.

**Tech Stack:** Vitest, jsdom, TypeScript. Sem `next build` envolvido (gotcha NODE_ENV não se aplica).

**Notas:** R10 N/A (não-visual). R11 (review) antes de cada commit; `git push` proibido antes de 01/07.

---

### Task 1: Setup Vitest

**Files:** Modify `services/web/package.json`; Create `services/web/vitest.config.ts`.

- [ ] Instalar devDeps: `cd services/web && npm install -D vitest jsdom`
- [ ] Adicionar scripts em `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] Criar `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['lib/**/*.test.ts'],
  },
});
```
- [ ] Verificar: `npm run test` roda (mesmo sem testes ainda, sai 0 ou "no tests").

### Task 2: `lib/structured-data.test.ts` (env node-ok, sem DOM)

**Casos:**
- `organizationJsonLd()` → `['@type']==='Organization'`, `name==='Percus'`, `alternateName==='Hub Operacional'`, `logo` termina em `/opengraph-image`, `contactPoint[0].email==='trafego@percus.com.br'`, `contactPoint[0].telephone==='+5567933009440'`.
- `breadcrumbJsonLd([{name:'Início',path:'/'},{name:'Produtos',path:'/produtos'},{name:'X',path:'/produtos/x'}])` → `['@type']==='BreadcrumbList'`; `itemListElement` length 3; positions `[1,2,3]`; primeiro `item==='https://huboperacional.com.br/'`; último `item` termina em `/produtos/x`.

- [ ] Escrever a suite, `npm run test` → verde.

### Task 3: `lib/tracking.test.ts` (jsdom)

**Setup por teste:** `localStorage.clear()`; limpar cookies; `vi.useRealTimers()` no `afterEach`. Stub de location:
```typescript
function setLocation(href: string) {
  Object.defineProperty(window, 'location', { writable: true, configurable: true, value: { href } });
}
```
`document.referrer` via `Object.defineProperty(document, 'referrer', { configurable: true, value: '' })`. Cookies via `document.cookie = '_fbp=...'`.

**Casos:**
- captura: `setLocation('https://huboperacional.com.br/?utm_source=fb&gclid=123')` + `captureOnFirstVisit()` → `getAttribution()` retorna `{ utm_source:'fb', gclid:'123', landing_url: <href> }` (sem `captured_at`).
- cookies: setar `document.cookie='_fbp=abc'` antes do capture → atribuição inclui `fbp:'abc'`.
- TTL: usar `vi.useFakeTimers(); vi.setSystemTime(t0)`; capturar; avançar `vi.setSystemTime(t0 + 91 dias)`; `getAttribution()` → `null` e `localStorage.getItem(STORAGE_KEY)` removido. (STORAGE_KEY = `'percus_attribution'`.)
- idempotência: capturar com `?utm_source=fb`; depois `setLocation(...?utm_source=google)` + `captureOnFirstVisit()` de novo → `getAttribution().utm_source` continua `'fb'`.
- sem params: `setLocation('https://huboperacional.com.br/')` + capture → atribuição só com `landing_url` (e `referrer` se houver), sem UTMs.

- [ ] Escrever a suite, `npm run test` → verde.

### Task 4: `lib/api.test.ts` (jsdom, fetch mock)

**Setup:** `vi.stubGlobal('fetch', vi.fn())` por teste; `localStorage.clear()` (getAttribution sem dados → `{}`). `afterEach(() => vi.unstubAllGlobals())`.

**Casos (usando `submitLead({name,email,message})`):**
- sucesso: fetch resolve `{ ok:true, status:200, json: async()=>({lead_id:'1'}) }` → resultado `{ ok:true, data:{lead_id:'1'} }`; e `fetch` chamado com URL terminando em `/public/leads`, body JSON contendo `tracking`.
- 429: fetch resolve `{ ok:false, status:429, json: async()=>({}) }` → `{ ok:false, status:429 }` e `error` inclui "Muitas requisicoes".
- erro com detail: `{ ok:false, status:400, json: async()=>({detail:'Email invalido'}) }` → `error==='Email invalido'`.
- rede: fetch rejeita `new Error('boom')` → `{ ok:false }`, `error` inclui "conexao".
- abort: fetch rejeita `new DOMException('aborted','AbortError')` → `error` inclui "Tempo de resposta esgotado".
- `submitAffiliate({name,email,whatsapp})` happy path → URL termina em `/public/affiliate-signup`.

- [ ] Escrever a suite, `npm run test` → verde.

### Task 5: Verificação final + commit + tracking

- [ ] `npm run test` → todas as suites verdes (contar testes).
- [ ] `NODE_ENV=production npm run build` → segue passando (os `.test.ts` não entram no bundle).
- [ ] Review R11 (`percus-review-auto.ps1`); tratar findings.
- [ ] Commit (sem push): config+package em um commit, suites em outro (ou um commit coeso). Ex.:
  - `test(setup): vitest + jsdom + scripts`
  - `test(lib): unit de structured-data, tracking e api`
- [ ] Atualizar `docs/PLANO.md` (Frente Qualidade: Vitest `[5-T]` — verde local; Playwright segue `[0]`) + commit.

## Verificação final
- `npm run test` verde; `npm run build` (prod) ok; PLANO atualizado.
