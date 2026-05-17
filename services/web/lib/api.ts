// Client pros 2 endpoints publicos do Painel (Eixo D Sessao 1).

import { getAttribution } from './tracking';

const PAINEL_URL = process.env.NEXT_PUBLIC_PAINEL_URL || 'https://api.ads4pros.com';

export type LeadPayload = {
  name: string;
  email: string;
  whatsapp?: string;
  message: string;
};

export type AffiliatePayload = {
  name: string;
  email: string;
  whatsapp: string;
};

export type ApiResult<T = Record<string, unknown>> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

async function postJson<T>(path: string, body: object): Promise<ApiResult<T>> {
  try {
    const resp = await fetch(`${PAINEL_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      return { ok: false, error: 'Muitas requisicoes. Aguarde alguns minutos e tente novamente.', status: 429 };
    }
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const detail = (data as { detail?: unknown }).detail;
      const msg = typeof detail === 'string' ? detail : 'Erro ao processar requisicao.';
      return { ok: false, error: msg, status: resp.status };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    return { ok: false, error: 'Erro de conexao. Verifique sua internet.' };
  }
}

export async function submitLead(payload: LeadPayload): Promise<ApiResult<{ lead_id: string }>> {
  const tracking = getAttribution() ?? {};
  return postJson('/public/leads', { ...payload, tracking });
}

export async function submitAffiliate(payload: AffiliatePayload): Promise<ApiResult<{ ref_code: string; status: string }>> {
  const tracking = getAttribution() ?? {};
  return postJson('/public/affiliate-signup', { ...payload, tracking });
}
