#!/usr/bin/env sh
set -e

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set; cannot wait for PostgreSQL." >&2
  exit 1
fi

PARSED=$(node <<'NODE'
const urlValue = process.env.DATABASE_URL;
try {
  const url = new URL(urlValue);
  const parts = [
    url.hostname,
    url.port || '5432',
    url.username || 'postgres',
    url.pathname.replace(/^\//, '') || 'postgres',
    url.password || ''
  ];
  process.stdout.write(parts.join(' '));
} catch (error) {
  console.error('Failed to parse DATABASE_URL for readiness check:', error.message);
  process.exit(1);
}
NODE
)

if [ -z "$PARSED" ]; then
  echo "Unable to parse DATABASE_URL for readiness check." >&2
  exit 1
fi

DB_HOST=$(printf '%s' "$PARSED" | awk '{print $1}')
DB_PORT=$(printf '%s' "$PARSED" | awk '{print $2}')
DB_USER=$(printf '%s' "$PARSED" | awk '{print $3}')
DB_NAME=$(printf '%s' "$PARSED" | awk '{print $4}')
DB_PASS=$(printf '%s' "$PARSED" | awk '{print $5}')

if [ -n "$DB_PASS" ]; then
  export PGPASSWORD="$DB_PASS"
fi

MAX_ATTEMPTS=${DB_WAIT_MAX_ATTEMPTS:-60}
SLEEP_SECONDS=${DB_WAIT_DELAY_SECONDS:-1}
ATTEMPT=1

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}/${DB_NAME}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" >/dev/null 2>&1; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "PostgreSQL is not ready after $MAX_ATTEMPTS attempts." >&2
    exit 1
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep "$SLEEP_SECONDS"
done

run_with_retry() {
  desc=$1
  attempts=${2:-$MAX_ATTEMPTS}
  delay=${3:-$SLEEP_SECONDS}
  shift 3

  attempt=1
  while true; do
    if "$@"; then
      return 0
    fi

    if [ "$attempt" -ge "$attempts" ]; then
      echo "$desc failed after $attempts attempts." >&2
      return 1
    fi

    attempt=$((attempt + 1))
    echo "$desc attempt $attempt failed; retrying in $delay second(s)..." >&2
    sleep "$delay"
  done
}

cd /app/apps/api

if [ "${PRISMA_MIGRATE_ON_START:-0}" = "1" ]; then
  npx prisma generate --schema ./prisma/schema.prisma
  run_with_retry "Prisma migrate deploy" "$MAX_ATTEMPTS" "$SLEEP_SECONDS" \
    npx prisma migrate deploy --schema ./prisma/schema.prisma
  echo "Running Prisma seed..."
  npx prisma db seed --schema ./prisma/schema.prisma
else
  echo "Skipping Prisma migrate deploy; PRISMA_MIGRATE_ON_START=${PRISMA_MIGRATE_ON_START:-0}."
fi

exec node dist/main.js
