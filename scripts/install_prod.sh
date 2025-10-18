#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

info() { printf '\033[1;34m[info]\033[0m %s\n' "$1"; }
success() { printf '\033[1;32m[ok]\033[0m %s\n' "$1"; }
error() { printf '\033[1;31m[erro]\033[0m %s\n' "$1" >&2; }

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Comando obrigatório ausente: $1"
    exit 1
  fi
}

info "Validando pré-requisitos"
require_command node
require_command npm
require_command docker
if ! docker compose version >/dev/null 2>&1; then
  error "docker compose não disponível (requer Docker 20.10+)."
  exit 1
fi
success "Ferramentas encontradas."

if [ -z "${JWT_SECRET:-}" ]; then
  error "Defina JWT_SECRET antes de executar este script."
  exit 1
fi

info "Instalando dependências (modo produção)"
npm ci
npm --prefix apps/api ci
success "Dependências instaladas."

info "Build da API Nest"
npm --prefix apps/api run build
success "API compilada."

info "Build do front"
npm run build
success "Front compilado."

COMPOSE=(docker compose -f docker/compose.prod.yml)
info "Subindo stack docker/compose.prod.yml"
"${COMPOSE[@]}" up -d --build
success "Stack em execução."

info "Executando smoke tests oficiais"
API_DOMAIN="${API_DOMAIN:-https://erpapi.noahomni.com.br}" \
FRONT_DOMAIN="${FRONT_DOMAIN:-https://erp.noahomni.com.br}" \
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}" \
ADMIN_PASSWORD="${ADMIN_PASSWORD:-ChangeMe123!}" \
SELLER_EMAIL="${SELLER_EMAIL:-seller.qa@example.com}" \
SELLER_PASSWORD="${SELLER_PASSWORD:-Seller@123}" \
  "$SCRIPT_DIR/ci_validate.sh"
success "Smoke tests finalizados."

info "Instalação concluída."
