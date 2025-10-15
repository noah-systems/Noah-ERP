#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$REPO_ROOT/docker/compose.prod.yml"

if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  DOCKER_COMPOSE=(docker compose)
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE=(docker-compose)
else
  echo "Error: Docker Compose is not available in PATH." >&2
  exit 1
fi

info() {
  printf '\033[1;34m[info]\033[0m %s\n' "$1"
}

info "Starting database dependencies (db, redis)."
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" up -d db redis

POSTGRES_USER=${POSTGRES_USER:-noah}
POSTGRES_DB=${POSTGRES_DB:-noah}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
MAX_ATTEMPTS=${MAX_ATTEMPTS:-60}

info "Waiting for Postgres to accept connections..."
ATTEMPTS=0
until "${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -p "$POSTGRES_PORT" >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if (( ATTEMPTS >= MAX_ATTEMPTS )); then
    echo "Postgres did not become ready after $MAX_ATTEMPTS attempts." >&2
    exit 1
  fi
  sleep 1
done
info "Postgres is ready."

PRISMA_SCHEMA="/app/apps/api/prisma/schema.prisma"

info "Running Prisma validate/generate/migrate inside the API service."
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" run --rm api sh -lc "\
  set -euo pipefail \
  && npx prisma validate --schema $PRISMA_SCHEMA \
  && npx prisma generate --schema $PRISMA_SCHEMA \
  && npx prisma migrate deploy --schema $PRISMA_SCHEMA"
