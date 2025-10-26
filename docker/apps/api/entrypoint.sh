#!/usr/bin/env bash
set -euo pipefail

cd /app/apps/api

PRISMA_SCHEMA_PATH=${PRISMA_SCHEMA_PATH:-/app/prisma/schema.prisma}
PRISMA_SEED_SCRIPT=${PRISMA_SEED_SCRIPT:-/app/prisma/seed.js}

echo "[api] aguardando Postgres (${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432})…"
ready=false
for i in {1..180}; do
  if pg_isready -h "${POSTGRES_HOST:-db}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [ "$ready" != true ]; then
  echo "[api] ERRO: Postgres indisponível após aguardar."
  exit 1
fi

echo "[api] prisma migrate deploy…"
if ! npx prisma migrate deploy --schema "$PRISMA_SCHEMA_PATH"; then
  echo "[api] aviso: prisma migrate deploy falhou"
fi
echo "[api] prisma generate…"
if ! npx prisma generate --schema "$PRISMA_SCHEMA_PATH"; then
  echo "[api] aviso: prisma generate falhou"
fi

echo "[api] seed…"
if [ -f "$PRISMA_SEED_SCRIPT" ]; then
  if ! node "$PRISMA_SEED_SCRIPT"; then
    echo "[api] aviso: seed via prisma/seed.js falhou"
  fi
else
  if ! npx prisma db seed --schema "$PRISMA_SCHEMA_PATH"; then
    echo "[api] aviso: prisma db seed falhou"
  fi
fi

echo "[api] iniciando…"
exec node dist/main.js
