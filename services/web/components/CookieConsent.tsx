'use client';

import { useEffect, useState } from 'react';
import { Analytics } from './Analytics';
import { MetaPixel } from './MetaPixel';

const CONSENT_KEY = 'hub_consent';
// Public tracking ids, inlined at build. Both absent (dev/preview) → no banner, no tags.
// GA4 = analytics; Meta Pixel = marketing. A single "Aceitar" grants whatever is configured.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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

  // Nothing to consent to without at least one configured tracking id.
  if (!GA_ID && !PIXEL_ID) return null;
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
      {consent === 'granted' && GA_ID && <Analytics gaId={GA_ID} />}
      {consent === 'granted' && PIXEL_ID && <MetaPixel pixelId={PIXEL_ID} />}
      {consent === null && (
        <Banner
          hasAnalytics={!!GA_ID}
          hasMarketing={!!PIXEL_ID}
          onAccept={() => choose('granted')}
          onReject={() => choose('denied')}
        />
      )}
    </>
  );
}

function Banner({
  hasAnalytics,
  hasMarketing,
  onAccept,
  onReject,
}: {
  hasAnalytics: boolean;
  hasMarketing: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  // Copy adapts to what is actually configured at build, so the banner never claims a
  // tracker that will not load (LGPD honesty). GA-only branch is kept identical to the
  // pre-Pixel wording so existing behaviour/tests are unchanged when no Pixel id is set.
  const strong =
    hasAnalytics && hasMarketing
      ? 'Cookies de análise e marketing.'
      : hasMarketing
        ? 'Cookies de marketing.'
        : 'Cookies de análise.';
  const body =
    hasAnalytics && hasMarketing
      ? 'Usamos o Google Analytics (análise) e o Meta Pixel (marketing) pra medir e melhorar o site.'
      : hasMarketing
        ? 'Usamos o Meta Pixel (marketing) pra medir campanhas e melhorar o site.'
        : 'Usamos o Google Analytics pra entender como o site é usado e melhorá-lo. Só analytics — nada de anúncios.';
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
            <strong className="text-fg font-semibold">{strong}</strong> {body}
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
