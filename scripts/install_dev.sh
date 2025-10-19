#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

info() { printf '\033[1;34m[info]\033[0m %s\n' "$1"; }
success() { printf '\033[1;32m[ok]\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$1"; }
error() { printf '\033[1;31m[erro]\033[0m %s\n' "$1" >&2; }

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Comando obrigatório ausente: $1"
    exit 1
  fi
}

info "Verificando dependências básicas"
require_command node
require_command npm
success "Node e npm disponíveis."

info "Instalando dependências do front"
npm install
success "Dependências do front instaladas."

info "Instalando dependências da API Nest"
npm --prefix apps/api install
success "Dependências da API instaladas."

info "Gerando cliente Prisma"
npm --prefix apps/api run prisma:generate
success "Cliente Prisma gerado."

if [ -n "${DATABASE_URL:-}" ]; then
  info "Aplicando migrations no banco apontado em DATABASE_URL"
  npm --prefix apps/api run prisma:migrate
  success "Migrations aplicadas."
else
  warn "DATABASE_URL não definido; pule migrations/seed conforme necessário."
fi

if [ -n "${ADMIN_EMAIL:-}" ] || [ -n "${ADMIN_PASSWORD:-}" ]; then
  info "Executando seed com ADMIN_* do ambiente"
  npm --prefix apps/api run prisma:seed
  success "Seed executado."
else
  warn "ADMIN_EMAIL/ADMIN_PASSWORD não definidos; seed não foi executado automaticamente."
fi

info "Compilando API Nest (build único)"
npm --prefix apps/api run build
success "API compilada."

info "Build do front para validar setup"
npm run build
success "Front compilado."

cat <<'MSG'

Ambiente pronto! Execute, em terminais separados:
  npm --prefix apps/api run build && npm --prefix apps/api run start:prod   # API NestJS (http://localhost:3000/api)
  npm run dev                           # Front (http://localhost:5173)
MSG
