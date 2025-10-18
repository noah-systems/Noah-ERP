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
5. Popule dados básicos (admin + registros de exemplo):
   ```bash
   npm --prefix api run seed
   ```
6. Inicie a API e o front em terminais separados:
   ```bash
   npm --prefix api run dev   # Express em http://localhost:3000
   npm run dev                # Vite em http://localhost:5173
   ```

O front consome a API através da variável `VITE_API_BASE`. Por padrão, o valor `/api` já está definido em [.env.example](.env.example).

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
curl -sf http://127.0.0.1:3000/api/health
```

## Endpoints principais

- `GET /api/health` – health check simples (`{"ok": true}`)
- `POST /api/auth/login` – autenticação por e-mail/senha; retorna JWT e dados do usuário
- `GET /api/auth/me` – dados do usuário autenticado
- `GET /api/leads` / `POST /api/leads`
- `GET /api/opportunities` / `POST /api/opportunities`

## Estrutura do Prisma

O schema mínimo está em [`api/prisma/schema.prisma`](api/prisma/schema.prisma) e contempla:

- Usuários (`User`) com papéis `ADMIN` ou `USER`
- Leads (`Lead`) com estágios (`LeadStage`) e origens (`Source`)
- Oportunidades (`Opportunity`) com estágios (`OpportunityStage`)

O seed [`api/prisma/seed.js`](api/prisma/seed.js) cria/atualiza o usuário admin definido nas variáveis `ADMIN_EMAIL`/`ADMIN_PASSWORD` e insere registros seguros para testes.

## Front-end

- Configuração de tema: [`tailwind.config.ts`](tailwind.config.ts) estende as cores `primary` (`#C3FF00`) e `dark` (`#0A0A0A`).
- A tela de login (`src/pages/Login.tsx`) realiza autenticação real utilizando [`src/services/api.ts`](src/services/api.ts), que persiste o token JWT em `localStorage`.

## Boas práticas

- Nunca comite arquivos `.env` reais.
- Gere um novo `JWT_SECRET` para cada ambiente.
- Altere a senha padrão do admin após o primeiro login em produção.
