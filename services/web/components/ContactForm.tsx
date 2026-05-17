'use client';

import { useState } from 'react';
import { submitLead } from '@/lib/api';

export function ContactForm({ defaultMessage }: { defaultMessage?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setError('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim().toLowerCase(),
      whatsapp: String(fd.get('whatsapp') || '').trim() || undefined,
      message: String(fd.get('message') || '').trim(),
    };

    const result = await submitLead(payload);
    if (result.ok) {
      setState('success');
      form.reset();
    } else {
      setState('error');
      setError(result.error);
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <h3 className="font-semibold text-emerald-700 mb-1">Mensagem enviada!</h3>
        <p className="text-sm text-emerald-700/80">
          Recebemos seu contato e respondemos em até 24h via email ou WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="ct-name">Nome *</label>
        <input
          id="ct-name" name="name" type="text" required minLength={2} maxLength={200}
          className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="ct-email">Email *</label>
          <input
            id="ct-email" name="email" type="email" required maxLength={254}
            className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="ct-wa">WhatsApp <span className="text-steel-500 font-normal">(opcional)</span></label>
          <input
            id="ct-wa" name="whatsapp" type="tel" placeholder="+55 67 99999-9999" maxLength={20}
            className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors font-mono text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="ct-msg">Como podemos ajudar? *</label>
        <textarea
          id="ct-msg" name="message" required minLength={10} maxLength={2000} rows={5}
          defaultValue={defaultMessage}
          className="w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>
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
        {state === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
      </button>
    </form>
  );
}
