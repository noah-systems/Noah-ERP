#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$REPO_ROOT/docker/compose.prod.yml"

info() {
  printf '\033[1;34m[info]\033[0m %s\n' "$1"
}

warn() {
  printf '\033[1;33m[warn]\033[0m %s\n' "$1"
}

die() {
  printf '\033[1;31m[error]\033[0m %s\n' "$1" >&2
  exit 1
}

PRISMA_SCHEMA="/app/apps/api/prisma/schema.prisma"

run_with_docker() {
  info "Starting database dependencies (db, redis)."
  "${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" up -d db redis

  local postgres_user=${POSTGRES_USER:-noah}
  local postgres_db=${POSTGRES_DB:-noah}
  local postgres_port=${POSTGRES_PORT:-5432}
  local max_attempts=${MAX_ATTEMPTS:-60}
  local attempts=0

  info "Waiting for Postgres to accept connections..."
  until "${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" exec -T db pg_isready \
    -U "$postgres_user" -d "$postgres_db" -p "$postgres_port" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if (( attempts >= max_attempts )); then
      die "Postgres did not become ready after $max_attempts attempts."
    fi
    sleep 1
  done
  info "Postgres is ready."

  info "Running Prisma validate/generate/migrate inside the API service."
  "${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" run --rm api sh -lc "\
    set -euo pipefail \
    && npx prisma validate --schema $PRISMA_SCHEMA \
    && npx prisma generate --schema $PRISMA_SCHEMA \
    && npx prisma migrate deploy --schema $PRISMA_SCHEMA"
}

if ! command -v docker >/dev/null 2>&1; then
  warn "Docker ausente no ambiente de CI. Pulando migrations."
  exit 0
fi

if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker-compose)
else
  warn "Docker Compose não está disponível. Pulando migrations."
  exit 0
fi

run_with_docker
