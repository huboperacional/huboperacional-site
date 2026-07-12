# Mock Audit — huboperacional-site

_Atualizado em: 2026-07-12_
_Atualizar a cada sessão que envolva frontend (R3 do `01_REGRAS_INEGOCIAVEIS.md`)._

---

## Legenda

| Status | Significado |
|---|---|
| ✅ real | Persiste via endpoint real (Painel) ou é conteúdo estático intencional (não simula persistência). |
| ⚠️ mock | Tem componente, mas simula persistência com dado local — banner MODO DEMO obrigatório |
| ❌ só UI | Layout sem estado/lógica — placeholder visual |

---

## Tabela de telas

| Tela / Feature | Status | Observação |
|----------------|--------|------------|
| Home `/` | ✅ real | Conteúdo estático (produtos de `lib/products.ts`) — vitrine, não persiste nada |
| Catálogo `/produtos` | ✅ real | Renderiza `PRODUCTS` (const tipada) — conteúdo estático intencional |
| Detalhe `/produtos/[slug]` | ✅ real | SSG a partir de `lib/products.ts` + JSON-LD |
| `/sobre` | ✅ real | Conteúdo estático |
| Form `/contato` | ✅ real | `ContactForm.tsx` → `await submitLead()` → `POST /public/leads` do Painel. Estado `success` só após `result.ok` — **sem toast mentiroso**. |
| Form `/afiliados` | ✅ real | `AffiliateForm.tsx` → `await submitAffiliate()` → `POST /public/affiliate-signup` do Painel |
| Wizard `/new-client/[lang]` | ✅ real | `NewClientWizard.tsx` → `await submitNewClient()` → `POST /public/new-client` do Painel. Tela de "obrigado" (step 5) só renderiza após `result.ok` — **sem toast mentiroso**. Verificado E2E em prod (row persistida). Logos = placeholder textual (não é mock-data; conteúdo pendente do operador, sem MODO DEMO). |

**Nota — produtos estáticos (`lib/products.ts`):** os 8 produtos são **conteúdo de vitrine estático e intencional**, derivado do CLAUDE.md de cada projeto. Não são mock-data simulando um backend ausente, então **não exigem banner MODO DEMO** (R3 trata de dado que finge ter persistido). Curadoria definitiva é do operador (ver Frente Conteúdo no PLANO).

---

## Toasts mentirosos detectados

Nenhum. O projeto **não usa biblioteca de toast** — feedback de form é via estado React (`'idle'|'loading'|'success'|'error'`), e o estado `success` só renderiza após a resposta `ok` da chamada real ao Painel (`ContactForm.tsx:25`, `AffiliateForm.tsx`). Sem `toast.success("Salvo!")` desacoplado de await.

| Arquivo | Linha | Toast atual | Correção sugerida |
|---|---|---|---|
| — | — | (nenhum) | — |

---

## Comandos para auditoria automática (rodar antes de atualizar)

```bash
# uses de mock no frontend
grep -rln "mock-data\|mockData\|MOCK_\|fakeData" services/web --include="*.ts" --include="*.tsx" 2>/dev/null

# toasts mentirosos
grep -rni "toast" services/web --include="*.ts" --include="*.tsx" 2>/dev/null

# arrays hardcoded suspeitos
grep -rn "const.*= \[" services/web/app services/web/components --include="*.tsx" 2>/dev/null | head -20
```

---

## Histórico

- **2026-06-30** — Auditoria inicial ao adotar o canon Percus: 6 telas ✅ real (2 forms com API real do Painel, 4 de conteúdo estático), 0 mocks, 0 só-UI, 0 toasts mentirosos. Produtos de `lib/products.ts` documentados como conteúdo estático intencional.
- **2026-06-30** — Frente SEO (Org/Breadcrumb JSON-LD, Twitter cards, sitemap lastmod): só metadata, sem mudança de UI/estado. Status das telas inalterado.
- **2026-07-12** — Frente v0.3 `/new-client`: nova tela (wizard bilíngue) ✅ real — POSTa pro `POST /public/new-client` do Painel; step "obrigado" gated pelo `result.ok`, sem toast mentiroso. 7 telas ✅ real, 0 mock, 0 só-UI, 0 toasts mentirosos. Logos textuais = placeholder de conteúdo (não mock-data), sem MODO DEMO.
