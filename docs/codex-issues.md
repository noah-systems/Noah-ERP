# O que solicitar ao Codex (em issues)

> ℹ️ **Observação sobre assets binários**
>
> O viewer do Codex não exibe diff de arquivos PNG/JPG e costuma mostrar o aviso
> "Arquivos binários não são compatíveis". Isso não bloqueia o fluxo — faça o
> commit normalmente e abra o pull request direto pelo GitHub (Compare & pull
> request da sua branch para `main`).

## 1.1 Monorepo + Fundações

**Título:** Bootstrap monorepo (web + api + worker + infra)

Solicitar a criação de um monorepo com a seguinte estrutura e tecnologias:

- `apps/web`: Next.js 14, TypeScript, Tailwind CSS e shadcn/ui.
- `apps/api`: NestJS, Prisma, PostgreSQL, Zod/DTO e JWT.
- `apps/worker`: BullMQ/Redis para jobs Trial/D−5.
- `prisma/`: schema, migrations e seed.
- `docker/compose.dev.yml` e `docker/compose.prod.yml`: serviços de db, redis, api, web, worker e proxy HTTPS.
- `.github/workflows/ci.yml`: pipeline de build e testes.

Regras adicionais:

- Implementar RBAC com os papéis: `ADMIN_NOAH`, `SUPPORT_NOAH`, `FINANCE_NOAH`, `SELLER`, `PARTNER_MASTER`, `PARTNER_FINANCE`, `PARTNER_OPS`.
- Definição de pronto: `docker compose -f docker/compose.dev.yml up -d && pnpm dev` deve levantar todo o ambiente.

## 1.2 Backend funcional (API + banco + usuário master)

**Título:** API funcional com modelos, endpoints e seeds (inclui usuário master)

Solicitar a implementação dos modelos e seeds Prisma:

- `User`, `Lead`, `LeadStatus` (campo `tmkReasonRequired`), `Opportunity`, `OpportunityStage` (campo `lostReasonRequired`), `OppHistory`, `HostingProvider`, `PriceItem` (campos `channel`, `kind`), `PriceTier` (tier `WHITE_LABEL`), `DiscountPolicy` (campos `role`, `maxPercent`), `ImplementationTask`, `CanceledSale`, `Partner`, `PartnerAccount` (campo `status`), `PartnerAccountEvent`, `AuditLog`, `ModuleFlags` (campos `campaign`, `crm`, `voip`, `glpi`).

Seeds obrigatórios:

- Status de Lead: `Nutrição`, `Não Qualificado*`, `Qualificado`.
- Etapas de Oportunidade: `Negociação → Apresentação → Proposta → Trial → Vencimento Trial → Ganha → Perdida*`.
- Pricing: Noah e White Label com tiers WL `1–19`, `20–39`, `40–79`, `80+`.
- Usuário master (`ADMIN_NOAH`) criado via `apps/api/prisma/seed.js` usando variáveis de ambiente:
  - `MASTER_NAME=Admin Noah`
  - `MASTER_EMAIL=admin@noahomni.com.br`
  - `MASTER_PASSWORD=TroqueEssaSenha`

Endpoints a serem expostos:

- **Auth:** `POST /auth/login`, `GET /me`.
- **Leads:** `GET/POST /leads`, `PATCH /leads/:id/status` (se "Não Qualificado", exigir `tmkReason`).
- **Oportunidades:** `GET /opps`, `POST /opps`, `PATCH /opps/:id/stage`, `POST /opps/:id/pricing`, `POST /opps/:id/lost`.
- **Implantação:** `GET /impl`, `PATCH /impl/:id` (agendar/concluir/no-show).
- **Partner:** `POST /partners`, `POST /partners/:id/accounts`, `POST /accounts/:id/change-requests`, `PATCH /accounts/:id/resolve-change`.
- **Pricing Admin:** `GET/POST /pricing/items`, `/pricing/tiers`, `/pricing/discount-policy`.

Regras de negócio:

- Ao entrar em Trial, criar `ImplementationTask` e remover do pipeline de Vendas (migrar para Implantação).
- Em D−5 do Trial, retornar para Vendas na etapa "Vencimento Trial".
- Descontos somente para canal `INTERNAL` e limitados pela `DiscountPolicy` do respectivo `role`; White Label não recebe desconto.

Testes necessários:

- Pelo menos um teste end-to-end para o fluxo `Lead → Opp → Trial → D−5`.
- Testes de Pricing: `INTERNAL` com desconto e White Label com tier e sem desconto.

Definição de pronto: `prisma migrate deploy` seguido de `prisma db seed` cria toda a estrutura, inclusive o usuário master.

## 1.3 Web app (rotas + telas do Figma)

**Título:** Telas do Figma (CRM, Vendas, Implantação, Canceladas, Partner, Config)

Solicitar a criação do app Next.js (App Router) com as rotas:

- `/(crm)/leads` — lista/kanban, filtros e botão "Novo Lead".
- `/(crm)/leads/[id]` — abas: Resumo, Atividades, Anexos.
- `/(sales)/oportunidades` — kanban completo.
- `/(sales)/oportunidades/[id]` — abas: Cliente, Conta, Valores & Preços, Histórico, Perda.
- `/(impl)/implantacao` — kanban com colunas pendente, agendado, realizada, no-show.
- `/(canceladas)/vendas` — tabela de vendas canceladas.
- `/(partner)/dashboard`, `/parceiros/new`, `/contas/new`.
- `/(settings)/statuses`, `/settings/stages`, `/settings/hosting`, `/settings/pricing`.

Componentes essenciais:

- Kanban, DataTable, Modal, Timeline, `SubdomainField` (sufixo fixo `noahomni.com.br`), Money/Discount.

Regras de visibilidade:

- Percentual de desconto visível apenas para roles internos.
- Informações de Hospedagem/IP visíveis apenas para Admin/Suporte (tanto em UI quanto em API).

## 1.4 "Tudo configurável" (painel Admin)

**Título:** Configurações completas (sem nada hardcoded)

Solicitar os CRUDs e telas para:

- Status de Lead (incluindo cor e `tmkReasonRequired`).
- Etapas do pipeline (ordem e `lostReasonRequired`).
- Catálogo de Preços (Noah) e `PriceTier` WL.
- Política de Desconto por role (apenas canal INTERNAL).
- Fornecedores de Hospedagem + IP (acesso restrito).
- Parâmetros: duração do Trial (dias), janela D−5 e dia base.
- Branding Partner (apelido, domínio, tabela própria).

Definição de pronto: Qualquer alteração refletida no cálculo e nas telas, com persistência no banco de dados.

## 1.5 Branding Noah via ENV (logo/cores)

**Título:** Logo via ENV + tokens de cor da Noah (não pode sumir nem distorcer)

Solicitar:

- `apps/web/.env.example` com variáveis:
  - `NEXT_PUBLIC_NOAH_APP_NAME=Noah ERP`
  - `NEXT_PUBLIC_LOGO_LIGHT=https://.../noah-logo-light.png`
  - `NEXT_PUBLIC_LOGO_DARK=https://.../noah-logo-dark.png`
  - `NEXT_PUBLIC_FAVICON=https://.../favicon.png`
  - `NEXT_PUBLIC_APPLE_TOUCH=https://.../apple-touch.png`
    - `NEXT_PUBLIC_THEME_COLOR=#A8E60F`
- `public/brand/*` com fallbacks para garantir que os assets nunca sumam.
- `src/styles/brand.css` com tokens vindos do Figma (variáveis CSS) e `tailwind.config.ts` mapeando `brand.*`.
- Componente `BrandLogo` lendo as variáveis de ambiente (`light`/`dark`) sem aplicar filtros (ex.: `invert`).


### Texto curto sugerido para issue (backend funcional)

> Gerar Backend funcional (NestJS + Prisma + PostgreSQL + Redis) com os arquivos acima. Incluir migrations, seed com pricing e usuário master via ENV, endpoints de auth/leads/opps/implantação/pricing/partner (stubs ok), e módulo worker com jobs Trial (7 dias) e D−5. Confirmar que docker/compose.dev.yml sobe tudo e que npm run deploy:migrate && npm run seed funcionam.
