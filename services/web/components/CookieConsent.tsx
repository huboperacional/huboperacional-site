'use client';

import { useEffect, useState } from 'react';
import { Analytics } from './Analytics';

const CONSENT_KEY = 'hub_consent';
// Public GA4 Measurement ID, inlined at build. Absent (dev/preview) → no banner, no GA.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Consent = 'granted' | 'denied' | null;

function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
    // Footer "Cookies" link lets the user withdraw/change consent (LGPD).
    const reopen = () => {
      try {
        window.localStorage.removeItem(CONSENT_KEY);
      } catch {
        /* noop */
      }
      setConsent(null);
    };
    window.addEventListener('hub:open-consent', reopen);
    return () => window.removeEventListener('hub:open-consent', reopen);
  }, []);

  // Nothing to consent to without a configured GA id.
  if (!GA_ID) return null;
  // Avoid an SSR/first-paint flash and hydration mismatch: render nothing until
  // the client has read the stored choice.
  if (!ready) return null;

  function choose(value: 'granted' | 'denied') {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* noop */
    }
    setConsent(value);
  }

  return (
    <>
      {consent === 'granted' && <Analytics gaId={GA_ID} />}
      {consent === null && (
        <Banner onAccept={() => choose('granted')} onReject={() => choose('denied')} />
      )}
    </>
  );
}

function Banner({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  return (
    <div
      role="region"
      aria-label="Consentimento de cookies"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-5xl bg-white border border-paper-3 rounded-xl shadow-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
    >
      <div className="flex gap-3 items-start flex-1">
        <span aria-hidden className="text-2xl leading-none mt-0.5">🍪</span>
        <div>
          <p className="text-sm text-steel-700">
            <strong className="text-fg font-semibold">Cookies de análise.</strong> Usamos o Google
            Analytics pra entender como o site é usado e melhorá-lo. Só analytics — nada de anúncios.
          </p>
          <p className="text-xs text-steel-500 mt-1">
            Sua escolha fica salva neste navegador. Você pode mudar depois em “Cookies”, no rodapé.
          </p>
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        <button
          type="button"
          onClick={onReject}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg border border-paper-3 text-brand-500 hover:border-brand-500 hover:bg-brand-50 transition-colors"
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
