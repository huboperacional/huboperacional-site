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
