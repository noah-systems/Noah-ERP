# Noah ERP

Este repositório reúne o front-end (Vite + React) e a API (NestJS + Prisma) utilizados no ERP da Noah Omni.

➡️ Consulte a seção [Validação automatizada](#validação-automatizada) para o roteiro oficial de smoke tests.

## Requisitos

- Node.js 20 (arquivo [`.nvmrc`](.nvmrc) aponta para a versão suportada)
- PostgreSQL 14+

## Ambiente de desenvolvimento

1. Copie os exemplos de variáveis:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp .env.example .env
   ```
2. Ajuste `apps/api/.env` com a sua URL de banco e segredos (fuja de credenciais reais; lembre-se de escapar `@` como `%40`).
3. Instale as dependências:
   ```bash
   npm install
   npm --prefix apps/api install
   ```
4. Gere o cliente do Prisma e aplique o schema no banco local:
   ```bash
   npm --prefix apps/api run prisma:generate
   npm --prefix apps/api run prisma:migrate:deploy
   ```
5. Popule dados básicos (admin). Utilize variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_NAME` com valores fictícios:
   ```bash
   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='TroqueEstaSenha123!' npm --prefix apps/api run prisma:seed
   ```
6. Inicie a API e o front em terminais separados (recompile a API quando alterar código backend):
   ```bash
   npm --prefix apps/api run build && npm --prefix apps/api run start:prod   # NestJS em http://localhost:3000/api
   npm run dev                # Vite em http://localhost:5173
   ```

   > Dica: o atalho `./scripts/install_dev.sh` (ou `make dev`) automatiza os passos acima. Para subir o ambiente completo via Docker Compose utilize `./scripts/dev-up.sh`.

O front consome a API através da variável `VITE_API_BASE`. Por padrão, o valor `/api` já está definido em [.env.example](.env.example).

## Validação automatizada

- Para reproduzir os testes de fumaça utilizados na esteira, execute:
  ```bash
  ./scripts/ci_validate.sh
  ```
  O script compila API e web, sobe `docker/compose.prod.yml`, roda health checks (`/api/worker/health`), valida ACLs (403 para `SELLER` em `/api/users`), testa CORS e derruba os contêineres ao final.
- Para validar rapidamente o ambiente publicado (API + front) utilize o script de fumaça oficial `./scripts/noah_e2e_check.sh`, informando as credenciais reais via `--admin-email`/`--admin-pass`.
- Consultar [docs/QA.md](docs/QA.md) para a lista completa de comandos manuais (cURLs obrigatórios, prints e checklist por papel).
- Para um diagnóstico rápido do ambiente após merges na `main`, confira [docs/post-merge-diagnostic.md](docs/post-merge-diagnostic.md).

## Backend (bare metal)

```bash
cd apps/api
# mantenha o arquivo real de variáveis em /etc/noah-erp/api.env e faça o symlink abaixo
sudo mkdir -p /etc/noah-erp
sudo cp .env.example /etc/noah-erp/api.env  # personalize valores seguros
ln -sf /etc/noah-erp/api.env .env

npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run build
npm run start:prod

# health-check
curl -sf http://127.0.0.1:3000/api/worker/health
```

## Endpoints principais

- `GET /api/worker/health` – health check do worker usado pelo monitoramento
- `GET /api/health` – endpoint agregado (DB/Redis) exposto pelo NestJS
- `POST /api/auth/login` – autenticação por e-mail/senha; retorna JWT e dados do usuário
- `GET /api/auth/me` – dados do usuário autenticado
- `GET /api/leads` / `POST /api/leads`
- `GET /api/opportunities` / `POST /api/opportunities`

## Estrutura do Prisma

O schema mínimo está em [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) e contempla:

- Usuários (`User`) com papéis `ADMIN` ou `USER`
- Leads (`Lead`) com estágios (`LeadStage`) e origens (`Source`)
- Oportunidades (`Opportunity`) com estágios (`OpportunityStage`)

O seed [`apps/api/prisma/seed.js`](apps/api/prisma/seed.js) cria o usuário admin definido nas variáveis `ADMIN_EMAIL`/`ADMIN_PASSWORD` (sem valores padrão em produção; defina via `.env`).

## Front-end

- Configuração de tema: [`tailwind.config.ts`](tailwind.config.ts) estende as cores `primary` (`#C3FF00`) e `dark` (`#0A0A0A`).
- A tela de login (`src/pages/Login.tsx`) realiza autenticação real utilizando [`src/services/api.ts`](src/services/api.ts), que persiste o token JWT em `localStorage`.

## Boas práticas

- Nunca comite arquivos `.env` reais.
- Gere um novo `JWT_SECRET` para cada ambiente (evite utilizar valores do README em produção).
- Altere a senha padrão do admin após o primeiro login em produção e guarde as credenciais em cofre seguro.
- Mantenha `POSTGRES_PASSWORD`/`DATABASE_URL` sincronizados entre Docker Compose, scripts bare-metal e variáveis de ambiente exportadas.
