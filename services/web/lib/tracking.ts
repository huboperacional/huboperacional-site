// Tracking 15 campos canonicos paid media (R2 canon Percus).
// Captura no first page-view, persiste em localStorage 90 dias, anexa em forms.

export type Attribution = {
  // 6 Click IDs
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  msclkid?: string;
  ttclid?: string;
  // 2 Meta Pixel cookies
  fbp?: string;
  fbc?: string;
  // 5 UTMs
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  // 2 Page context
  referrer?: string;
  landing_url?: string;
};

const STORAGE_KEY = 'percus_attribution';
const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

const PARAM_FIELDS: (keyof Attribution)[] = [
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
];

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\\/+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function captureOnFirstVisit(): void {
  if (typeof window === 'undefined') return;

  try {
    // Verifica se ja tem captura valida
    const existing = getAttribution();
    if (existing) return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    const data: Attribution & { captured_at: number } = {
      captured_at: Date.now(),
      referrer: document.referrer || undefined,
      landing_url: window.location.href,
    };

    for (const field of PARAM_FIELDS) {
      const value = params.get(field);
      if (value) data[field] = value;
    }

    // Meta Pixel cookies
    const fbp = readCookie('_fbp');
    if (fbp) data.fbp = fbp;
    const fbc = readCookie('_fbc');
    if (fbc) data.fbc = fbc;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponivel (private browsing, etc) — silenciosa
  }
}

export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Attribution & { captured_at: number };
    if (!data.captured_at || Date.now() - data.captured_at > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const { captured_at, ...attribution } = data;
    return attribution;
  } catch {
    return null;
  }
}
