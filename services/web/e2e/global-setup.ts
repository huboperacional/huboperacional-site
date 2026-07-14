import { request } from '@playwright/test';

// Warm `next dev`'s on-demand compiler BEFORE the parallel tests run. Without this,
// multiple workers race the first compile of the same/different routes on a cold
// dev server and some navigations exceed the test timeout. The webServer.url gate
// already ensures `/` is up by the time this runs; we sequentially hit the rest so
// each route compiles with the CPU to itself, then the parallel tests find them warm.
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const ROUTES = [
  '/',
  '/contato',
  '/afiliados',
  '/produtos',
  '/produtos/familia-milionaria',
  '/new-client',
  '/new-client/pt-br',
  '/sobre',
];

export default async function globalSetup() {
  const ctx = await request.newContext({ baseURL: BASE_URL });
  for (const route of ROUTES) {
    try {
      await ctx.get(route, { timeout: 90_000 });
    } catch {
      // A warmup miss isn't fatal — the test that needs the route will still compile it.
    }
  }
  await ctx.dispose();
}
