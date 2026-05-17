'use client';

import { useState } from 'react';
import { submitAffiliate } from '@/lib/api';

export function AffiliateForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [refCode, setRefCode] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setError('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim().toLowerCase(),
      whatsapp: String(fd.get('whatsapp') || '').trim(),
    };

    const result = await submitAffiliate(payload);
    if (result.ok) {
      setRefCode(result.data.ref_code);
      setStatus(result.data.status);
      setState('success');
      form.reset();
    } else {
      setState('error');
      setError(result.error);
    }
  }

  if (state === 'success') {
    const alreadyRegistered = status === 'already_registered';
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <h3 className="font-semibold text-emerald-700 mb-2">
          {alreadyRegistered ? 'Você já é parceiro!' : 'Cadastro confirmado!'}
        </h3>
        <p className="text-sm text-emerald-700/80 mb-3">
          {alreadyRegistered
            ? 'Seu cadastro de parceiro está ativo. Use seu código abaixo:'
            : 'Enviamos 4 mensagens no WhatsApp com seu código de parceiro, link do portal e seus primeiros links de indicação.'}
        </p>
        <div className="bg-white border border-emerald-300 rounded-lg px-4 py-3 font-mono text-sm">
          <span className="text-steel-500">Seu código: </span>
          <span className="font-bold text-emerald-700">{refCode}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="af-name">Nome completo *</label>
        <input
          id="af-name" name="name" type="text" required minLength={2} maxLength={200}
          className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="af-email">Email *</label>
          <input
            id="af-email" name="email" type="email" required maxLength={254}
            className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="af-wa">WhatsApp *</label>
          <input
            id="af-wa" name="whatsapp" type="tel" required placeholder="+55 67 99999-9999" minLength={10} maxLength={20}
            className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors font-mono text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-steel-500">
        Ao cadastrar, você concorda em receber 4 mensagens iniciais no WhatsApp com seu código e links de indicação.
      </p>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 disabled:bg-steel-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
      >
        {state === 'loading' ? 'Cadastrando...' : 'Quero ser parceiro'}
      </button>
    </form>
  );
}
