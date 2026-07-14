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
    // Note: the page header also mentions "4 mensagens" (before submit), so the
    // exact success-panel phrase is used here to avoid a strict-mode ambiguity.
    await expect(page.getByText('Enviamos 4 mensagens no WhatsApp')).toBeVisible();
    expect(captured.body).toMatchObject({ name: 'Ana Souza', email: 'ana@example.com', whatsapp: '+55 67 99999-9999' });
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

    // The empty required WhatsApp field must be :invalid — proves validation is engaged.
    await expect(page.locator('#af-wa:invalid')).toBeVisible();

    await expect(page.getByText('Cadastro confirmado!')).toHaveCount(0);
    expect(captured.count).toBe(0);
  });
});
