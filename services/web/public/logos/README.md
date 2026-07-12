# Logos — página /new-client (welcome)

O wizard `app/new-client/[lang]` mostra 4 marcas na tela de boas-vindas. Enquanto os
arquivos não chegam, `components/NewClientWizard.tsx` (`WelcomeStep`) renderiza
**placeholders textuais** — nenhum `<img>` aponta pra cá ainda, então não há 404.

Quando o operador fornecer os arquivos, colocar aqui (SVG preferido, ou PNG com fundo
transparente) e trocar os placeholders textuais por `<Image>`/`<img>`:

| Marca            | Arquivo esperado            | Uso na tela                        |
|------------------|-----------------------------|------------------------------------|
| Hub Operacional  | `hub-operacional.svg`       | logo principal (topo, destaque)    |
| Edifica Express  | `edifica-express.svg`       | linha de marcas (secundária)       |
| V4 Company       | `v4-company.svg`            | linha de marcas (secundária)       |
| Micro Investors  | `micro-investors.svg`       | linha de marcas (secundária)       |

Ordem e rótulos vêm de `WELCOME_BRANDS` em `services/web/lib/new-client-i18n.ts`.
