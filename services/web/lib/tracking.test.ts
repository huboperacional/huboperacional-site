import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureOnFirstVisit, getAttribution } from './tracking';

const STORAGE_KEY = 'percus_attribution';

function setLocation(href: string) {
  Object.defineProperty(window, 'location', {
    writable: true,
    configurable: true,
    value: { href },
  });
}

function setReferrer(value: string) {
  Object.defineProperty(document, 'referrer', { configurable: true, value });
}

function clearCookies() {
  for (const name of ['_fbp', '_fbc']) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

beforeEach(() => {
  window.localStorage.clear();
  clearCookies();
  setReferrer('');
  setLocation('https://huboperacional.com.br/');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('captureOnFirstVisit / getAttribution', () => {
  it('captures UTM and click-id params from the URL', () => {
    setLocation('https://huboperacional.com.br/?utm_source=fb&gclid=123&utm_campaign=x');
    captureOnFirstVisit();

    const attr = getAttribution();
    expect(attr).not.toBeNull();
    expect(attr!.utm_source).toBe('fb');
    expect(attr!.gclid).toBe('123');
    expect(attr!.utm_campaign).toBe('x');
    expect(attr!.landing_url).toBe('https://huboperacional.com.br/?utm_source=fb&gclid=123&utm_campaign=x');
    // captured_at must be stripped from the public shape
    expect((attr as Record<string, unknown>).captured_at).toBeUndefined();
  });

  it('captures the _fbp / _fbc Meta cookies', () => {
    document.cookie = '_fbp=abc';
    document.cookie = '_fbc=def';
    setLocation('https://huboperacional.com.br/');
    captureOnFirstVisit();

    const attr = getAttribution();
    expect(attr!.fbp).toBe('abc');
    expect(attr!.fbc).toBe('def');
  });

  it('returns null and clears storage after the 90-day TTL', () => {
    const t0 = new Date('2026-01-01T00:00:00Z').getTime();
    vi.useFakeTimers();
    vi.setSystemTime(t0);

    setLocation('https://huboperacional.com.br/?utm_source=fb');
    captureOnFirstVisit();
    expect(getAttribution()).not.toBeNull();

    // 91 days later → expired
    vi.setSystemTime(t0 + 91 * 24 * 60 * 60 * 1000);
    expect(getAttribution()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('is idempotent: a valid capture is not overwritten', () => {
    setLocation('https://huboperacional.com.br/?utm_source=fb');
    captureOnFirstVisit();

    setLocation('https://huboperacional.com.br/?utm_source=google');
    captureOnFirstVisit();

    expect(getAttribution()!.utm_source).toBe('fb');
  });

  it('captures only page context when there are no params', () => {
    setLocation('https://huboperacional.com.br/');
    captureOnFirstVisit();

    const attr = getAttribution()!;
    expect(attr.landing_url).toBe('https://huboperacional.com.br/');
    expect(attr.utm_source).toBeUndefined();
    expect(attr.gclid).toBeUndefined();
  });
});
