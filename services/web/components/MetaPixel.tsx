'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Meta (Facebook) Pixel loader + SPA PageView tracking. Only mounted after consent
// is granted (see CookieConsent). Mirrors Analytics.tsx: the initial PageView is sent
// by the init snippet itself; the effect below skips that first render and fires a
// PageView only on subsequent client-side (App Router) navigations — so each route is
// counted once, with no double-count on the landing hit.
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    w.fbq?.('track', 'PageView');
  }, [pathname]);

  return (
    <Script id="meta-pixel-init" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(pixelId)});
fbq('track', 'PageView');`}
    </Script>
  );
}
