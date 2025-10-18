# Noah ERP

Este repositório reúne o front-end (Vite + React) e a API (Express + Prisma) utilizados no ERP da Noah Omni.

## Requisitos

- Node.js 20 (arquivo [`.nvmrc`](.nvmrc) aponta para a versão suportada)
- PostgreSQL 14+

## Ambiente de desenvolvimento

1. Copie os exemplos de variáveis:
   ```bash
   cp api/.env.example api/.env
   cp .env.example .env
   ```
2. Ajuste `api/.env` com a sua URL de banco e segredos.
3. Instale as dependências:
   ```bash
   npm install
   npm --prefix api install
   ```
4. Gere o cliente do Prisma e aplique o schema no banco local:
   ```bash
   npm --prefix api run prisma:generate
   npm --prefix api run prisma:push
   ```
5. Popule dados básicos (admin). Você pode sobrescrever o e-mail/senha com `SEED_ADMIN_*`:
   ```bash
   SEED_ADMIN_EMAIL=admin@noahomni.com.br SEED_ADMIN_PASS='troque-esta-senha' npm --prefix api run seed
   ```
6. Inicie a API e o front em terminais separados:
   ```bash
   npm --prefix api run dev   # Express em http://localhost:3000
   npm run dev                # Vite em http://localhost:5173
   ```

O front consome a API através da variável `VITE_API_BASE`. Por padrão, o valor `/api` já está definido em [.env.example](.env.example).

## Validação automatizada

- Para reproduzir os testes de fumaça utilizados na esteira, execute:
  ```bash
  ./scripts/ci_validate.sh
  ```
  O script compila API e web, sobe `docker/compose.prod.yml`, roda health checks (`/api/worker/health`), valida ACLs (403 para `SELLER` em `/api/users`), testa CORS e derruba os contêineres ao final.
- Para validar rapidamente o ambiente publicado (API + front) utilize o script de fumaça oficial:
  ```bash
  ./scripts/noah_e2e_check.sh \
    --front erp.noahomni.com.br \
    --api erpapi.noahomni.com.br \
    --admin-email admin@noahomni.com.br \
    --admin-pass 'D2W3£Qx!0Du#'
  ```
  Ele confere o health-check (`/ping`), realiza login e percorre o fluxo "criar → mover → listar → excluir" de leads.
- Consultar [docs/QA.md](docs/QA.md) para a lista completa de comandos manuais (cURLs obrigatórios, prints e checklist por papel).
- Para um diagnóstico rápido do ambiente após merges na `main`, confira [docs/post-merge-diagnostic.md](docs/post-merge-diagnostic.md).

## Backend (bare metal)

```bash
cd api
# mantenha o arquivo real de variáveis em /etc/noah-erp/api.env e faça o symlink abaixo
sudo mkdir -p /etc/noah-erp
sudo cp .env.example /etc/noah-erp/api.env  # personalize valores seguros
ln -sf /etc/noah-erp/api.env .env

npm install
npx prisma generate
npx prisma db push
npm run seed
npm run start

# health-check
curl -sf http://127.0.0.1:3000/ping
```

## Endpoints principais

- `GET /ping` – health check simples (`{"ok": true}`) exposto direto no Express
- `GET /api/health` – health check legado mantido no router
- `POST /api/auth/login` – autenticação por e-mail/senha; retorna JWT e dados do usuário
- `GET /api/auth/me` – dados do usuário autenticado
- `GET /api/leads` / `POST /api/leads`
- `GET /api/opportunities` / `POST /api/opportunities`

## Estrutura do Prisma

O schema mínimo está em [`api/prisma/schema.prisma`](api/prisma/schema.prisma) e contempla:

- Usuários (`User`) com papéis `ADMIN` ou `USER`
- Leads (`Lead`) com estágios (`LeadStage`) e origens (`Source`)
- Oportunidades (`Opportunity`) com estágios (`OpportunityStage`)

O seed [`api/prisma/seed.js`](api/prisma/seed.js) cria o usuário admin definido nas variáveis `SEED_ADMIN_*` (e registra no log caso já exista).

## Front-end

- Configuração de tema: [`tailwind.config.ts`](tailwind.config.ts) estende as cores `primary` (`#C3FF00`) e `dark` (`#0A0A0A`).
- A tela de login (`src/pages/Login.tsx`) realiza autenticação real utilizando [`src/services/api.ts`](src/services/api.ts), que persiste o token JWT em `localStorage`.

## Boas práticas

- Nunca comite arquivos `.env` reais.
- Gere um novo `JWT_SECRET` para cada ambiente (evite utilizar valores do README em produção).
- Altere a senha padrão do admin após o primeiro login em produção e guarde as credenciais em cofre seguro.
- Mantenha `POSTGRES_PASSWORD`/`DATABASE_URL` sincronizados entre Docker Compose, scripts bare-metal e variáveis de ambiente exportadas.
