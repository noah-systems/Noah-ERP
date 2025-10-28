# Noah ERP

Este repositório reúne o front-end (Vite + React) e a API (NestJS + Prisma) utilizados no ERP da Noah Omni.

## Requisitos

- Node.js 20 (o arquivo [`.nvmrc`](.nvmrc) aponta para a versão recomendada)
- npm 10+
- PostgreSQL 14 ou superior
- Redis 6+
- Nginx (para servir o front e fazer o proxy `/api`)
- PM2 (para manter a API em execução em produção)

## Ambiente de desenvolvimento

1. Instale as dependências:
   ```bash
   npm install --ignore-scripts
   npm --prefix apps/api install --ignore-scripts
   ```
2. Gere o cliente Prisma e prepare o banco local:
   ```bash
   npm --prefix apps/api run prisma:generate
   npm --prefix apps/api run prisma:push
   npm --prefix apps/api run prisma:seed
   ```
3. Copie os exemplos de variáveis e ajuste valores fictícios:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   ```
4. Inicie o backend e o frontend:
   ```bash
   npm --prefix apps/api run build && npm --prefix apps/api run start:prod
   npm run dev
   ```
   - API: http://localhost:3000
   - Front: http://localhost:5173 (proxy automático de `/api` para a API local)

> Dica: o script [`scripts/install_dev.sh`](scripts/install_dev.sh) automatiza a configuração para desenvolvimento sem Docker.

## Build do frontend

- Ajuste variáveis em `.env.production` (por padrão `VITE_API_URL=/api`).
- Rode o build padrão do Vite:
  ```bash
  npm run build:web
  ```
- Os arquivos estáticos serão gerados em `dist/`.

## API (NestJS)

```bash
cd apps/api
npm install --ignore-scripts
npm run prisma:generate
npm run build
npm run start:prod
```

- O build TypeScript gera `dist/main.js`.
- A API expõe `GET /health` com o status de API/DB/Redis e data ISO.
- Use `FRONTEND_ORIGIN` para definir o(s) domínio(s) permitidos via CORS (ex.: `http://localhost`).

### PM2

Um arquivo [`apps/api/ecosystem.config.js`](apps/api/ecosystem.config.js) está pronto para produção:

```bash
cd apps/api
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

### Migrations

Scripts relevantes:

```bash
npm run prisma:generate     # gera o client
npm run prisma:migrate:deploy  # aplica migrations
npm run prisma:push            # sincroniza schema em ambientes temporários
npm run prisma:seed            # seed opcional
```

## Nginx (exemplo)

Configure um host que sirva os arquivos estáticos do front (ex.: `/var/www/noah-web`) e faça proxy de `/api` para a API na porta 3000:

```nginx
server {
    listen 80;
    server_name erp.noahomni.com.br;

    root /var/www/noah-web;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Healthcheck

- `GET /health` → `{ ok, api: "up", db, redis, time }`
- `GET /auth/me` → retorna dados do usuário autenticado (requer JWT)
- `GET /leads`, `GET /opportunities` → rotas principais do CRM

## QA Smoke automático

O script [`scripts/qa-smoke.sh`](scripts/qa-smoke.sh) valida rapidamente o ambiente publicado:

```bash
npm run qa:smoke
```

Ele verifica:
- entrega do HTML raiz em `http://localhost/`
- resposta `ok` da API em `http://localhost/api/health`
- (opcional) `SELECT 1` via `psql` se `DATABASE_URL` estiver definido

## Deploy automatizado (bare-metal)

Para uma instalação completa em servidores Rocky Linux sem Docker, utilize o script [`scripts/install-noah-baremetal.sh`](scripts/install-noah-baremetal.sh). Ele provisiona Node, PostgreSQL, Redis, Nginx, aplica migrations, gera o build do frontend e configura a API com PM2.

## Pós-deploy

1. Execute `npm run build:web` e publique `dist/` no diretório servido pelo Nginx.
2. Gere o build da API (`npm --prefix apps/api run build`) e reinicie via PM2.
3. Confirme o healthcheck:
   ```bash
   curl -fsS http://localhost/api/health | jq
   ```
4. Rode o smoke test completo:
   ```bash
   npm run qa:smoke
   ```
5. Altere as credenciais padrão e guarde segredos em local seguro.
