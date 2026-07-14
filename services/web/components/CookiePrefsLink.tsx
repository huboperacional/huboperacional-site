'use client';

// Footer link that re-opens the cookie consent banner so the user can change or
// withdraw their choice (LGPD). CookieConsent listens for this event.
export function CookiePrefsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('hub:open-consent'))}
      className="hover:text-brand-500"
    >
      Cookies
    </button>
  );
}
