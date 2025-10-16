# Noah ERP Mockups

Este repositório contém a base de código Vite + NestJS + Prisma utilizada para validar o Noah ERP de ponta a ponta (login, ACL, cadastros e integrações). O layout deriva do [Figma oficial](https://www.figma.com/design/7bPowTaiTuZjAda0gbT0aL/Noah-ERP-Mockups) e foi adaptado para funcionar com a API real.

## Desenvolvimento local

1. Instale as dependências com `npm install` na raiz do projeto.
2. Inicie a aplicação web com `npm run dev`.
3. Para levantar o Postgres + Redis locais utilize `docker compose -f docker/compose.dev.yml up -d db redis`.
4. A URL do banco consumida pelo Prisma local fica em `prisma/.env` (`postgres://noah:noah@localhost:5432/noah`).
5. Ao executar os comandos Prisma dentro do contêiner da API, as variáveis `DATABASE_URL` e `REDIS_URL` apontam para `db` e `redis` respectivamente, evitando erros `P1001` por hostname incorreto.

### Scripts auxiliares

- `scripts/prisma_migrate_deploy.sh`: roda `prisma validate`, `prisma generate` e `prisma migrate deploy` aguardando o banco ficar disponível.
- `scripts/update_and_rebuild.sh`: reproduz o fluxo de atualização utilizado no servidor (parar serviços, rebuild, migrations e seed idempotente do admin).

## Instalação em produção

As instruções abaixo assumem um host limpo com Docker + Docker Compose instalados e DNS já apontando para o servidor.

### 1. Clonar o projeto e preparar variáveis

```bash
sudo mkdir -p /opt/noah-erp
cd /opt/noah-erp
git clone https://github.com/noah-systems/Noah-ERP.git
cd Noah-ERP

# Opcional: definir secrets em /etc/environment ou exportar na sessão atual
export MASTER_PASSWORD="<senha-admin-noah>"
export MASTER_EMAIL="admin@noahomni.com.br"
export MASTER_NAME="Admin Noah"
export ADMIN_PASS="<senha-admin-login>"
export ADMIN_EMAIL="admin@noahomni.com.br"
export CORS_ORIGINS="https://erp.noahomni.com.br"
```

Copie o `.env.example` da raiz para `.env` e ajuste URLs/ativos de branding do front:

```bash
cp .env.example .env
vim .env  # configure VITE_API_BASE e logos (light/dark, favicon, apple-touch)
```

### 2. Build e subida inicial dos contêineres

```bash
docker compose -f docker/compose.prod.yml build
docker compose -f docker/compose.prod.yml up -d db redis

# aguarde o Postgres responder
docker compose -f docker/compose.prod.yml exec -T db pg_isready -U noah

# subir API (executa prisma migrate deploy automaticamente) e web
docker compose -f docker/compose.prod.yml up -d api web proxy certbot

# garantir que o seed padrão criou/atualizou o admin
docker compose -f docker/compose.prod.yml exec api npx prisma db seed
```

A imagem da API instala `openssl` + `openssl1.1-compat`, aplicando migrations via `PRISMA_MIGRATE_ON_START=1` antes de expor a porta 3000.

### 3. Emitir certificados TLS (HTTPS)

```bash
docker compose -f docker/compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d erp.noahomni.com.br -d erpapi.noahomni.com.br \
  --email admin@noahomni.com.br --agree-tos --no-eff-email

docker compose -f docker/compose.prod.yml exec proxy nginx -t
docker compose -f docker/compose.prod.yml exec proxy nginx -s reload
```

O serviço `certbot` do compose renova automaticamente os certificados a cada 12 horas. Sempre que quiser forçar o reload execute `docker compose -f docker/compose.prod.yml exec proxy nginx -s reload`.

### 4. Atualizações recorrentes

No servidor de produção, utilize o script abaixo (ele executa stash, pull --rebase, rebuild, migrations, seed idempotente e smoke tests):

```bash
chmod +x scripts/update_and_rebuild.sh
./scripts/update_and_rebuild.sh
```

O script lê `ADMIN_EMAIL` e `ADMIN_PASS` da sessão para verificar o login via cURL após subir os contêineres.

### 5. Checklist de testes

Após cada deploy valide manualmente:

```bash
curl -sS -H "Host: erpapi.noahomni.com.br" http://127.0.0.1/api/worker/health
curl -sS https://erpapi.noahomni.com.br/api/worker/health
curl -sS -X POST https://erpapi.noahomni.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@noahomni.com.br","password":"<ADMIN_PASSWORD>"}'

# Front-end
open https://erp.noahomni.com.br/login  # deve carregar login com branding correto
```

Na interface web garanta que:

- Após autenticação o usuário é redirecionado para o Dashboard real.
- As ações aparecem apenas quando o papel possui permissão (`<Can roles={...}>`).
- Logos, favicon e ícone apple-touch usam os valores de `VITE_NOAH_*`.

## HTTPS e reverse proxy

O `docker/nginx.conf` expõe:

- `erp.noahomni.com.br` → container `web:80` (SPA, `try_files $uri /index.html`).
- `erpapi.noahomni.com.br` → container `api:3000` (domínio dedicado à API com prefixo `/`).
- Redirecionamento automático de HTTP (80) para HTTPS (443) exceto para o desafio ACME (`/.well-known/acme-challenge/`).

O comando `docker compose -f docker/compose.prod.yml exec proxy nginx -t` precisa retornar sucesso antes de qualquer reload ou deploy.

## Front end de produção

O build Vite lê `VITE_API_BASE` (obrigatoriamente com `/api` no final) e os assets de branding definidos via `VITE_NOAH_*`. Adicione os arquivos finais em `public/brand/` antes de gerar o build para produção (`npm run build`).

## API / Prisma

- `npm run --prefix apps/api build` valida decorators/Typescript.
- `docker compose -f docker/compose.prod.yml exec api npx prisma validate`
- `docker compose -f docker/compose.prod.yml exec api npx prisma generate`
- `docker compose -f docker/compose.prod.yml exec api npx prisma migrate deploy`

Todos os comandos acima são executados automaticamente pelo `update_and_rebuild.sh`, mas estão listados aqui para auditoria manual.
