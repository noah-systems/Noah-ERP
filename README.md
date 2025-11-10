# Noah ERP

ERP da Noah Omni com frontend em Vite/React e API em NestJS/Sequelize.

## Requisitos de Sistema

Para um deploy manual completo (sem Docker) recomenda-se garantir os seguintes componentes instalados e atualizados:

- Node.js 20 ou superior.
- PostgreSQL 15 ou superior com acesso local para o usuário da aplicação.
- Redis 6+ em execução local para filas (opcional, porém recomendado).
- Servidor HTTP (Nginx, Caddy, etc.) para servir o frontend compilado e atuar como reverse proxy para a API.

## Instalação Manual

1. **Configure o ambiente:** copie `.env.example` para `.env` e defina valores seguros (senhas, URLs públicas, origens de CORS etc.). Os placeholders indicados devem ser substituídos antes de iniciar a aplicação.
   > ℹ️  A API também aceita um arquivo dedicado em `apps/api/.env`; ajuste conforme o ambiente que estiver configurando.
2. **Provisionamento do banco:** utilize o script [`database-setup.sql`](./database-setup.sql) como ponto de partida ou crie manualmente um banco PostgreSQL 15+ com usuário dedicado. Ajuste a senha no script antes de executá-lo com `psql`.
3. **Redis:** execute uma instância Redis 6+ acessível pela URL definida em `REDIS_URL`.
4. **Instalar dependências:**
   ```bash
   npm ci
   npm --prefix apps/api install
   ```
5. **Migrations e seeds:**
   ```bash
   npm --prefix apps/api run db:migrate
   npm --prefix apps/api run db:seed
   ```
   Isso garante a criação das tabelas e do usuário administrador padrão informado nas variáveis `ADMIN_*`.
6. **Build de produção:**
   ```bash
   npm run build:web
   npm run build:api
   ```
7. **Serviços de backend:** execute a API compilada (ex.: via systemd) e configure o worker BullMQ/Redis. Para o frontend, sirva o diretório `dist/` e encaminhe `/api` para a API Node.

## Uso com Docker Compose

Um ambiente de desenvolvimento/validação está disponível via `docker compose` na raiz do projeto. O serviço `api` aguarda o PostgreSQL iniciar (`pg_isready`) e executa automaticamente `npx sequelize-cli db:migrate` seguido de `db:seed:all` antes de subir a API.

```bash
docker compose up --build
```

As credenciais padrão podem ser substituídas pelas variáveis `POSTGRES_*`, `DATABASE_URL`, `REDIS_URL` e `ADMIN_*`. Ajuste os valores em `.env` ou exporte-os antes de iniciar os containers.

## Verificação

Para validar rapidamente a instalação, utilize o smoke test Playwright (exige API, banco e Redis funcionando):

```bash
npm run qa:smoke
```
