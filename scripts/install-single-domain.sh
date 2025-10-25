#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-erp.noahomni.com.br}"
LE_EMAIL="${LE_EMAIL:-infra@noahomni.com.br}"

need(){ command -v "$1" >/dev/null 2>&1 || { echo "[erro] falta $1"; exit 1; }; }
need docker
need openssl
need curl
if ! docker compose version >/dev/null 2>&1; then
  echo "[erro] docker compose ausente"
  exit 1
fi

# Gera .env se não existir
if [ ! -f .env ]; then
  JWT="$(openssl rand -hex 32)"
  PGP="$(openssl rand -hex 16)"
  cat > .env <<EOF_ENV
NODE_ENV=production
PORT=3000
JWT_SECRET=$JWT
CORS_ORIGINS=https://$DOMAIN

ADMIN_NAME=Admin Noah
ADMIN_EMAIL=admin@noahomni.com.br
ADMIN_PASSWORD=changeme123456

POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PGP
POSTGRES_DB=noah
DATABASE_URL=postgresql://postgres:$PGP@db:5432/noah?schema=public

REDIS_HOST=redis
REDIS_PORT=6379
EOF_ENV
  echo "[ok] .env criado"
fi

mkdir -p certbot-webroot

# Sobe stack (builda api/web)
docker compose --env-file .env -f docker/compose.prod.yml up -d --build

echo "[info] aguardando DB…"
db_ready=false
for i in {1..180}; do
  if docker compose --env-file .env -f docker/compose.prod.yml exec -T db sh -lc "pg_isready -U \${POSTGRES_USER:-postgres}" >/dev/null 2>&1; then
    db_ready=true
    break
  fi
  sleep 1
done

if [ "$db_ready" != true ]; then
  echo "[erro] DB não respondeu a tempo"
  exit 1
fi

echo "[info] testando API interna…"
docker compose --env-file .env -f docker/compose.prod.yml exec -T api sh -lc "wget -qO- http://localhost:3000/api/health || wget -qO- http://localhost:3000/health" | head -n1

echo "[info] emitindo/renovando TLS (certbot)…"
docker compose --env-file .env -f docker/compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot -d "$DOMAIN" -m "$LE_EMAIL" --agree-tos --no-eff-email || true

echo "[info] recarregando Nginx…"
docker compose --env-file .env -f docker/compose.prod.yml exec -T proxy nginx -s reload || true

echo "[info] health HTTPS:"
curl -I "https://$DOMAIN" | head -n1 || true
curl -fsS "https://$DOMAIN/api/health" || true
