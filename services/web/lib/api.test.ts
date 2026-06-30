import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { submitLead, submitAffiliate } from './api';

function mockResponse(opts: { ok: boolean; status: number; body?: unknown }) {
  return {
    ok: opts.ok,
    status: opts.status,
    json: async () => opts.body ?? {},
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('submitLead', () => {
  const payload = { name: 'Ana', email: 'ana@x.com', message: 'ola tudo bem' };

  it('returns ok + data and posts to /public/leads with tracking', async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200, body: { lead_id: '42' } }));

    const result = await submitLead(payload);

    expect(result).toEqual({ ok: true, data: { lead_id: '42' } });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/public\/leads$/);
    const sent = JSON.parse((opts as RequestInit).body as string);
    expect(sent.name).toBe('Ana');
    expect(sent).toHaveProperty('tracking');
  });

  it('maps 429 to a rate-limit message', async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 429 }));

    const result = await submitLead(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(429);
      expect(result.error).toMatch(/Muitas requisicoes/i);
    }
  });

  it('surfaces the API detail message on non-ok responses', async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 400, body: { detail: 'Email invalido' } }));

    const result = await submitLead(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Email invalido');
  });

  it('maps a network failure to a connection message', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));

    const result = await submitLead(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/conexao/i);
  });

  it('maps an AbortError to a timeout message', async () => {
    fetchMock.mockRejectedValue(new DOMException('aborted', 'AbortError'));

    const result = await submitLead(payload);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Tempo de resposta esgotado/i);
  });
});

describe('submitAffiliate', () => {
  it('posts to /public/affiliate-signup', async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200, body: { ref_code: 'abc', status: 'created' } }));

    const result = await submitAffiliate({ name: 'Ana', email: 'ana@x.com', whatsapp: '+5567999999999' });

    expect(result.ok).toBe(true);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/public\/affiliate-signup$/);
  });
});
