# Logos — página /new-client (welcome)

Arquivos reais fornecidos pelo operador (2026-07-12) e usados na tela de boas-vindas
do wizard `app/new-client/[lang]` (`WelcomeStep` em `components/NewClientWizard.tsx`).

| Marca            | Arquivo               | Uso                                  |
|------------------|-----------------------|--------------------------------------|
| Hub Operacional  | `hub-operacional.png` | logo principal (HOPE — hero, topo)   |
| Edifica Express  | `edifica-express.png` | linha de marcas (secundária)         |
| V4 Company       | `v4-company.png`      | linha de marcas (secundária)         |
| Micro Investors  | `micro-investors.png` | linha de marcas (secundária)         |
| ADS4Pros         | `ads4pros.png`        | linha de marcas (secundária)         |

Ordem e caminhos vêm de `WELCOME_BRANDS` em `services/web/lib/new-client-i18n.ts`
(primeiro item = hero). Renderizados via `next/image` com `images.unoptimized`
(runtime standalone `node:20-slim` não tem sharp). Para trocar um logo: substituir o
PNG mantendo o nome, ou editar `WELCOME_BRANDS`.

> Nota: `Logo Hope Transparente.png` (nome original) = a marca **HOPE / Hub Operacional** —
> renomeado para `hub-operacional.png`.
