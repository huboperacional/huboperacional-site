# CONTEXT — huboperacional-site

Linguagem deste domínio. Um termo, um significado. (Glossário — não é implementação, decisão nem estado.)

## huboperacional
A **holding** que controla as empresas do grupo, e a marca deste site vitrine (`huboperacional.com.br`).
**Não confundir com:** ads4pros (uma das empresas/marcas sob a holding), nem com Painel (o sistema de gestão).

## ads4pros
A **agência de tráfego** — marca de produto sob a holding, com site próprio (`ads4pros.com`) e LPs. Dona do domínio `api.ads4pros.com` que este site consome.
**Não confundir com:** huboperacional (a holding acima dela).

## Painel (Gestão)
O **sistema de registro** dos afiliados/leads/comissões/payouts (repo `Gestao-Projetos-Afiliados`, backend `api.ads4pros.com`). É o dono dos dados.
**Não confundir com:** este site — que é só o **topo de funil** (formulários), sem backend/banco/auth próprios.

## Lead
Contato do form `/contato` → tabela `site_leads` no Painel.
**Não confundir com:** Afiliado — que é cadastro no programa de parceiros, não um contato comercial.

## Afiliado
Cadastro do form `/afiliados` (`createAffiliate` + welcome WhatsApp). "Parceiro" é o termo de UI; **Afiliado** é o canônico.
**Não confundir com:** Cliente — o afiliado *indica*; o cliente *compra*.

## Cliente (new-client)
Cadastro do wizard `/new-client` — onboarding de um cliente pagante (empresa).
**Não confundir com:** Afiliado (topo de funil de indicação) nem Lead (contato solto).

## ref_code
Código de indicação único do afiliado, formato `nome-sobrenome-xxxx`. Vai nos links (`vendas.ads4pros.com/i/<ref_code>/<produto>`).

## Tracking
Atribuição **sempre-ligada** (15 campos canon R2, `localStorage` TTL 90d) anexada a toda submission pro Painel.
**Não confundir com:** Analytics — que é **consent-gated** (GA4 + Meta Pixel, só após aceite LGPD) e serve *medição*, não *atribuição*. `tracking.ts` nunca depende de consent.

## MODO DEMO
Banner obrigatório numa tela com dado **mock** (R3), com toast "salvo localmente".
**Não confundir com:** os 9 produtos em `lib/products.ts` — que são **conteúdo estático intencional**, não mock (não levam banner).
