# Suíte Playwright E2E + Contract-guard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma rede de segurança contra regressões de frontend: suíte Playwright E2E (rede mockada) dos 2 forms + wizard, e um contract-guard Vitest que valida os payloads sem rede.

**Architecture:** Playwright intercepta os 3 endpoints `**/public/*` via `page.route()` (zero submit real, zero WhatsApp), captura o body pra asserção e responde com fixtures. Roda contra `next dev` (sobrescrevível por env). O contract-guard vive no Vitest existente e valida a saída serializada de cada builder de `lib/api.ts` contra um schema versionado.

**Tech Stack:** Next.js 15.5.4, TypeScript strict, `@playwright/test` (novo), Vitest 4 (já configurado, jsdom).

**Fonte:** spec `docs/superpowers/specs/2026-07-14-playwright-e2e-design.md` (commit `9c68e6e`).

**Convenções do projeto:** comentários de código em inglês. Build local exige `NODE_ENV=production` (por isso o E2E usa `next dev`). Cada commit que toca código dispara o review R11 via hook nativo — **antes de cada `git commit`**, rodar `pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"`, tratar findings críticos, e só então commitar. Todos os comandos abaixo rodam de `D:/Claud Automations/huboperacional-site/services/web` salvo indicado.

---

## File Structure

**Criar:**
- `services/web/playwright.config.ts` — config do runner (webServer, projeto chromium, testDir).
- `services/web/e2e/helpers/mock-api.ts` — interceptação + captura de body dos 3 endpoints.
- `services/web/e2e/contact.spec.ts` — E2E do form /contato.
- `services/web/e2e/affiliate.spec.ts` — E2E do form /afiliados.
- `services/web/e2e/new-client.spec.ts` — E2E do wizard /new-client/[lang].
- `services/web/lib/painel-contract.ts` — schema versionado dos payloads `/public/*` + validador puro.
- `services/web/lib/api-contract.test.ts` — contract-guard Vitest.

**Modificar:**
- `services/web/package.json` — scripts `test:e2e`/`test:e2e:ui` + devDep `@playwright/test`.
- `services/web/.gitignore` — `playwright-report/`, `test-results/` (criar o arquivo se não existir).
- `services/web/components/NewClientWizard.tsx` — prop `testId` no `TextField` + `data-testid` nos campos do wizard e no `<select>` de regime.
- `docs/PLANO.md` — mover o item Playwright pra `[5-T]` no fim.

**Responsabilidade por arquivo:** `mock-api.ts` é o único lugar que sabe os globs dos endpoints e as fixtures. `painel-contract.ts` é o único lugar que declara o contrato de payload. Cada `*.spec.ts` cobre uma superfície (um form / o wizard) e nada além.

---

## Task 1: Instalar Playwright, config e scripts

**Files:**
- Modify: `services/web/package.json`
- Create: `services/web/playwright.config.ts`
- Create/Modify: `services/web/.gitignore`

- [ ] **Step 1: Instalar a dependência e o browser**

Run (de `services/web`):
```bash
npm install -D @playwright/test@latest
npx playwright install chromium
```
Expected: `@playwright/test` aparece em `devDependencies` do `package.json`; o binário do Chromium baixa sem erro.

- [ ] **Step 2: Adicionar os scripts npm**

Em `services/web/package.json`, dentro de `"scripts"`, adicionar após `"test:watch": "vitest"`:
```json
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
```
(lembrar da vírgula na linha anterior).

- [ ] **Step 3: Criar `services/web/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

// E2E runs against `next dev` by default (agnostic to route interception and
// sidesteps the NODE_ENV/standalone /404 prerender gotcha). Override the server
// command with PW_WEBSERVER_CMD to run against a production build when needed.
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.PW_WEBSERVER_CMD || 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Ignorar os artefatos do Playwright**

Anexar ao `services/web/.gitignore` (criar o arquivo se não existir):
```
# Playwright
/playwright-report/
/test-results/
/playwright/.cache/
```

- [ ] **Step 5: Verificar que o runner sobe (sanity, 0 specs ainda)**

Run:
```bash
npx playwright test --list
```
Expected: sai sem erro; lista 0 testes (nenhum spec ainda). Se reclamar de browser faltando, repetir `npx playwright install chromium`.

- [ ] **Step 6: Rodar review R11 e commitar**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
```
Tratar findings críticos (se `__PERCUS_NEEDS_CROSS_CLAUDE__` no stderr → dispatch cross-claude). Então:
```bash
cd "D:/Claud Automations/huboperacional-site"
git add services/web/package.json services/web/package-lock.json services/web/playwright.config.ts services/web/.gitignore
git commit -m "test(e2e): setup Playwright (config, scripts, gitignore)"
```

---

## Task 2: Helper de interceptação de rede

**Files:**
- Create: `services/web/e2e/helpers/mock-api.ts`

- [ ] **Step 1: Escrever o helper completo**

`services/web/e2e/helpers/mock-api.ts`:
```ts
import type { Page, Route } from '@playwright/test';

// A single place that knows the three public endpoint globs and how to fake them.
// Each mock captures the request body so specs can assert on the serialized payload
// (e.g. that `tracking` / `ref_code` made it into the POST) without any real call.

export type MockResponse = {
  status?: number;      // fulfilled HTTP status (ignored when abort=true)
  json?: object;        // fulfilled JSON body
  abort?: boolean;      // simulate a network failure instead of responding
};

export type Captured = {
  /** Parsed JSON body of the most recent intercepted request, or null. */
  body: Record<string, unknown> | null;
  /** How many times the endpoint was hit. */
  count: number;
};

async function installMock(page: Page, urlGlob: string, resp: MockResponse): Promise<Captured> {
  const captured: Captured = { body: null, count: 0 };
  await page.route(urlGlob, async (route: Route) => {
    captured.count += 1;
    const raw = route.request().postData();
    captured.body = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    if (resp.abort) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({
      status: resp.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(resp.json ?? {}),
    });
  });
  return captured;
}

export const mockLeads = (page: Page, resp: MockResponse) => installMock(page, '**/public/leads', resp);
export const mockAffiliate = (page: Page, resp: MockResponse) => installMock(page, '**/public/affiliate-signup', resp);
export const mockNewClient = (page: Page, resp: MockResponse) => installMock(page, '**/public/new-client', resp);
```

- [ ] **Step 2: Verificar typecheck**

Run (de `services/web`):
```bash
npx tsc --noEmit
```
Expected: sem erros (o helper compila; `@playwright/test` fornece os tipos `Page`/`Route`).

- [ ] **Step 3: Commit** (sem review — nenhum spec usa ainda, mas é código; rodar review por segurança)

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add services/web/e2e/helpers/mock-api.ts
git commit -m "test(e2e): mock-api helper (route interception + body capture)"
```

---

## Task 3: E2E do form /contato

**Files:**
- Create: `services/web/e2e/contact.spec.ts`

Seletores (inputs têm `id` estável): `#ct-name`, `#ct-email`, `#ct-wa`, `#ct-msg`; submit `getByRole('button', { name: 'Enviar mensagem' })`; sucesso `getByText('Mensagem enviada!')`.

- [ ] **Step 1: Escrever o spec completo**

`services/web/e2e/contact.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { mockLeads } from './helpers/mock-api';

test.describe('/contato — lead form', () => {
  test('happy-path: submits and shows success, body carries tracking', async ({ page }) => {
    const captured = await mockLeads(page, { status: 200, json: { lead_id: 't-1' } });
    await page.goto('/contato');

    await page.fill('#ct-name', 'Ana Souza');
    await page.fill('#ct-email', 'ANA@Example.com');
    await page.fill('#ct-msg', 'Gostaria de saber mais sobre os produtos.');
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(page.getByText('Mensagem enviada!')).toBeVisible();
    expect(captured.count).toBe(1);
    expect(captured.body).toMatchObject({ name: 'Ana Souza', email: 'ana@example.com' });
    expect(captured.body).toHaveProperty('tracking');
  });

  test('rate-limit 429 shows the rate-limit message', async ({ page }) => {
    await mockLeads(page, { status: 429, json: {} });
    await page.goto('/contato');

    await page.fill('#ct-name', 'Ana Souza');
    await page.fill('#ct-email', 'ana@example.com');
    await page.fill('#ct-msg', 'Mensagem de teste com mais de dez chars.');
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(page.getByText(/Muitas requisicoes/i)).toBeVisible();
  });

  test('network failure shows the connection-error message', async ({ page }) => {
    await mockLeads(page, { abort: true });
    await page.goto('/contato');

    await page.fill('#ct-name', 'Ana Souza');
    await page.fill('#ct-email', 'ana@example.com');
    await page.fill('#ct-msg', 'Mensagem de teste com mais de dez chars.');
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(page.getByText(/Erro de conexao/i)).toBeVisible();
  });

  test('client-side validation blocks submit (fetch never called)', async ({ page }) => {
    const captured = await mockLeads(page, { status: 200, json: { lead_id: 't-1' } });
    await page.goto('/contato');

    // Leave required #ct-name empty → native HTML5 validation blocks the submit.
    await page.fill('#ct-email', 'ana@example.com');
    await page.fill('#ct-msg', 'Mensagem de teste com mais de dez chars.');
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(page.getByText('Mensagem enviada!')).toHaveCount(0);
    expect(captured.count).toBe(0);
  });

  test('?produto prefills the message textarea', async ({ page }) => {
    // Guard: this test never clicks submit, but installing the mock guarantees no
    // real /public/leads call can ever escape (zero-real-call invariant of the suite).
    await mockLeads(page, { status: 200, json: { lead_id: 't-1' } });
    await page.goto('/contato?produto=CRM%20Plexco');
    await expect(page.locator('#ct-msg')).toHaveValue(
      'Tenho interesse em saber mais sobre CRM Plexco.',
    );
  });
});
```

- [ ] **Step 2: Rodar o spec e verificar verde**

Run:
```bash
npx playwright test e2e/contact.spec.ts
```
Expected: 5 passed. Se algum seletor falhar, ajustar contra o DOM real (`npx playwright test e2e/contact.spec.ts --debug`).

- [ ] **Step 3: Review + commit**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add services/web/e2e/contact.spec.ts
git commit -m "test(e2e): cobertura do form /contato (happy, 429, falha de rede, validacao, ?produto)"
```

---

## Task 4: E2E do form /afiliados

**Files:**
- Create: `services/web/e2e/affiliate.spec.ts`

Seletores: `#af-name`, `#af-email`, `#af-wa`; submit `getByRole('button', { name: 'Quero ser parceiro' })`; sucesso criado `getByText('Cadastro confirmado!')` (+ código); já registrado `getByText('Você já é parceiro!')`.

- [ ] **Step 1: Escrever o spec completo**

`services/web/e2e/affiliate.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import { mockAffiliate } from './helpers/mock-api';

test.describe('/afiliados — affiliate signup', () => {
  test('happy-path (created): shows ref code and "4 mensagens" copy', async ({ page }) => {
    const captured = await mockAffiliate(page, {
      status: 200,
      json: { ref_code: 'ana-souza-1a2b', status: 'created' },
    });
    await page.goto('/afiliados');

    await page.fill('#af-name', 'Ana Souza');
    await page.fill('#af-email', 'ana@example.com');
    await page.fill('#af-wa', '+55 67 99999-9999');
    await page.getByRole('button', { name: 'Quero ser parceiro' }).click();

    await expect(page.getByText('Cadastro confirmado!')).toBeVisible();
    await expect(page.getByText('ana-souza-1a2b')).toBeVisible();
    await expect(page.getByText(/4 mensagens/i)).toBeVisible();
    expect(captured.body).toMatchObject({ name: 'Ana Souza', email: 'ana@example.com' });
    expect(captured.body).toHaveProperty('tracking');
  });

  test('already_registered: shows the alternate copy', async ({ page }) => {
    await mockAffiliate(page, {
      status: 200,
      json: { ref_code: 'ana-souza-1a2b', status: 'already_registered' },
    });
    await page.goto('/afiliados');

    await page.fill('#af-name', 'Ana Souza');
    await page.fill('#af-email', 'ana@example.com');
    await page.fill('#af-wa', '+55 67 99999-9999');
    await page.getByRole('button', { name: 'Quero ser parceiro' }).click();

    await expect(page.getByText('Você já é parceiro!')).toBeVisible();
    await expect(page.getByText('ana-souza-1a2b')).toBeVisible();
  });

  test('rate-limit 429 shows an error message', async ({ page }) => {
    await mockAffiliate(page, { status: 429, json: {} });
    await page.goto('/afiliados');

    await page.fill('#af-name', 'Ana Souza');
    await page.fill('#af-email', 'ana@example.com');
    await page.fill('#af-wa', '+55 67 99999-9999');
    await page.getByRole('button', { name: 'Quero ser parceiro' }).click();

    await expect(page.getByText(/Muitas requisicoes/i)).toBeVisible();
    // The success panel must not appear.
    await expect(page.getByText('Cadastro confirmado!')).toHaveCount(0);
  });

  test('network failure shows the connection-error message', async ({ page }) => {
    await mockAffiliate(page, { abort: true });
    await page.goto('/afiliados');

    await page.fill('#af-name', 'Ana Souza');
    await page.fill('#af-email', 'ana@example.com');
    await page.fill('#af-wa', '+55 67 99999-9999');
    await page.getByRole('button', { name: 'Quero ser parceiro' }).click();

    await expect(page.getByText(/Erro de conexao/i)).toBeVisible();
  });

  test('client-side validation blocks submit (fetch never called)', async ({ page }) => {
    const captured = await mockAffiliate(page, { status: 200, json: { ref_code: 'x', status: 'created' } });
    await page.goto('/afiliados');

    // WhatsApp is required — leave it empty.
    await page.fill('#af-name', 'Ana Souza');
    await page.fill('#af-email', 'ana@example.com');
    await page.getByRole('button', { name: 'Quero ser parceiro' }).click();

    await expect(page.getByText('Cadastro confirmado!')).toHaveCount(0);
    expect(captured.count).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar e verificar**

Run:
```bash
npx playwright test e2e/affiliate.spec.ts
```
Expected: 5 passed.

- [ ] **Step 3: Review + commit**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add services/web/e2e/affiliate.spec.ts
git commit -m "test(e2e): cobertura do form /afiliados (created, already_registered, falha de rede, validacao)"
```

---

## Task 5: Seletores estáveis no wizard (`data-testid`)

Os `<label>` do `TextField` não têm `htmlFor`/`id`, então `getByLabel` não pega os inputs do wizard. Adicionar `data-testid` mínimos — mudança pequena e não-visual (não muda render, só adiciona atributo; não é gate R10).

**Files:**
- Modify: `services/web/components/NewClientWizard.tsx`

- [ ] **Step 1: Adicionar a prop `testId` ao `TextField`**

Na assinatura de `TextField` (por volta da linha 470-492), adicionar `testId` ao tipo e ao `<input>`:

No objeto de props do tipo, adicionar a chave:
```tsx
  inputMode,
  testId,
}: {
```
No bloco de tipos, adicionar após `inputMode?: ...;`:
```tsx
  testId?: string;
```
No `<input>` (por volta da linha 498-505), adicionar o atributo `data-testid`:
```tsx
      <input
        type={type}
        data-testid={testId}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT}${mono ? ' font-mono text-sm' : ''}`}
      />
```

- [ ] **Step 2: Passar `testId` em cada campo do wizard**

Adicionar `testId="..."` às chamadas de `TextField` (o valor espelha o campo do payload):

- Step 2 (empresa): `company_name` e `tax_id`
```tsx
            <TextField
              label={dict.company.companyName}
              value={data.company_name}
              onChange={(v) => set('company_name', v)}
              error={errors.company_name}
              required
              testId="nc-company_name"
            />
            <TextField
              label={data.country === 'BR' ? 'CNPJ' : 'EIN'}
              value={data.tax_id}
              onChange={(v) => set('tax_id', v)}
              error={errors.tax_id}
              mono
              required
              testId="nc-tax_id"
            />
```
- Step 3 (responsável): adicionar `testId="nc-owner_name"`, `testId="nc-owner_email"`, `testId="nc-owner_phone"`, `testId="nc-owner_birthdate"` às 4 chamadas correspondentes.
- Step 4 (financeiro, bloco condicional): adicionar `testId="nc-fin_name"`, `testId="nc-fin_whatsapp"`, `testId="nc-fin_email"`.

- [ ] **Step 3: `data-testid` no `<select>` de regime (step 2, BR only)**

No `<select>` do regime (por volta da linha 307), adicionar o atributo:
```tsx
                  <select data-testid="nc-tax_regime" className={INPUT} value={data.tax_regime} onChange={(e) => set('tax_regime', e.target.value)}>
```

- [ ] **Step 4: Verificar typecheck + build sanity**

Run (de `services/web`):
```bash
npx tsc --noEmit
NODE_ENV=production npm run build
```
Expected: `tsc` limpo; build standalone conclui sem erro (lembrar do `NODE_ENV=production` — memória `build-nodeenv-production`).

- [ ] **Step 5: Review + commit**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add services/web/components/NewClientWizard.tsx
git commit -m "test(e2e): data-testid minimos nos campos do wizard (seletores estaveis)"
```

---

## Task 6: E2E do wizard /new-client/[lang]

**Files:**
- Create: `services/web/e2e/new-client.spec.ts`

Seletores: botões via `getByRole('button', { name })` com strings do dict; campos via `[data-testid="nc-..."]`. Fluxo: welcome (Começar/Start) → país (Brasil/Brazil clica e pula pra step 2) → empresa (Avançar/Next) → responsável (Avançar/Next) → financeiro (Enviar cadastro/Submit registration). Métodos de pagamento: BR `Cartão de crédito`+`Boleto / Pix`; US `Credit card`+`Bank transfer`.

- [ ] **Step 1: Escrever o spec completo**

`services/web/e2e/new-client.spec.ts`:
```ts
import { test, expect, type Page } from '@playwright/test';
import { mockNewClient } from './helpers/mock-api';

// Dictionary strings mirrored from lib/new-client-i18n.ts, keyed by lang, so the
// same flow can be asserted in both languages.
const T = {
  'pt-br': {
    start: 'Começar', next: 'Avançar', submit: 'Enviar cadastro',
    br: 'Brasil', us: 'Estados Unidos',
    isOther: 'Outra pessoa',
    pay: { card: 'Cartão de crédito', boleto: 'Boleto / Pix', bank: 'Transferência bancária' },
    thanks: 'Cadastro enviado! 🎉',
    errRequired: 'Campo obrigatório',
  },
  en: {
    start: 'Start', next: 'Next', submit: 'Submit registration',
    br: 'Brazil', us: 'United States',
    isOther: 'Someone else',
    pay: { card: 'Credit card', boleto: 'Boleto / Pix', bank: 'Bank transfer' },
    thanks: 'Registration submitted! 🎉',
    errRequired: 'Required field',
  },
} as const;

type Lang = keyof typeof T;

// Drives welcome→country→company→owner, leaving the flow parked on step 4 (finance).
async function fillToFinance(page: Page, lang: Lang, country: 'BR' | 'US') {
  const t = T[lang];
  await page.getByRole('button', { name: t.start }).click();
  await page.getByRole('button', { name: country === 'BR' ? t.br : t.us }).click();
  await page.fill('[data-testid="nc-company_name"]', 'Acme Ltda');
  await page.fill('[data-testid="nc-tax_id"]', '12345678000199');
  await page.getByRole('button', { name: t.next }).click();
  await page.fill('[data-testid="nc-owner_name"]', 'Ana Souza');
  await page.fill('[data-testid="nc-owner_email"]', 'ana@example.com');
  await page.fill('[data-testid="nc-owner_phone"]', '+55 67 99999-9999');
  await page.getByRole('button', { name: t.next }).click();
}

for (const lang of ['pt-br', 'en'] as Lang[]) {
  const t = T[lang];

  test(`[${lang}] happy-path BR: full flow reaches thank-you, body has ref_code`, async ({ page }) => {
    const captured = await mockNewClient(page, { status: 201, json: { ok: true, id: 'oc-1' } });
    await page.goto(`/new-client/${lang}?ref=vinicius-almeida-90f9`);

    await fillToFinance(page, lang, 'BR');
    await page.getByRole('button', { name: t.pay.boleto }).click();
    await page.getByRole('button', { name: t.submit }).click();

    await expect(page.getByText(t.thanks)).toBeVisible();
    expect(captured.body).toMatchObject({
      country: 'BR',
      company_name: 'Acme Ltda',
      owner_email: 'ana@example.com',
      payment_method: 'boleto_pix',
      lang,
      ref_code: 'vinicius-almeida-90f9',
    });
    expect(captured.body).toHaveProperty('tracking');
  });

  test(`[${lang}] per-step validation blocks advancing with empty company`, async ({ page }) => {
    await page.goto(`/new-client/${lang}`);
    await page.getByRole('button', { name: t.start }).click();
    await page.getByRole('button', { name: t.br }).click();
    // Company step is now visible; click Next with empty required fields.
    await page.getByRole('button', { name: t.next }).click();
    await expect(page.getByText(t.errRequired).first()).toBeVisible();
    // Still on the company step (tax id field visible), not advanced to owner.
    await expect(page.locator('[data-testid="nc-tax_id"]')).toBeVisible();
  });
}

test('BR shows regime + boleto/pix; US hides regime and offers bank transfer', async ({ page }) => {
  const t = T['pt-br'];
  // BR branch
  await page.goto('/new-client/pt-br');
  await page.getByRole('button', { name: t.start }).click();
  await page.getByRole('button', { name: t.br }).click();
  await expect(page.locator('[data-testid="nc-tax_regime"]')).toBeVisible();
  await page.fill('[data-testid="nc-company_name"]', 'Acme Ltda');
  await page.fill('[data-testid="nc-tax_id"]', '12345678000199');
  await page.getByRole('button', { name: t.next }).click();
  await page.fill('[data-testid="nc-owner_name"]', 'Ana');
  await page.fill('[data-testid="nc-owner_email"]', 'ana@example.com');
  await page.fill('[data-testid="nc-owner_phone"]', '+5567999999999');
  await page.getByRole('button', { name: t.next }).click();
  await expect(page.getByRole('button', { name: t.pay.boleto })).toBeVisible();
  await expect(page.getByRole('button', { name: t.pay.bank })).toHaveCount(0);

  // US branch
  await page.goto('/new-client/pt-br');
  await page.getByRole('button', { name: t.start }).click();
  await page.getByRole('button', { name: t.us }).click();
  await expect(page.locator('[data-testid="nc-tax_regime"]')).toHaveCount(0);
  await page.fill('[data-testid="nc-company_name"]', 'Acme Inc');
  await page.fill('[data-testid="nc-tax_id"]', '12-3456789');
  await page.getByRole('button', { name: t.next }).click();
  await page.fill('[data-testid="nc-owner_name"]', 'Ana');
  await page.fill('[data-testid="nc-owner_email"]', 'ana@example.com');
  await page.fill('[data-testid="nc-owner_phone"]', '+15551234567');
  await page.getByRole('button', { name: t.next }).click();
  await expect(page.getByRole('button', { name: t.pay.bank })).toBeVisible();
  await expect(page.getByRole('button', { name: t.pay.boleto })).toHaveCount(0);
});

test('fin_is_owner toggle reveals/hides finance contact fields', async ({ page }) => {
  const t = T['pt-br'];
  await page.goto('/new-client/pt-br');
  await fillToFinance(page, 'pt-br', 'BR');
  // Default: owner handles finance → finance-contact fields hidden.
  await expect(page.locator('[data-testid="nc-fin_name"]')).toHaveCount(0);
  await page.getByRole('button', { name: t.isOther }).click();
  await expect(page.locator('[data-testid="nc-fin_name"]')).toBeVisible();
  await expect(page.locator('[data-testid="nc-fin_email"]')).toBeVisible();
});

test('routing: /new-client redirects to pt-br; /new-client/fr is 404', async ({ page }) => {
  await page.goto('/new-client');
  await expect(page).toHaveURL(/\/new-client\/pt-br$/);

  const resp = await page.goto('/new-client/fr');
  expect(resp?.status()).toBe(404);
});
```

- [ ] **Step 2: Rodar e verificar**

Run:
```bash
npx playwright test e2e/new-client.spec.ts
```
Expected: 7 passed (2 happy-path + 2 validation, um por lang; + condicionais + toggle + routing). Ajustar seletores contra o DOM real se algo falhar (`--debug`).

- [ ] **Step 3: Review + commit**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add services/web/e2e/new-client.spec.ts
git commit -m "test(e2e): cobertura do wizard /new-client (fluxo, validacao, condicionais BR/US, i18n, ?ref, roteamento)"
```

---

## Task 7: Contract-guard (Vitest, sem rede)

**Files:**
- Create: `services/web/lib/painel-contract.ts`
- Create: `services/web/lib/api-contract.test.ts`

- [ ] **Step 1: Escrever o schema versionado + validador**

`services/web/lib/painel-contract.ts`:
```ts
// Checked-in mirror of what the Painel's public endpoints accept (Pydantic
// extra='forbid'). NOT a live contract — update this when the /public/* contract
// changes. Guards against frontend-side payload drift (renamed/removed/extra field).

export type EndpointContract = {
  /** Fields that must always be present in the serialized body. */
  required: readonly string[];
  /** Fields that may be present. */
  optional: readonly string[];
};

// `tracking` is attached by every builder and is always allowed on top of these.
export const CONTRACTS = {
  leads: {
    required: ['name', 'email', 'message'],
    optional: ['whatsapp'],
  },
  affiliate: {
    required: ['name', 'email', 'whatsapp'],
    optional: [],
  },
  newClient: {
    required: [
      'country', 'company_name', 'tax_id', 'owner_name', 'owner_email',
      'owner_phone', 'fin_is_owner', 'payment_method', 'lang',
    ],
    optional: [
      'tax_regime', 'address_full', 'street', 'complement', 'city', 'state',
      'zip', 'owner_birthdate', 'fin_name', 'fin_whatsapp', 'fin_email', 'ref_code',
    ],
  },
} satisfies Record<string, EndpointContract>;

/** Returns a list of contract problems (empty = payload conforms). */
export function contractProblems(body: Record<string, unknown>, c: EndpointContract): string[] {
  const problems: string[] = [];
  const allowed = new Set<string>([...c.required, ...c.optional, 'tracking']);
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) problems.push(`unexpected field: ${key}`);
  }
  for (const key of c.required) {
    if (!(key in body)) problems.push(`missing required field: ${key}`);
  }
  return problems;
}
```

- [ ] **Step 2: Escrever o contract-guard test**

`services/web/lib/api-contract.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { submitLead, submitAffiliate, submitNewClient, type NewClientPayload } from './api';
import { CONTRACTS, contractProblems } from './painel-contract';

function okResponse(body: unknown = {}) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  fetchMock = vi.fn().mockResolvedValue(okResponse());
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Runs a builder, returns the JSON body it POSTed. */
async function bodyOf(call: () => Promise<unknown>): Promise<Record<string, unknown>> {
  await call();
  const [, opts] = fetchMock.mock.calls[0];
  return JSON.parse((opts as RequestInit).body as string) as Record<string, unknown>;
}

describe('payload contract guard', () => {
  it('submitLead conforms to the leads contract', async () => {
    const body = await bodyOf(() =>
      submitLead({ name: 'Ana', email: 'ana@x.com', whatsapp: '+5567999999999', message: 'ola tudo bem' }),
    );
    expect(contractProblems(body, CONTRACTS.leads)).toEqual([]);
  });

  it('submitAffiliate conforms to the affiliate contract', async () => {
    const body = await bodyOf(() =>
      submitAffiliate({ name: 'Ana', email: 'ana@x.com', whatsapp: '+5567999999999' }),
    );
    expect(contractProblems(body, CONTRACTS.affiliate)).toEqual([]);
  });

  it('submitNewClient conforms with a full payload (all optionals filled)', async () => {
    const full: NewClientPayload = {
      country: 'BR',
      company_name: 'Acme Ltda',
      tax_id: '12345678000199',
      tax_regime: 'Simples Nacional',
      address_full: 'Rua X, 1',
      street: 'Rua X',
      complement: 'Sala 1',
      city: 'Campo Grande',
      state: 'MS',
      zip: '79000000',
      owner_name: 'Ana Souza',
      owner_email: 'ana@x.com',
      owner_phone: '+5567999999999',
      owner_birthdate: '1990-05-20',
      fin_is_owner: false,
      fin_name: 'Bruno',
      fin_whatsapp: '+5567988888888',
      fin_email: 'bruno@x.com',
      payment_method: 'boleto_pix',
      lang: 'pt-br',
      ref_code: 'vinicius-almeida-90f9',
    };
    const body = await bodyOf(() => submitNewClient(full));
    expect(contractProblems(body, CONTRACTS.newClient)).toEqual([]);
  });

  it('submitNewClient conforms with a minimal payload (owner is finance)', async () => {
    const minimal: NewClientPayload = {
      country: 'US',
      company_name: 'Acme Inc',
      tax_id: '12-3456789',
      owner_name: 'Ana',
      owner_email: 'ana@x.com',
      owner_phone: '+15551234567',
      fin_is_owner: true,
      payment_method: 'credit_card',
      lang: 'en',
    };
    const body = await bodyOf(() => submitNewClient(minimal));
    expect(contractProblems(body, CONTRACTS.newClient)).toEqual([]);
  });
});
```

- [ ] **Step 3: Rodar e verificar verde**

Run (de `services/web`):
```bash
npm run test
```
Expected: todos os testes verdes, incluindo o novo `lib/api-contract.test.ts` (4 casos). Se `contractProblems` retornar algo não-vazio, é sinal de **drift real** entre o builder e o contrato — investigar o builder ou atualizar `painel-contract.ts` se o contrato do Painel mudou de propósito.

- [ ] **Step 4: Review + commit**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add services/web/lib/painel-contract.ts services/web/lib/api-contract.test.ts
git commit -m "test(contract): guard Vitest do payload dos builders contra schema versionado do Painel"
```

---

## Task 8: Rodada final verde + tracking

**Files:**
- Modify: `docs/PLANO.md`
- Modify: `HANDOFF.md` (opcional, no checkpoint)

- [ ] **Step 1: Rodar as duas suítes juntas (evidência pro [5-T])**

Run (de `services/web`):
```bash
npm run test          # Vitest: unit + contract-guard
npm run test:e2e      # Playwright: contact + affiliate + new-client
```
Expected: Vitest todo verde (16 anteriores + 4 do contract-guard); Playwright todo verde (5 + 5 + 7 = 17 specs), **zero** chamada real ao Painel. Colar o resumo dos dois runs como evidência.

- [ ] **Step 2: Mover o item pra [5-T] no PLANO**

Em `docs/PLANO.md`, na Frente "v0.2 — Qualidade", trocar a linha:
```
- `[0]` Playwright (E2E) — fluxo dos 2 forms + navegação. **Cuidado:** ...
```
por:
```
- `[5-T]` Playwright (E2E) — 3 forms via route interception (17 specs) + contract-guard Vitest (4 casos). Rede mockada, zero chamada real ao Painel. Runner via `next dev`. Spec `docs/superpowers/specs/2026-07-14-playwright-e2e-design.md`. Verificado local (suítes verdes 2026-07-14).
```
E adicionar uma entrada no Histórico do plano com a data.

- [ ] **Step 3: Review + commit final**

```bash
pwsh -NoProfile -ExecutionPolicy Bypass -File "${env:PERCUS_CANON_DIR}/scripts/percus-review-auto.ps1"
cd "D:/Claud Automations/huboperacional-site"
git add docs/PLANO.md
git commit -m "docs(tracking): Playwright E2E + contract-guard [5-T] (16 specs + 4 casos, verde local)"
```

---

## Notas de execução

- **Ordem:** Task 5 (data-testid) **antes** da Task 6 (specs do wizard) — os specs dependem dos testids.
- **Se um seletor falhar:** usar `npx playwright test <spec> --debug` ou `--ui` pra inspecionar o DOM real; ajustar o seletor no spec (não afrouxar a asserção).
- **Não** criar workflow de CI nesta rodada (não-objetivo declarado na spec).
- **Não** rodar submit real contra o Painel em nenhum ponto — se `captured.count` de um endpoint não-mockado for >0 num teste, é bug do teste.
- **Deploy:** não faz parte deste plano (cadência R24 é por marco). A suíte é local/on-demand.
