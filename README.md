# Noah ERP

ERP da Noah Omni com frontend em Vite/React e API em NestJS/Prisma.

## Passo a passo

1. Ajuste variáveis de ambiente (exemplos em `.env.example` e `apps/api/.env.example`):
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `FRONTEND_ORIGIN`
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
2. Instale as dependências:
   ```bash
   npm ci
   npm ci --prefix apps/api
   ```
3. Gere o client Prisma e aplique migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   node prisma/seed.js # opcional (cria usuário admin)
   ```
4. Build do frontend:
   ```bash
   npm run build:web
   ```
5. Build da API:
   ```bash
   cd apps/api
   npm run build
   ```
6. Smoke test (API deve estar rodando e DATABASE_URL configurada):
   ```bash
   npm run qa:smoke
   ```

A API sobe com `npm run start` dentro de `apps/api` (utilize PM2 em produção) e o frontend gerado em `dist/` pode ser servido via Nginx apontando `/api` para a API.
