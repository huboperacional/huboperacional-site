'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// GA4 loader + SPA page_view tracking. Only mounted after consent is granted
// (see CookieConsent). The initial page_view is sent reliably by gtag('config')
// itself; the effect below skips that first render and fires a page_view only on
// subsequent client-side (App Router) navigations — so each route is counted once,
// with no double-count and no dependency on effect-vs-script timing for the landing hit.
export function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.('event', 'page_view', { page_path: pathname });
  }, [pathname]);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
