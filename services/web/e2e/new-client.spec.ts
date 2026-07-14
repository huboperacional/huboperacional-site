import { test, expect, type Page } from '@playwright/test';
import { mockNewClient } from './helpers/mock-api';

// Serialize this file's tests. Several tests hit the same not-yet-compiled
// `/new-client/[lang]` route; under `next dev` + full worker parallelism,
// concurrent first requests for the same route can race the on-demand
// compiler and trigger a client-side Fast-Refresh full reload mid-test,
// silently swallowing a click. Serial execution avoids the race without
// touching the shared webServer/parallelism config.
test.describe.configure({ mode: 'serial' });

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

// Next.js dev overlay injects a floating "Open Next.js Dev Tools" button whose
// accessible name contains "Next" — a substring match on the English t.next
// ("Next") hits it too, causing a strict-mode violation. Scoping interactions
// to <main> (the app's content landmark, see app/layout.tsx) excludes the
// overlay, which portals outside it.
function wizard(page: Page) {
  return page.locator('main');
}

// Drives welcome→country→company→owner, leaving the flow parked on step 4 (finance).
async function fillToFinance(page: Page, lang: Lang, country: 'BR' | 'US') {
  const t = T[lang];
  const w = wizard(page);
  await w.getByRole('button', { name: t.start }).click();
  await w.getByRole('button', { name: country === 'BR' ? t.br : t.us }).click();
  await page.fill('[data-testid="nc-company_name"]', 'Acme Ltda');
  await page.fill('[data-testid="nc-tax_id"]', '12345678000199');
  await w.getByRole('button', { name: t.next }).click();
  await page.fill('[data-testid="nc-owner_name"]', 'Ana Souza');
  await page.fill('[data-testid="nc-owner_email"]', 'ana@example.com');
  await page.fill('[data-testid="nc-owner_phone"]', '+55 67 99999-9999');
  await w.getByRole('button', { name: t.next }).click();
}

for (const lang of ['pt-br', 'en'] as Lang[]) {
  const t = T[lang];

  test(`[${lang}] happy-path BR: full flow reaches thank-you, body has ref_code`, async ({ page }) => {
    const captured = await mockNewClient(page, { status: 201, json: { ok: true, id: 'oc-1' } });
    await page.goto(`/new-client/${lang}?ref=vinicius-almeida-90f9`);

    await fillToFinance(page, lang, 'BR');
    await wizard(page).getByRole('button', { name: t.pay.boleto }).click();
    await wizard(page).getByRole('button', { name: t.submit }).click();

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
    const w = wizard(page);
    await w.getByRole('button', { name: t.start }).click();
    await w.getByRole('button', { name: t.br }).click();
    // Company step is now visible; click Next with empty required fields.
    await w.getByRole('button', { name: t.next }).click();
    await expect(page.getByText(t.errRequired).first()).toBeVisible();
    // Still on the company step (tax id field visible), not advanced to owner.
    await expect(page.locator('[data-testid="nc-tax_id"]')).toBeVisible();
  });
}

test('BR shows regime + boleto/pix; US hides regime and offers bank transfer', async ({ page }) => {
  const t = T['pt-br'];
  // BR branch
  await page.goto('/new-client/pt-br');
  const w1 = wizard(page);
  await w1.getByRole('button', { name: t.start }).click();
  await w1.getByRole('button', { name: t.br }).click();
  await expect(page.locator('[data-testid="nc-tax_regime"]')).toBeVisible();
  await page.fill('[data-testid="nc-company_name"]', 'Acme Ltda');
  await page.fill('[data-testid="nc-tax_id"]', '12345678000199');
  await w1.getByRole('button', { name: t.next }).click();
  await page.fill('[data-testid="nc-owner_name"]', 'Ana');
  await page.fill('[data-testid="nc-owner_email"]', 'ana@example.com');
  await page.fill('[data-testid="nc-owner_phone"]', '+5567999999999');
  await w1.getByRole('button', { name: t.next }).click();
  await expect(w1.getByRole('button', { name: t.pay.boleto })).toBeVisible();
  await expect(w1.getByRole('button', { name: t.pay.bank })).toHaveCount(0);

  // US branch
  await page.goto('/new-client/pt-br');
  const w2 = wizard(page);
  await w2.getByRole('button', { name: t.start }).click();
  await w2.getByRole('button', { name: t.us }).click();
  await expect(page.locator('[data-testid="nc-tax_regime"]')).toHaveCount(0);
  await page.fill('[data-testid="nc-company_name"]', 'Acme Inc');
  await page.fill('[data-testid="nc-tax_id"]', '12-3456789');
  await w2.getByRole('button', { name: t.next }).click();
  await page.fill('[data-testid="nc-owner_name"]', 'Ana');
  await page.fill('[data-testid="nc-owner_email"]', 'ana@example.com');
  await page.fill('[data-testid="nc-owner_phone"]', '+15551234567');
  await w2.getByRole('button', { name: t.next }).click();
  await expect(w2.getByRole('button', { name: t.pay.bank })).toBeVisible();
  await expect(w2.getByRole('button', { name: t.pay.boleto })).toHaveCount(0);
});

test('fin_is_owner toggle reveals/hides finance contact fields', async ({ page }) => {
  const t = T['pt-br'];
  await page.goto('/new-client/pt-br');
  await fillToFinance(page, 'pt-br', 'BR');
  // Default: owner handles finance → finance-contact fields hidden.
  await expect(page.locator('[data-testid="nc-fin_name"]')).toHaveCount(0);
  await wizard(page).getByRole('button', { name: t.isOther }).click();
  await expect(page.locator('[data-testid="nc-fin_name"]')).toBeVisible();
  await expect(page.locator('[data-testid="nc-fin_email"]')).toBeVisible();
});

test('routing: /new-client redirects to pt-br; /new-client/fr is 404', async ({ page }) => {
  await page.goto('/new-client');
  await expect(page).toHaveURL(/\/new-client\/pt-br$/);

  const resp = await page.goto('/new-client/fr');
  expect(resp?.status()).toBe(404);
});
