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

    // The empty required field must be in :invalid state — proves HTML5 validation is
    // actually engaged (this fails loudly if the `required` attribute is ever removed).
    await expect(page.locator('#ct-name:invalid')).toBeVisible();

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
