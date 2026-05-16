---
spec: huboperacional-site MVP v0.1
data: 2026-05-16
fase: Fase 6 / Eixo D do plano mestre
status: approved (brainstorming + design section approval + pre-mortem 3/3 + mitigations aceitas)
escopo: MVP completo split em 2 sessoes (Sessao 1 backend, Sessao 2 frontend+deploy)
---

## Atualizacao pos pre-mortem 3-membros (2026-05-16)

Pre-mortem do conselho 3-membros (DS + Llama + CC) identificou 9 riscos. Veredito CC GO com 4 mitigations obrigatorias, **TODAS aceitas pelo operador**:

| # | Mitigation | Aplicada em |
|---|---|---|
| (a) | CORS allowlist estrita no Painel (so `huboperacional.com.br`) | Sessao 1 backend (server.py) |
| (b) | `Pydantic(extra='forbid')` nos 2 endpoints + sub-modelos | Sessao 1 backend |
| (c) | Validar middleware rate-limit IPv6 /64 ANTES de codar frontend | Sessao 1 backend (verificar primeiro) |
| (d) | Split em 2 sessoes | Sessao 1 = backend + smoke, Sessao 2 = frontend + deploy VPS |

Riscos adicionais identificados pelo CC + mitigations:
- **PII leak em lp_leads**: GET admin endpoint que lista leads PRECISA exigir `X-Admin-Key`. Cobrir em smoke.
- **Enumeration via /affiliates/public-signup**: retornar sempre `{ok: true, ref_code: "abc..."}` mesmo em email duplicado (idempotent-like), NAO retornar erro especifico que revele email cadastrado.
- **1000 signups falsos -> ban Evolution**: rate limit 3 req/hora por IPv6 /64 + ip address mantido em DB pra audit.
- **SSRF via referrer/landing_url**: tracking processado SO em insert no DB, NUNCA usado em fetch/curl/redirect server-side.

Risco que NAO foi mitigado pelo MVP:
- **Conteudo MDX placeholder** (DS+Llama+CC) — aceito como limitacao MVP. Sprint 2 do D inclui curadoria definitiva do operador.

Logs pre-mortem completos:
- `Painel/.deepseek/council-log/<ts>-pre-mortem.jsonl` (DS+Llama)
- `D:/tmp/council-cc-d.txt` (CC)



# huboperacional-site MVP v0.1 — Design Spec

## Contexto

Eixo D do plano mestre Percus Fase 6 (`D:\Claud Automations\.claude-home\plans\criei-a-pasta-d-claud-warm-patterson.md`). Site vitrine publica da softwarehouse Percus + porta de entrada pro programa de afiliados. Greenfield em `D:\Claud Automations\huboperacional-site\`.

DNS + Traefik ja roteiam `huboperacional.com.br` pro VPS `161.97.129.138` (smoke 404 esperado, sem service registrado). Subdominios `painel.`, `auth.`, `traefik.` ja em uso.

## Decisoes fechadas no brainstorm

| Pergunta | Resposta operador |
|---|---|
| Escopo da 1a iteracao | MVP completo (5 paginas + 2 endpoints + deploy) |
| Catalogo de produtos | 8: Familia Milionaria, Robo de Vendas/TiAtendo, Social Midia IA, GHL-Evolution-WhatsApp, Paid Midia Automation, Plexco Tasks, Plexco Coach, Plexco Tickets |
| Identidade visual | Paleta Ads4Pros (`#0a6ad8` azul + Space Grotesk + JetBrains Mono) |

## Arquitetura

- **Frontend:** Next.js 15 App Router + Tailwind + shadcn/ui. Output `standalone` -> Docker.
- **Backend:** SEM backend proprio. Forms POSTam direto pro Painel via 2 endpoints novos. Reduz complexidade + reusa rate limit/auth ja existentes do Painel.
- **Deploy:** Docker Swarm no VPS, stack `huboperacional-site` com 1 service `web` + Traefik route `Host('huboperacional.com.br')`.
- **Tracking:** lib/tracking.ts captura 15 campos canon R2 no first page-view, persiste em `localStorage`, anexa a toda submission.

## Estrutura de arquivos

```
huboperacional-site/
├── services/web/                       Next.js 15 app
│   ├── app/
│   │   ├── layout.tsx                  Header + Footer + tracking init
│   │   ├── page.tsx                    /  home (hero + 8 produtos preview + CTA afiliados)
│   │   ├── produtos/
│   │   │   ├── page.tsx                /produtos  catalogo grid 8 cards
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            /produtos/<slug>  detalhe + JSON-LD Product
│   │   │       └── generateStaticParams.ts
│   │   ├── afiliados/
│   │   │   └── page.tsx                /afiliados  programa + form cadastro inline
│   │   ├── contato/page.tsx            /contato  form lead
│   │   ├── sobre/page.tsx              /sobre
│   │   ├── sitemap.ts                  Auto: home + produtos + 8 detalhes + afiliados + contato + sobre
│   │   ├── robots.ts                   Allow all + sitemap ref
│   │   ├── globals.css                 Tailwind base + CSS vars Ads4Pros
│   │   └── opengraph-image.tsx         OG default via next/og (opcional v0.2)
│   ├── components/
│   │   ├── ui/                         shadcn primitives (Button, Card, Input, Textarea, Label)
│   │   ├── Header.tsx Footer.tsx
│   │   ├── ProductCard.tsx ProductDetail.tsx
│   │   ├── ContactForm.tsx AffiliateForm.tsx
│   │   └── TrackingProvider.tsx        client component pra inicializar lib/tracking
│   ├── lib/
│   │   ├── tracking.ts                 PMT client (15 campos canon)
│   │   ├── api.ts                      Painel client (leads/inbound + affiliates/public-signup)
│   │   └── products.ts                 8 produtos como const + type Product
│   ├── content/produtos/               8 MDX (1 por produto)
│   │   ├── familia-milionaria.mdx
│   │   ├── robo-vendas.mdx (TiAtendo)
│   │   ├── social-midia.mdx
│   │   ├── ghl-evolution.mdx
│   │   ├── paid-midia-automation.mdx
│   │   ├── plexco-tasks.mdx
│   │   ├── plexco-coach.mdx
│   │   └── plexco-tickets.mdx
│   ├── public/
│   │   ├── favicon.ico
│   │   └── og-default.png              (placeholder MVP)
│   ├── tailwind.config.ts              paleta Ads4Pros via theme.extend.colors
│   ├── next.config.mjs                 output: 'standalone', mdx support
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   └── package.json                    deps: next@15, react@19, tailwindcss@3, @next/mdx, lucide-react, clsx
├── deploy/
│   ├── Dockerfile.web                  multi-stage Node 20 alpine -> Next standalone
│   └── docker-compose.yml              stack Swarm + Traefik labels Host('huboperacional.com.br')
├── docs/superpowers/specs/2026-05-16-huboperacional-site-design.md  (este doc)
├── docs/superpowers/plans/             (a ser gerado por writing-plans skill)
├── CLAUDE.md                           project context pro agente
├── AGENTS.md                           slim cross-provider (R9)
├── HANDOFF.md                          status atual
├── README.md
├── .gitignore                          node_modules/, .next/, .env, .deepseek/
└── .env.example                        PAINEL_API_URL, NEXT_PUBLIC_PAINEL_URL
```

## Backend (Painel) — 2 endpoints novos

Adicionar em `D:\Claud Automations\Painel Gestao e Afiliados\execution\api\`.

### `POST /admin/leads/inbound`

**Auth:** rate-limited publico. Sem `X-Admin-Key`. Recaptcha v2 ou v3 e' overkill MVP — usar rate limit por IPv6 /64 (R15 canonico).

**Request body:**
```json
{
  "name": "string (required)",
  "email": "string (required, validated)",
  "whatsapp": "string (optional, E.164 format)",
  "message": "string (required, 10-2000 chars)",
  "tracking": {
    "fbclid": "string", "gclid": "string", "gbraid": "string", "wbraid": "string",
    "msclkid": "string", "ttclid": "string", "fbp": "string", "fbc": "string",
    "utm_source": "string", "utm_medium": "string", "utm_campaign": "string",
    "utm_content": "string", "utm_term": "string",
    "referrer": "string", "landing_url": "string"
  }
}
```

**Comportamento:**
1. Valida body via Pydantic v2 (R5).
2. Rate limit por IPv6 /64: 5 req/hora (anti-spam).
3. Persiste em tabela `lp_leads` (verificar se ja existe; senao criar migration nova).
4. Retorna `{ok: true, lead_id: "uuid"}`.

**Tabela `lp_leads`:** verificar se existe. Schema esperado:
```sql
CREATE TABLE IF NOT EXISTS lp_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    message TEXT NOT NULL,
    tracking JSONB NOT NULL DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'huboperacional-site',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lp_leads_email ON lp_leads (email);
CREATE INDEX IF NOT EXISTS idx_lp_leads_created ON lp_leads (created_at DESC);
```

### `POST /affiliates/public-signup`

**Auth:** publico, rate-limited.

**Request body:**
```json
{
  "name": "string (required)",
  "email": "string (required, validated)",
  "whatsapp": "string (required, E.164)",
  "tracking": "<mesma estrutura de leads/inbound>"
}
```

**Comportamento:**
1. Valida body.
2. Rate limit IPv6 /64: 3 req/hora.
3. Reusa `affiliateRoutes.create_affiliate` (que ja existe e gera `ref_code` unico).
4. Dispara `send-welcome` async (Evolution WA, endpoint ja existente).
5. Retorna `{ok: true, ref_code: "abc12345"}`.

## Frontend — Tracking client (R2)

`services/web/lib/tracking.ts`:

```typescript
type Attribution = {
  fbclid?: string; gclid?: string; gbraid?: string; wbraid?: string;
  msclkid?: string; ttclid?: string;
  fbp?: string; fbc?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_content?: string; utm_term?: string;
  referrer?: string; landing_url?: string;
  captured_at: number;  // unix ms
};

const STORAGE_KEY = 'percus_attribution';
const TTL_DAYS = 90;

export function captureOnFirstVisit(): void { /* le URLSearchParams + cookies + persist localStorage se ainda nao tem ou expirou */ }
export function getAttribution(): Attribution | null { /* le localStorage, verifica TTL */ }
```

`components/TrackingProvider.tsx` (client component) chama `captureOnFirstVisit()` no mount via `useEffect`.

## Frontend — API client

`services/web/lib/api.ts`:

```typescript
const PAINEL_URL = process.env.NEXT_PUBLIC_PAINEL_URL ?? 'https://api.ads4pros.com';

export async function submitLead(payload: {name, email, whatsapp?, message}): Promise<{ok, lead_id}> {
  const tracking = getAttribution() ?? {};
  const resp = await fetch(`${PAINEL_URL}/admin/leads/inbound`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({...payload, tracking}),
  });
  return await resp.json();
}

export async function submitAffiliate(payload): Promise<{ok, ref_code}> { /* idem pra /affiliates/public-signup */ }
```

## Frontend — Brand tokens

`globals.css` mapeia paleta Ads4Pros pra CSS variables consumidas pelo Tailwind + shadcn:

```css
:root {
  --brand-50: #EFF6FF;
  --brand-500: #0a6ad8;
  --brand-600: #0858B5;
  --fg: #0F172A;
  --paper: #F8FAFC;
  --paper-3: #E2E8F0;
  --steel-500: #5B6470;
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

`tailwind.config.ts` extende:
```typescript
theme: {
  extend: {
    colors: { brand: { 50: 'var(--brand-50)', 500: 'var(--brand-500)', 600: 'var(--brand-600)' }},
    fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] }
  }
}
```

## SEO

- `app/sitemap.ts` retorna array com home + produtos + 8 detalhes + afiliados + contato + sobre. Auto-update via `generateStaticParams`.
- `app/robots.ts` allow all + ref sitemap.
- `<head>` `<meta>` tags em layout.tsx: title default, description, og:type=website, og:image=/og-default.png.
- Em `/produtos/[slug]`: JSON-LD `<script type="application/ld+json">` Product schema.
- SSG default + ISR `revalidate: 3600` em paginas dinamicas (revalida a cada 1h).
- `next/og` opcional Sprint 2.

## Conteudo produtos (.mdx)

Cada `.mdx` tem frontmatter + corpo:
```mdx
---
slug: familia-milionaria
title: Familia Milionaria
tagline: "Gestao financeira familiar via WhatsApp"
icon: piggy-bank
color: '#0a6ad8'
website: https://familiamilionaria.com.br
category: produto
status: producao
---

# Familia Milionaria

<paragrafo descrevendo o produto, 2-3 frases>

## Como funciona
- Bullet 1
- Bullet 2

## CTA
[Conhecer plataforma](https://familiamilionaria.com.br?utm_source=hub&utm_campaign=familia-milionaria)
```

Conteudo MVP usa placeholder coerente derivado do CLAUDE.md de cada projeto. Operador editara `.mdx` direto no repo pra ajustar pitch/CTAs definitivos.

## Deploy

### Dockerfile.web (multi-stage)
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY services/web/package*.json ./
RUN npm ci --omit=optional

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY services/web/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml (Swarm)
```yaml
version: '3.8'
services:
  web:
    image: huboperacional-site:v0.1.0
    networks: [network_swarm_public]
    environment:
      - NEXT_PUBLIC_PAINEL_URL=https://api.ads4pros.com
      - NODE_ENV=production
    deploy:
      replicas: 1
      labels:
        - traefik.enable=true
        - traefik.http.routers.huboperacional.rule=Host(`huboperacional.com.br`)
        - traefik.http.routers.huboperacional.entrypoints=websecure
        - traefik.http.routers.huboperacional.tls.certresolver=letsencryptresolver
        - traefik.http.services.huboperacional.loadbalancer.server.port=3000

networks:
  network_swarm_public:
    external: true
```

### Pipeline de deploy
1. Local: `cd services/web && npm install && npm run build` (sanity).
2. SCP do projeto inteiro pro VPS `/opt/huboperacional-site/`.
3. VPS: `cd /opt/huboperacional-site && docker build -f deploy/Dockerfile.web -t huboperacional-site:v0.1.0 .`
4. VPS: `docker stack deploy -c deploy/docker-compose.yml huboperacional-site`
5. Smoke: `curl https://huboperacional.com.br/` -> 200 + content esperado.

## Testes

MVP: smoke E2E manual.
- [ ] `curl https://huboperacional.com.br/` -> HTTP 200, HTML valido.
- [ ] `curl https://huboperacional.com.br/produtos` -> HTTP 200, 8 cards.
- [ ] `curl https://huboperacional.com.br/produtos/familia-milionaria` -> HTTP 200, JSON-LD presente.
- [ ] `curl https://huboperacional.com.br/sitemap.xml` -> 12+ URLs.
- [ ] Form `/contato` submit -> Painel `/admin/leads/inbound` recebe + entry em `lp_leads`.
- [ ] Form `/afiliados` submit -> Painel cria affiliate + dispara welcome WA.

Sprint 2 adiciona Vitest (unit) + Playwright (E2E).

## Riscos identificados (pre-implementacao)

| Risco | Mitigacao planejada |
|---|---|
| Tabela `lp_leads` pode nao existir no Painel | Verificar antes de implementar endpoint; criar migration se necessario |
| Endpoint `affiliateRoutes.create_affiliate` pode ter assinatura diferente da esperada | Ler codigo antes; ajustar wrapper se necessario |
| shadcn/ui CSS variables mapping pra paleta Ads4Pros pode dar atrito | Backup: usar Tailwind direto sem theme custom shadcn |
| `.mdx` setup com Next.js 15 App Router pode ser quirky | Usar `@next/mdx` + `next.config.mjs` config padrao; fallback: `.tsx` puro com content as objects |
| Build Next.js 15 em Docker pode bater em problema de musl alpine | Backup: Node 20 debian-slim ao inves de alpine |
| Rate limit IPv6 /64 no Painel — middleware existe? | Verificar; senao implementar minimo no endpoint diretamente |

## Nao-escopo MVP (v0.2+)

- Blog/CMS.
- i18n.
- Dark mode toggle.
- A/B testing.
- Search interno.
- Comentarios.
- Login/area logada (futura: usar `auth-service` Percus).
- OG images dinamicas via `next/og`.
- Vitest/Playwright tests.
- Lighthouse CI.

## Definicao de "pronto"

MVP v0.1 esta pronto quando:
- ✅ 5 paginas renderizadas em `huboperacional.com.br` HTTPS 200.
- ✅ 2 endpoints `/admin/leads/inbound` + `/affiliates/public-signup` no Painel deployados em prod (`api.ads4pros.com`).
- ✅ Form contato submitted -> entry em `lp_leads` DB.
- ✅ Form afiliados submitted -> affiliate criado em `affiliates` table + WA welcome enviado.
- ✅ Tracking 15 campos capturado no first visit + anexado a submissions.
- ✅ Sitemap.xml + robots.txt acessiveis.
- ✅ HANDOFF.md do `huboperacional-site/` com status + comandos uteis.
- ✅ HANDOFF.md de `Melhoria do prompt inicial/` atualizado marcando Eixo D entregue.

## Pendencias pos-MVP a registrar como Sprint 2 do Eixo D

- Conteudo definitivo dos 8 .mdx (operador edita).
- OG images per produto (next/og).
- Vitest + Playwright suite.
- Sitemap.xml com lastmod real.
- Open Graph Twitter cards.
- Pixel Meta + Google Ads tag.
- Schema.org Organization + BreadcrumbList.

## Referencias

- Plano mestre: `D:\Claud Automations\.claude-home\plans\criei-a-pasta-d-claud-warm-patterson.md` Eixo D.
- Stack canon: `D:\Claud Automations\_Novo_Projeto\02_INFRA_E_STACK_PERCUS.md`.
- Tracking 15 campos: `D:\Claud Automations\_Novo_Projeto\03_TRACKING_ATTRIBUITION.md`.
- Brand reference: `D:\Claud Automations\Painel Gestao e Afiliados\static\assets\ads4pros-ds.css`.
- Painel API base: `https://api.ads4pros.com`.
