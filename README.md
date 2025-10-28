# Noah ERP

ERP da Noah Omni com frontend em Vite/React e API em NestJS/Prisma.

## Requisitos

- Node.js >= 20 (recomendado utilizar `nvm` ou pacote oficial do Rocky 9)
- PostgreSQL 14+ acessível em `localhost:5432`
- Redis 6+ (opcional, mas recomendado para filas e cache)

## Configuração sem Docker

1. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis obrigatórias (`DATABASE_URL`, `JWT_SECRET`, credenciais do admin e host/porta do Redis).
2. Instale as dependências do monorepo:
   ```bash
   npm ci
   ```
3. Gere o client Prisma apontando para o schema em `prisma/schema.prisma`:
   ```bash
   npm run prisma:generate
   ```
4. Aplique as migrations no banco configurado (a base pode estar vazia):
   ```bash
   npm run prisma:migrate
   ```
   Execute `node prisma/seed.js` caso deseje criar o usuário administrador padrão.
5. Faça o build do frontend e da API:
   ```bash
   npm run build:web
   npm run build:api
   ```
6. Suba a API já compilada (idealmente atrás do PM2) e teste o endpoint `/health`:
   ```bash
   pm2 start npm --name noah-api -- run start:api
   curl http://localhost:3001/health
   ```
7. O frontend compilado fica em `dist/` e pode ser servido pelo Nginx apontando `/api` para a API Node.

Para validar rapidamente a instalação, utilize o smoke test Playwright (exige API e banco funcionando):

```bash
npm run qa:smoke
```
