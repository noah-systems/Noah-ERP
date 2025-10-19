#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
COMPOSE_FILE="$REPO_ROOT/docker/compose.prod.yml"
API_URL="${API_URL:-http://127.0.0.1:3000/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:?Defina ADMIN_EMAIL com as credenciais de administrador}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:?Defina ADMIN_PASSWORD com as credenciais de administrador}"

info() { printf '\033[1;34m[info]\033[0m %s\n' "$1"; }
ok() { printf '\033[1;32m[ok]\033[0m %s\n' "$1"; }
err() { printf '\033[1;31m[erro]\033[0m %s\n' "$1" >&2; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Comando obrigatório ausente: $1"
    exit 1
  fi
}

require docker
require curl

info "Subindo dependências (db, redis, api) via docker compose"
docker compose -f "$COMPOSE_FILE" up -d db redis api
trap 'docker compose -f "$COMPOSE_FILE" logs --tail=200 api || true' EXIT

HEALTH_ENDPOINT="${API_URL%/}/worker/health"
LOGIN_ENDPOINT="${API_URL%/}/auth/login"

info "Aguardando API responder em $HEALTH_ENDPOINT"
for attempt in $(seq 1 60); do
  if curl -fsS "$HEALTH_ENDPOINT" >/dev/null; then
    ok "API respondeu ao health-check (tentativa $attempt)."
    break
  fi
  sleep 2
  if [ "$attempt" -eq 60 ]; then
    err "API não respondeu a tempo."
    exit 1
  fi
done

info "Testando login de administrador em $LOGIN_ENDPOINT"
RESPONSE=$(curl -fsS -X POST "$LOGIN_ENDPOINT" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" || true)
if ! printf '%s' "$RESPONSE" | grep -q 'accessToken'; then
  err "Login falhou. Resposta: $RESPONSE"
  exit 1
fi
ok "Login administrativo bem-sucedido."

trap - EXIT
info "Smoke test concluído com sucesso."
info "Containers permanecem ativos; finalize com 'docker compose -f docker/compose.prod.yml down' se desejar encerrar."
