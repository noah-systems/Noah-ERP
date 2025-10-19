#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$REPO_ROOT/docker/compose.prod.yml"

cd "$REPO_ROOT"

echo "[prod-up] Subindo stack: docker compose -f $COMPOSE_FILE up -d"
docker compose -f "$COMPOSE_FILE" up -d --build

echo "[prod-up] Aguardando PostgreSQL aceitar conexões"
for attempt in $(seq 1 60); do
  if docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U noah -d noah >/dev/null 2>&1; then
    echo "[prod-up] PostgreSQL pronto."
    break
  fi
  if [ "$attempt" -eq 60 ]; then
    echo "[prod-up] PostgreSQL não respondeu a tempo." >&2
    exit 1
  fi
  sleep 1
done

echo "[prod-up] Logs recentes da API"
docker compose -f "$COMPOSE_FILE" logs --tail=50 api
