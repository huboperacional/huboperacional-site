# Spec — Suíte Playwright E2E (huboperacional-site)

_Data: 2026-07-14 · Frente: v0.2 Qualidade · Status na entrada: `[0]` → alvo `[5-T]`_

## Contexto e objetivo

O site é frontend puro (Next.js 15, App Router, sem backend próprio). Já tem Vitest (16 unit tests em `lib/**/*.test.ts`), mas **nenhum teste E2E**. O item "Playwright (E2E)" está `[0]` no `docs/PLANO.md` com a nota **"submit real = risco"**: os 2 forms e o wizard POSTam direto pra API pública do Painel Ads4Pros, e um submit real cria lead/afiliado/onboarding **e dispara WhatsApp real ao operador**.

**Objetivo:** rede de segurança contra regressões de **frontend** (validação, navegação por etapas, lógica condicional do wizard, estados de sucesso/erro, e o anexo de tracking/atribuição ao payload) — sem tocar o Painel nem disparar WhatsApp.

## Não-objetivos (YAGNI / escopo explícito)

- **Validar o contrato real da API ao vivo** — já está `[5-T]` verificado E2E em prod com submits reais (v0.3). Aqui a rede é mockada de propósito. (Drift de contrato **do lado do frontend** é coberto pelo contract-guard Vitest abaixo — sem rede.)
- **Workflow de CI (GitHub Actions)** — não há pipeline no repo hoje (deploy é Docker manual). A suíte fica CI-ready, mas o workflow não entra nesta rodada.
- **Cross-browser / mobile** — Chromium desktop só. Firefox/WebKit/viewport mobile ficam pra depois se houver necessidade.
- **Testar o `lib/tracking.ts` isolado** — já coberto por Vitest; aqui só se afirma que o tracking **chega no body** interceptado (integração ponta-a-ponta).

## Decisão de arquitetura: isolamento de rede

**Route interception do Playwright** (`page.route()`), decidida no brainstorming sobre as alternativas (endpoint de teste no Painel — rejeitado por acoplar cross-repo o que a arquitetura separa de propósito; hit real com cleanup — rejeitado por disparar WhatsApp real, ser frágil sob rate-limit 5/h e poluir o Painel).

Os forms chamam `fetch(\`${PAINEL_URL}${path}\`)` onde `PAINEL_URL = process.env.NEXT_PUBLIC_PAINEL_URL || 'https://api.ads4pros.com'` (ver `services/web/lib/api.ts`). A interceptação casa os 3 paths por glob, independente do host:

- `**/public/leads`
- `**/public/affiliate-signup`
- `**/public/new-client`

### Helper central `e2e/helpers/mock-api.ts`

Um helper por endpoint que (a) instala a rota, (b) responde com uma fixture configurável (status + json), (c) **captura o request body** e o expõe pra asserção. Assim cada spec afirma tanto o comportamento visível quanto o payload enviado.

```ts
// Assinatura pretendida (detalhe fica pro plano de implementação)
type MockResult = { body: unknown };
function mockLeads(page: Page, resp: { status: number; json: object }): Promise<MockResult>;
function mockAffiliate(page: Page, resp): Promise<MockResult>;
function mockNewClient(page: Page, resp): Promise<MockResult>;
```

## Estratégia de seletores

Os forms usam `id` + `name` + `<label htmlFor>` (sem `data-testid`). Preferir `getByRole`/`getByLabel` (acessível e resiliente). **Risco:** o `NewClientWizard` pode não ter labels acessíveis em todos os campos/botões — se faltar, adicionar `data-testid` mínimos no componente **como parte da implementação** (mudança de código pequena, passa pelo review R11 no commit).

## Cobertura

Princípio: lógica arriscada + 1 happy-path + estados-chave por form; **não** toda permutação de campo.

### `contact.spec.ts` (`/contato`)
- Happy-path: preenche válido → mock **200** → aparece "Mensagem enviada!" e o form é resetado.
- Erro: mock **429** → mensagem "Muitas requisicoes…".
- **Falha de rede** (`route.abort()`): a UI mostra o feedback de erro de conexão do `api.ts` (`"Erro de conexao…"`). _(Adicionado pós-review do conselho — DeepSeek apontou que o caminho de falha/timeout do fetch não estava coberto.)_
- Validação client-side: submit com campos inválidos (ex.: message < 10 chars) é bloqueado pelo HTML5 → **o fetch NÃO é chamado** (asserção via ausência de captura).
- `?produto=X`: navega `/contato?produto=<slug>` → textarea vem pré-preenchida (`defaultMessage`).
- **Tracking:** o body interceptado no happy-path contém `tracking` (objeto).

### `affiliate.spec.ts` (`/afiliados`)
- Happy-path: mock **200** `{ ref_code, status: 'created' }` → mostra o código e o texto "4 mensagens".
- `already_registered`: mock **200** `{ status: 'already_registered' }` → copy alternativa ("Você já é parceiro!").
- Erro: mock **429** (ou **500**) → mensagem de erro.
- **Falha de rede** (`route.abort()`): UI mostra erro de conexão.
- Validação: name/email/whatsapp obrigatórios bloqueiam submit.

### `new-client.spec.ts` (`/new-client/[lang]`)
- Navegação das 6 etapas: welcome → país → empresa → responsável → financeiro → obrigado.
- Validação por etapa: não avança com campos obrigatórios vazios/ inválidos.
- **Condicionais BR vs US:** regime tributário só aparece em BR; métodos de pagamento BR = cartão/boleto-pix, US = cartão/bank-transfer; máscara de data de nascimento BR `DD/MM/AAAA` vs US `MM/DD/AAAA`.
- `fin_is_owner`: marcar "sou eu" esconde os campos do financeiro; desmarcar mostra.
- `?ref=CODE`: navega com o param → o body interceptado do submit contém `ref_code: CODE`.
- Submit: mock **201** `{ ok: true, id }` → chega na etapa "obrigado".
- **i18n:** asserções-chave rodadas em **pt-br** e **en** (parametrizar por `lang`).
- Roteamento: `/new-client` → redirect `/new-client/pt-br`; `/new-client/fr` → **404** (`dynamicParams=false`).

## Contract-guard (Vitest, sem rede) — adicionado pós-review do conselho

Complemento à suíte Playwright, mora no **Vitest** (não é E2E). Fecha o furo que os 2 conselheiros apontaram: mockar 100% da rede no E2E deixa passar **drift de payload do lado do frontend** (campo renomeado/removido, ou campo extra que o Pydantic `extra='forbid'` do Painel rejeitaria).

**Mecanismo:** um `lib/api-contract.test.ts` que mocka `global.fetch` (mesma técnica do `lib/api.test.ts` existente), chama cada builder (`submitLead`/`submitAffiliate`/`submitNewClient`) e captura o **body serializado** enviado ao `fetch`. Valida contra um schema versionado (`lib/painel-contract.ts` — espelho dos campos que o Painel espera, por endpoint): todos os obrigatórios presentes, nenhum campo fora do conjunto permitido (espelha `extra='forbid'`), tipos corretos, e `tracking` anexado.

**Honestidade sobre o limite:** é um **espelho checked-in**, não contrato ao vivo — pega regressão do frontend contra o schema local, não uma mudança silenciosa no Pydantic do Painel. Precisa ser atualizado quando o contrato `/public/*` mudar. Custo: milissegundos, zero rede. É a mitigação barata que o DeepSeek propôs (preferida sobre "integração com API real" do Llama, que reintroduz o submit real + WhatsApp que a arquitetura evita de propósito).

## Runner e configuração

- **`webServer`:** por padrão sobe `npm run dev` (`reuseExistingServer: !process.env.CI`, `url: http://localhost:3000`). `next dev` é agnóstico à interceptação e **evita o gotcha conhecido do `NODE_ENV`/prerender de `/404`** (não precisa de build de produção pra testar). Ver memória `build-nodeenv-production`.
  - **Comando sobrescrevível por env** (`PW_WEBSERVER_CMD`) — rodar a suíte contra um build de produção standalone vira one-liner quando fizer sentido (ex.: pré-deploy), sem editar a config. _(Concessão ao ponto do Llama: `next dev` esconde bugs que só aparecem no standalone/prod — tree-shaking, env vars ausentes.)_
  - **A suíte E2E NÃO substitui o smoke pós-deploy em prod** (loop `curl` do HANDOFF + gate `[5-T]` = verificação no prod real). Essa é a rede que cobre a lacuna dev-vs-prod; a suíte é rede contra regressão de frontend, não de infra/prod.
- **Browser:** Chromium desktop.
- **`testDir: './e2e'`** com `.spec.ts` — não colide com Vitest (`include: lib/**/*.test.ts`).
- **Retries:** 1 em CI, 0 local. **Trace:** `on-first-retry`.

## Arquivos

Novos, todos sob `services/web/`:
- `playwright.config.ts`
- `e2e/contact.spec.ts`
- `e2e/affiliate.spec.ts`
- `e2e/new-client.spec.ts`
- `e2e/helpers/mock-api.ts`
- `lib/painel-contract.ts` — schema versionado dos payloads `/public/*` (espelho do contrato do Painel)
- `lib/api-contract.test.ts` — contract-guard Vitest (fetch mockado, valida body serializado contra o schema)

Alterados:
- `package.json` — scripts `test:e2e` (`playwright test`) e `test:e2e:ui` (`playwright test --ui`); devDep `@playwright/test`.
- (Possível) `components/NewClientWizard.tsx` — `data-testid` mínimos se faltarem seletores acessíveis.
- `.gitignore` — `playwright-report/`, `test-results/`.
- `docs/PLANO.md` — mover o item pra `[5-T]` ao concluir.

## Riscos e mitigações

- **Wizard sem seletores estáveis** → adicionar `data-testid` mínimos (mudança pequena, revisada).
- **`next dev` lento (compila on-demand)** → `webServer.timeout` folgado; primeira navegação por rota aquece.
- **Flakiness de estados assíncronos** (loading→success) → usar auto-waiting do Playwright (`expect(locator).toBeVisible()`), nunca sleeps fixos.
- **`@playwright/test` precisa baixar browser** (`npx playwright install chromium`) → documentar no HANDOFF/README; é passo one-time.

## Critério de "pronto" (adaptado ao perfil da feature)

Diferente de página/form, o **deliverable é a própria suíte**. "Pronto" (`[5-T]`) aqui = **`npm run test:e2e` roda verde localmente** (todos os specs passando, com a rede mockada e zero chamada real ao Painel) **E** o contract-guard Vitest verde (`npm run test` incluindo `lib/api-contract.test.ts`), evidência colada. "Build passa" não conta (R1); "suítes verdes observadas" conta.
