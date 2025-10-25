# Noah ERP

## Instalação Rápida

### Docker (produção local)
```bash
cp .env.example .env
# edite ADMIN_* e JWT_SECRET
docker compose -f docker/compose.prod.yml up -d --build
./scripts/ci_validate.sh

Dev
make dev
# web: http://localhost:5173 | api: http://localhost:3000/api/health

Bare-metal (Rocky Linux)
sudo bash scripts/install-noah-baremetal.sh \
  DOMAIN_WEB="erp.noahomni.com.br" DOMAIN_API="erpapi.noahomni.com.br" \
  ADMIN_EMAIL="admin@noahomni.com.br" ADMIN_PASSWORD="troque" DB_PASS="noah"
```

---

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
   npm --prefix apps/api run prisma:migrate
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

- Para reproduzir o smoke test oficial em Docker local, defina `ADMIN_EMAIL`/`ADMIN_PASSWORD` com as credenciais temporárias e execute:
  ```bash
  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='TroqueEstaSenha123!' ./scripts/ci_validate.sh
  ```
  O script sobe `db`, `redis` e `api` a partir de [`docker/compose.prod.yml`](docker/compose.prod.yml), aguarda o endpoint `/api/health` responder e valida o login do administrador via `/api/auth/login`.
- Para validar rapidamente o ambiente publicado (API + front) utilize o script de fumaça oficial `./scripts/noah_e2e_check.sh`, informando as credenciais reais via `--admin-email`/`--admin-pass`.
- Consultar [docs/QA.md](docs/QA.md) para a lista completa de comandos manuais (cURLs obrigatórios, prints e checklist por papel).
- Para um diagnóstico rápido do ambiente após merges na `main`, confira [docs/post-merge-diagnostic.md](docs/post-merge-diagnostic.md).


## Produção (Docker)
0. Prepare o servidor com os diretórios de configuração e aponte o Nginx inicial para HTTP:
   ```bash
   sudo mkdir -p /opt/noah-erp/nginx /opt/noah-erp/certbot-webroot
   sudo cp docker/proxy/default.http.conf /opt/noah-erp/nginx/default.http.conf
   ```
1. Exporte um `.env` a partir de [.env.example](.env.example) (substitua `JWT_SECRET`, `POSTGRES_PASSWORD` e `LE_EMAIL` por valores reais; lembre-se de escapar `@` como `%40` na `DATABASE_URL`).
2. Construa as imagens e suba os serviços base (PostgreSQL, Redis e proxy em HTTP):
   ```bash
   docker compose -f docker/compose.prod.yml build api web
   docker compose -f docker/compose.prod.yml up -d db redis proxy
   docker compose -f docker/compose.prod.yml up -d api web
   ```
3. Emita o certificado TLS e troque o proxy para HTTPS:
   ```bash
   bash scripts/issue-cert-and-switch.sh erp.noahomni.com.br
   ```
4. Valide o ambiente:
   ```bash
   curl -fsS https://erp.noahomni.com.br/api/health && echo OK
   curl -fsS -X POST https://erp.noahomni.com.br/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@noahomni.com.br","password":"TroqueEssaSenha123"}' | head
   ```
5. Atualize a identidade visual copiando os assets PNG para `apps/web/public/brand/` e rebuildando a imagem da web quando necessário:
   ```bash
   docker compose -f docker/compose.prod.yml build web
   docker compose -f docker/compose.prod.yml up -d web
   ```

## Backend (bare metal)

```bash
cd apps/api
# mantenha o arquivo real de variáveis em /etc/noah-erp/api.env e faça o symlink abaixo
sudo mkdir -p /etc/noah-erp
sudo cp .env.example /etc/noah-erp/api.env  # personalize valores seguros
ln -sf /etc/noah-erp/api.env .env

npm install
npm run prisma:generate
npm run prisma:migrate
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

O schema oficial mora em [`prisma/schema.prisma`](prisma/schema.prisma) e contempla:

- Usuários (`User`) com papéis `ADMIN` ou `USER`
- Leads (`Lead`) com estágios (`LeadStage`) e origens (`Source`)
- Oportunidades (`Opportunity`) com estágios (`OpportunityStage`)

O seed [`prisma/seed.js`](prisma/seed.js) cria o usuário admin definido nas variáveis `ADMIN_EMAIL`/`ADMIN_PASSWORD` (sem valores padrão em produção; defina via `.env`).

## Front-end

- Configuração de tema: [`tailwind.config.ts`](tailwind.config.ts) referencia as variáveis CSS definidas em [`src/styles/globals.css`](src/styles/globals.css) / [`src/theme.css`](src/theme.css) para manter contraste e foco alinhados ao design system.
- Os assets de marca ficam em [`public/brand`](public/brand); ajuste `VITE_LOGO_*`/`VITE_LOGIN_BG*` no `.env` para apontar para os arquivos hospedados localmente (por exemplo, `/brand/logo.svg`).
- A tela de login (`src/pages/Login.tsx`) realiza autenticação real utilizando [`src/services/api.ts`](src/services/api.ts), que persiste o token JWT em `localStorage`.

## Boas práticas

- Nunca comite arquivos `.env` reais.
- Gere um novo `JWT_SECRET` para cada ambiente (evite utilizar valores do README em produção).
- Altere a senha padrão do admin após o primeiro login em produção e guarde as credenciais em cofre seguro.
- Mantenha `POSTGRES_PASSWORD`/`DATABASE_URL` sincronizados entre Docker Compose, scripts bare-metal e variáveis de ambiente exportadas.
