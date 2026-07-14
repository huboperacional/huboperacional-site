# Spec — GA4 + banner de consentimento (LGPD opt-in)

_Data: 2026-07-14 · Frente: v0.2 SEO & Tracking · Status na entrada: `[0]` → alvo `[4-C]` (build+E2E) → `[5-T]` (GA4 Realtime em prod, próximo deploy R24)_

## Contexto e objetivo

O item "Pixel Meta + Google Ads" do PLANO foi reduzido pelo operador a **GA4 apenas** (Measurement ID `G-K60P2FZ61K`). Meta Pixel: fora deste escopo. Objetivo: carregar o Google Analytics 4 **somente após consentimento** do usuário (LGPD opt-in, abordagem A aprovada), via um banner de cookies. Direção visual aprovada no gate R10 (mockup: `https://claude.ai/code/artifact/d2cc7f72-110c-42a0-9152-5e1809da457e`).

## Não-objetivos / segurança

- **Meta Pixel** — fora de escopo (operador adiou).
- **Measurement Protocol API secret** (`a5W1vyOP…`) — **NÃO** entra no repo/código. É segredo server-side; este site não tem backend. Se um dia houver eventos server-side, o secret vive no Painel, não aqui. **Nunca commitar.**
- **Gating do `tracking.ts`** — decidido pelo operador: **fica sempre-ligado** (atribuição first-party, só sai do browser no submit de form; consentimento implícito no ato). Só o GA4 é gated. `lib/tracking.ts` e `TrackingProvider` ficam **intocados**.
- **Google Consent Mode v2** — não (abordagem A simples foi a escolhida, não a C).

## Modelo de consentimento

- Estado em `localStorage`, chave **`hub_consent`** ∈ { ausente, `'granted'`, `'denied'` }.
- **Ausente** → banner visível. **`granted`** → GA4 carregado, banner oculto. **`denied`** → GA4 nunca carrega, banner oculto. Escolha persiste (não re-pergunta).
- **Revogar:** link "Cookies" no Footer → limpa `hub_consent` e reabre o banner (poder retirar consentimento — LGPD). Implementado via um evento simples (custom event ou estado compartilhado — ver componentes).

## Componentes (cada um um propósito)

### `services/web/components/Analytics.tsx` (client)
- Recebe o GA ID. Monta os scripts GA4 via `next/script` (`strategy="afterInteractive"`): o loader `https://www.googletagmanager.com/gtag/js?id=<ID>` + o inline `gtag('js'…); gtag('config','<ID>')`.
- **Pageview SPA:** `usePathname()` + `useEffect` → em cada mudança de rota (App Router client nav) dispara `gtag('event','page_view',{page_path})`. Cobre a navegação client-side (o `config` inicial cobre o 1º load).
- Só é **renderizado** pelo `CookieConsent` quando `granted` — então nunca monta sem consentimento.

### `services/web/components/CookieConsent.tsx` (client)
- Dona do estado de consentimento. No mount: lê `hub_consent`.
- Renderiza: `<Analytics/>` se `granted` (e o GA ID existir); o **banner** se ausente; nada se `denied`.
- **Banner** (do mockup aprovado): card ancorado no rodapé (`fixed bottom`), estilo Tailwind/brand do site, 🍪 + copy + `[Recusar]` (outline) e `[Aceitar]` (brand sólido), ambos claramente clicáveis (sem dark-pattern). `role="dialog"`, foco/teclado acessível, respeita `prefers-reduced-motion` na entrada.
- Aceitar → `hub_consent='granted'` + re-render (monta Analytics). Recusar → `hub_consent='denied'` + oculta.
- Escuta o gatilho de revogação do Footer (custom event `hub:open-consent`) → limpa o estado e reexibe o banner.

### Wiring
- `app/layout.tsx`: montar `<CookieConsent/>` no `<body>` (ao lado de `<TrackingProvider/>`).
- `components/Footer.tsx`: adicionar um botão/link **"Cookies"** que dispara `window.dispatchEvent(new Event('hub:open-consent'))`.

## GA4 ID / env

- **`NEXT_PUBLIC_GA_ID`** — o Measurement ID público. Valor `G-K60P2FZ61K` no `deploy/docker-compose.yml` (bloco `environment`) e placeholder no `.env.example`. Se **ausente** (dev/preview sem a var) → `Analytics` não monta (sem GA). ID público em código client é OK (diferente do secret).

## Copy do banner (aprovado)

- Título/linha: **"Cookies de análise."** + "Usamos o Google Analytics pra entender como o site é usado e melhorá-lo. Só analytics — nada de anúncios."
- Sub: "Sua escolha fica salva neste navegador. Você pode mudar depois em 'Cookies', no rodapé."
- Botões: **Recusar** (outline brand) · **Aceitar** (brand sólido).

## E2E (reusa o harness Playwright existente)

Novo `services/web/e2e/consent.spec.ts`:
- Banner aparece no 1º acesso (localStorage limpo).
- **Aceitar** → `localStorage.hub_consent === 'granted'`, o `<script src*="googletagmanager.com/gtag/js">` passa a existir no DOM, banner some.
- **Recusar** → `hub_consent === 'denied'`, **nenhum** script gtag no DOM, banner some.
- Persistência: recarregar com `granted`/`denied` no localStorage → banner não reaparece.
- Revogar: clicar "Cookies" no footer com escolha salva → banner reaparece.
- **Zero chamada real ao GA:** `page.route('**/googletagmanager.com/**', abort/fulfill)` pra não bater no Google (mesma disciplina da suíte). Rodar `new-client`-style serial se necessário.

## Critério de "pronto"

- **`[4-C]` (esta sessão):** `NODE_ENV=production npm run build` OK; banner renderiza (inspeção local); `npm run test:e2e` verde incluindo `consent.spec.ts`; confirmado que o script GA **não** existe no DOM antes do aceite.
- **`[5-T]` (próximo deploy R24):** com `NEXT_PUBLIC_GA_ID` no compose, aceitar em prod → **GA4 Realtime** mostra a sessão; recusar → nada em Realtime.

## Implementação

Multi-arquivo com UI + lógica de consentimento + nuance de pageview SPA → **escrever direto** (não delegar ao DeepSeek; correção da lógica de gating importa) com revisão R11 + um subagente de code-review no final focado no gating (garantir que GA4 nunca carrega sem consentimento). Componente de banner segue o design system do site (exceção R10 declarada: mockup aprovado, não é Claude artifact em produção).
