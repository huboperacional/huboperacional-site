---
spec: huboperacional-site — Wizard de cadastro de cliente /new-client (bilíngue) + orquestração no Painel
data: 2026-06-30
fase: v0.3 / Frente "Cadastro de Cliente"
status: approved (brainstorming/plan mode + decisões do operador 2026-06-30). NÃO iniciado.
escopo: form conversacional multi-etapas cross-repo (site + Painel) com fan-out pra Postgres, Sheets, GHL, WhatsApp
plano-detalhado: docs/superpowers/plans/2026-06-30-new-client-wizard.md
---

# /new-client — Design Spec

## Contexto

Formulário conversacional multi-etapas em `huboperacional.com.br/new-client`, bilíngue (pt-BR / en pela slug),
que captura dados de empresa/responsável/financeiro de um novo cliente e **distribui a submissão** pra vários
destinos. O site não tem backend próprio → o wizard POSTa pra um endpoint novo no **Painel**
(`D:\Claud Automations\Painel Gestao e Afiliados`), que orquestra: persistir em Postgres, **atribuir o afiliado**
que indicou (via `ref_code`), WhatsApp de confirmação (responsável + admin), **append na planilha Google
"V4 Clientes"** e **registrar no GHL** (pipeline "01 Marketing Pipeline"). Comissão nasce depois (na venda).

## Decisões do operador (2026-06-30)

- **Tudo de uma vez** (não faseado).
- Ref por **`?ref=CODE` na URL + campo oculto** no form (redundância anti-erro).
- Comissão **só atribui agora** (gerada na venda futura pelo fluxo existente).
- Design **usa o design system atual** (sem mockup — exceção R10 declarada, é evolução do mesmo sistema).
- Slugs: **`/new-client/pt-br`** e **`/new-client/en`**.
- Logos: **operador fornece os arquivos** (Hub Operacional, Edifica Express, V4 Company, Micro Investors).
- WhatsApp: **GOWA** (não Evolution).

## ⚠️ BLOQUEIOS — creds ausentes no `.env` do Painel (verificado 2026-06-30)

O que o operador lembrava diverge do `.env` real:
- **GOWA:** existem `GOWA_BASIC_AUTH`, `GOWA_WEBHOOK_URL`, `GOWA_WEBHOOK_SECRET`, mas **não há cliente GOWA no
  código** (envio ainda é Evolution via `EvolutionClient`/`sendWhatsApp`) e **falta a URL de ENVIO** (só webhook).
  → Precisa: base URL de envio do GOWA + formato do endpoint (`POST /send/message`, basic auth).
- **Google Sheets:** **ausente** (só `GOOGLE_AI_STUDIO_TOKEN`/Gemini). → Precisa: service-account JSON +
  compartilhar planilha V4 (edit) + `SHEET_ID` + nome da aba + var de config.
- **GHL:** **nenhuma var GHL** no `.env`. Só a Location ID `ElbRWEbPclFoAfVW9bm0` (dada no chat).
  → Precisa: token de Private Integration GHL; mapear `pipeline_id`+`stage_id` do "01 Marketing Pipeline"
  (via `GET /opportunities/pipelines?locationId=`).

Código dessas 3 integrações = **best-effort/feature-flagged pela presença da cred** (se não setada, loga e pula,
sem quebrar o cadastro). Persistência + atribuição de afiliado funcionam sem elas.

## Arquitetura

- **Frontend (huboperacional-site):** `app/new-client/[lang]/page.tsx` (server, `generateStaticParams` →
  `pt-br`/`en`) → client component `NewClientWizard` (multi-step: index, dados acumulados, back/next, progresso,
  validação por etapa). Reusa `lib/api.ts` `postJson`/`ApiResult`, tokens Tailwind, máquina `idle|loading|success|error`.
  i18n = dicionário `{ 'pt-br' | 'en' }` do server → client (sem lib). Captura `?ref=` → estado + `<input hidden name="ref">` → payload.
- **Backend (Painel):** `POST /public/new-client` em `execution/api/siteRoutes.py` (CORS já libera o domínio).
  Espelha `createAffiliate` + `ingestService.handleSale` + bloco best-effort de `affiliateRoutes.py:197-254`:
  1. Pydantic v2 `extra='forbid'` (declarar TODOS os campos), rate-limit `key="public-new-client", limitPerHour=5`, `getClientIp`.
  2. `INSERT` em `client_onboarding` (RETURNING id).
  3. `_findAffiliate(ref_code)` → grava `affiliate_id` (só atribuição, **sem** comissão).
  4. Side-effects **não-bloqueantes** (try/except cada): (a) GOWA WhatsApp responsável (idioma do form) + admin
     `settings.notification_whatsapp` (pt-BR); (b) append planilha V4; (c) GHL upsert contato + opportunity no "01 Marketing Pipeline".
  5. Responde `{ ok: true, id }`.

## Páginas do wizard (5 + obrigado)

- **P1 – Boas-vindas:** logo Hub Operacional em cima; abaixo lado a lado Edifica Express · V4 Company · Micro Investors
  (`public/logos/`, fornecidos; placeholder textual até chegarem). Texto no idioma. Botão "Começar".
- **P2 – País:** "EUA ou Brasil?" com 2 botões-bandeira (🇧🇷/🇺🇸) → `country ∈ {BR, US}`.
- **P3 – Empresa:** Company Name; CNPJ(BR)/EIN(US); Empresa Endereço (linha completa auto-composta); Empresa Rua;
  Empresa Complemento; Empresa Cidade; Empresa Estado; Empresa CEP(BR)/ZIP(US); **Empresa Regime** (só BR:
  Simples/Lucro Presumido/Lucro Real); Pais (read-only da P2).
- **P4 – Responsável (owner):** Owner Name; Owner E-mail; Owner Phone; Nascimento (data).
- **P5 – Financeiro + pagamento:** "Financeiro é o owner ou outra pessoa?" → se outra: Financeiro Nome/WhatsApp/E-mail.
  **Método de pagamento** (sempre): BR → Cartão de crédito · Boleto/Pix; US → Credit Card · Bank Transfer. Submit.
- **Obrigado:** confirma envio no idioma.

**Obrigatórios (proposto):** country, company name, tax id, owner name/email/phone, payment method.
**Opcionais:** nascimento, complemento, bloco financeiro (só se "outra pessoa").

## Tabela `client_onboarding` (nova)

`execution/database/migration_client_onboarding.sql` (espelha `migration_site_leads.sql`; aplicar em prod via psql —
sem runner automático). Colunas: `id UUID PK`, `company_name`, `tax_id`, `country CHECK (BR,US)`, `tax_regime`(nullable),
`address_full`, `street`, `complement`, `city`, `state`, `zip`, `owner_name`, `owner_email`, `owner_phone`,
`owner_birthdate DATE`, `fin_is_owner BOOL`, `fin_name`, `fin_whatsapp`, `fin_email`, `payment_method`, `lang`,
`ref_code`, `affiliate_id UUID REFERENCES affiliates(id)`, `tracking JSONB`, `source`, `ip_address`, `user_agent`, `created_at`.

## Planilha "V4 Clientes" — ordem exata das 34 colunas (já lida)

`Data · Company Name · CNPJ ou EIN · Owner Name · Owner E-mail · Phone · Nascimento · Empresa Endereço · Empresa Rua ·
Empresa Complemento · Empresa Cidade · Empresa Estado · Empresa CEP · Pais · (blank) · Responsável CPF · Responsável RG ·
Responsável E-mail · Responsável Endereço · Responsável Rua · Responsável Complemento · Responsável Cidade ·
Responsável Estado · Responsável CEP · Empresa Regime · Empresa Faturamento · Empresa Canal · Financeiro é o Responsável ·
Financeiro Nome · Financeiro WhatsApp · Financeiro E-mail · Financeiro Vencimento · Data 1 · Metodo de Pagamento · Metodo de Pagamento`

O form preenche o **subconjunto** que coleta; colunas não coletadas (Responsável CPF/RG/endereço, Faturamento, Canal,
Vencimento) vão vazias. Spreadsheet ID: `1rGtbHa-sq0I1qUzVxIF5c1Y-yR5Nq37viDgoSCNmbDg`, aba "V4 Clientes".
"Empresa Endereço" = linha completa concatenada; "Empresa Rua" = logradouro; + Complemento/Cidade/Estado/CEP.

## GHL

Location `ElbRWEbPclFoAfVW9bm0`. Upsert **Contact** (name, email, phone, companyName, address, country + custom fields
tax_id/regime) → criar **Opportunity** no pipeline "01 Marketing Pipeline" (stage inicial) ligada ao contato, com
source/nome do afiliado. `pipeline_id`/`stage_id` mapeados em impl-time via API GHL.

## Arquivos a criar/editar

**Frontend (`services/web/`):** Novo `app/new-client/[lang]/page.tsx`, `components/NewClientWizard.tsx`,
`components/newclient/*` (steps+progress se crescer), `lib/new-client-i18n.ts`, `public/logos/*`.
Editar `lib/api.ts` (+ `submitNewClient` + tipo).

**Backend (Painel `execution/`):** Editar `api/siteRoutes.py` (modelo `NewClientOnboarding` + handler),
`core/config.py` (campos GOWA send-url, Google SA/SHEET_ID, GHL token/location/pipeline). Novos
`database/migration_client_onboarding.sql`, `integrations/gowaClient.py`, `integrations/googleSheets.py`,
`integrations/ghlClient.py`. Dep `requirements.txt` (+ `google-api-python-client`, `google-auth`; GOWA/GHL usam httpx).

## Reuso
- Front: `lib/api.ts` `postJson`/`ApiResult`/timeout/429 · máquina de estado dos forms · tokens Tailwind ·
  `[slug]`+`generateStaticParams` de `produtos/[slug]`.
- Painel: `enforceRateLimit`/`getClientIp`, `getPool`, `EMAIL_PATTERN`/`TrackingPayload`/padrão de handler,
  `_findAffiliate` (`ingestService.py`), bloco best-effort try/except (`affiliateRoutes.py:197-254`),
  padrão `httpx.AsyncClient` (`integrations/evolutionClient.py`).

## Success Criteria / Verificação
- Front: `NODE_ENV=production npm run build` passa; wizard navega P1→obrigado nos 2 idiomas; `?ref=CODE` no payload;
  validação por etapa; regime só com BR; método de pagamento por país.
- Back: `POST /public/new-client` válido → 201 `{ok,id}`; linha em `client_onboarding` com `affiliate_id` quando
  `ref_code` válido; `extra='forbid'` → 422 em campo extra; rate-limit 429 após 5.
- Side-effects (com creds): WhatsApp responsável+admin (GOWA); linha na "V4 Clientes"; contato+opportunity GHL.
  Sem creds → persiste e loga skip.
- Prod (R24, pós-push ≥01/07): smoke + 1 cadastro real E2E + limpeza.
