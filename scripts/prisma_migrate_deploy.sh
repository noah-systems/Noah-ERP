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

PRISMA_SCHEMA_DEFAULT="$REPO_ROOT/apps/api/prisma/schema.prisma"
DIRECT_MODE=0
SKIP_SEED=${PRISMA_SKIP_SEED:-0}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --direct)
      DIRECT_MODE=1
      shift
      ;;
    --skip-seed)
      SKIP_SEED=1
      shift
      ;;
    --schema)
      [ "${2:-}" ] || die "Parâmetro --schema requer um valor"
      PRISMA_SCHEMA_DEFAULT="$2"
      shift 2
      ;;
    *)
      die "Parâmetro desconhecido: $1"
      ;;
  esac
done

PRISMA_SCHEMA="${PRISMA_SCHEMA:-$PRISMA_SCHEMA_DEFAULT}"
API_DIR="${API_DIR:-$REPO_ROOT/apps/api}"

run_direct() {
  local schema="$1"
  local api_dir="$2"

  info "Executando Prisma (modo direto, sem Docker Compose)."
  (
    cd "$api_dir"
    npx prisma validate --schema "$schema"
    npx prisma generate --schema "$schema"
    npx prisma migrate deploy --schema "$schema"
    if [ "$SKIP_SEED" != "1" ]; then
      info "Executando Prisma seed (modo direto)."
      npx prisma db seed --schema "$schema"
    else
      warn "PRISMA_SKIP_SEED=1 — seed ignorado."
    fi
  )
}

if [ "$DIRECT_MODE" = "1" ]; then
  run_direct "$PRISMA_SCHEMA" "$API_DIR"
  exit 0
fi

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
    && PRISMA_SKIP_SEED=$SKIP_SEED \
    && /app/scripts/prisma_migrate_deploy.sh --direct"
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
