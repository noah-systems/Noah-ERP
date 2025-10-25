#!/usr/bin/env bash
set -euo pipefail

cd /app/apps/api

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
if ! npx prisma migrate deploy; then
  echo "[api] aviso: prisma migrate deploy falhou"
fi
echo "[api] prisma generate…"
if ! npx prisma generate; then
  echo "[api] aviso: prisma generate falhou"
fi

echo "[api] seed…"
if [ -f prisma/seed.js ]; then
  if ! node prisma/seed.js; then
    echo "[api] aviso: seed via prisma/seed.js falhou"
  fi
else
  if ! npx prisma db seed; then
    echo "[api] aviso: prisma db seed falhou"
  fi
fi

echo "[api] iniciando…"
exec node dist/main.js
