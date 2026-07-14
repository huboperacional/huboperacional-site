import type { Page, Route } from '@playwright/test';

// A single place that knows the three public endpoint globs and how to fake them.
// Each mock captures the request body so specs can assert on the serialized payload
// (e.g. that `tracking` / `ref_code` made it into the POST) without any real call.

export type MockResponse = {
  status?: number;      // fulfilled HTTP status (ignored when abort=true)
  json?: object;        // fulfilled JSON body
  abort?: boolean;      // simulate a network failure instead of responding
};

export type Captured = {
  /** Parsed JSON body of the most recent intercepted request, or null. */
  body: Record<string, unknown> | null;
  /** How many times the endpoint was hit. */
  count: number;
};

async function installMock(page: Page, urlGlob: string, resp: MockResponse): Promise<Captured> {
  const captured: Captured = { body: null, count: 0 };
  await page.route(urlGlob, async (route: Route) => {
    captured.count += 1;
    const raw = route.request().postData();
    captured.body = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    if (resp.abort) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({
      status: resp.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(resp.json ?? {}),
    });
  });
  return captured;
}

export const mockLeads = (page: Page, resp: MockResponse) => installMock(page, '**/public/leads', resp);
export const mockAffiliate = (page: Page, resp: MockResponse) => installMock(page, '**/public/affiliate-signup', resp);
export const mockNewClient = (page: Page, resp: MockResponse) => installMock(page, '**/public/new-client', resp);
