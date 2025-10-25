#!/usr/bin/env bash
set -Eeuo pipefail

echo "[api] Waiting for PostgreSQL at ${DATABASE_URL:-db:5432}…"
for i in {1..60}; do
  pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-noah}" >/dev/null 2>&1 && break
  sleep 1
done

echo "[api] Running prisma migrate deploy…"
npx prisma migrate deploy

echo "[api] Generating prisma client…"
npx prisma generate

echo "[api] Seeding database (idempotent)…"
npm run seed || true

echo "[api] Starting API…"
exec node dist/main.js
