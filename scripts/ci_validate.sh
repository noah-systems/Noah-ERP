#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

API_DOMAIN="${API_DOMAIN:-https://erpapi.noahomni.com.br}"
FRONT_DOMAIN="${FRONT_DOMAIN:-https://erp.noahomni.com.br}"
API_BASE="${API_DOMAIN%/}/api"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@noahomni.com.br}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-D2W3£Qx!0Du#}"
SELLER_EMAIL="${SELLER_EMAIL:-seller.qa@noahomni.com.br}"
SELLER_PASSWORD="${SELLER_PASSWORD:-Seller@123}"

info() { printf '\033[1;34m[info]\033[0m %s\n' "$1"; }
success() { printf '\033[1;32m[ok]\033[0m %s\n' "$1"; }
error() { printf '\033[1;31m[erro]\033[0m %s\n' "$1" >&2; }

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Comando obrigatório ausente: $1"
    exit 1
  fi
}

require_command npm
require_command docker
require_command curl
require_command node

info "1/10 Build da API"
npm run --prefix apps/api build
success "API compilada."

info "2/10 Teste de ACL da API"
npm run --prefix apps/api test:acl
success "ACL básica validada."

info "3/10 Build do front"
VITE_API_BASE="$API_BASE" npm run build
success "Front compilado."

info "4/10 Subindo stack Docker"
docker compose -f docker/compose.prod.yml up -d --build
success "Containers em execução."

info "5/10 Validando configuração do Nginx"
docker compose -f docker/compose.prod.yml exec proxy nginx -t
docker compose -f docker/compose.prod.yml exec proxy nginx -s reload || true
success "Nginx validado."

info "6/10 Healthcheck da API"
for i in {1..30}; do
  if curl -fsS "$API_BASE/worker/health" | grep -q '"ok":true'; then
    success "Healthcheck OK."; break
  fi
  sleep 2
if [ "$i" -eq 30 ]; then
    error "Healthcheck da API falhou."; exit 1
  fi
done

if ! curl -fsS "$API_BASE/health" | grep -q '"ok":true'; then
  error "Health agregado /api/health não retornou ok=true."
  exit 1
fi
success "Health agregado respondendo."

info "7/10 Login admin e verificação do token"
ADMIN_RESPONSE=$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(printf '%s' "$ADMIN_RESPONSE" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d.toString());if(!j.token){process.exit(1);}console.log(j.token);});")
if [ -z "$ADMIN_TOKEN" ]; then
  error "Token do admin não encontrado."; exit 1
fi
curl -fsS -H "Authorization: Bearer $ADMIN_TOKEN" "$API_BASE/auth/me" >/dev/null
success "Login admin validado."

info "Criando usuário SELLER de teste"
docker compose -f docker/compose.prod.yml exec -T \
  -e SELLER_EMAIL="$SELLER_EMAIL" \
  -e SELLER_PASSWORD="$SELLER_PASSWORD" \
  api node - <<'NODE'
const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const db = new PrismaClient();
  const email = process.env.SELLER_EMAIL;
  const password = process.env.SELLER_PASSWORD;
  const hash = await bcrypt.hash(password, 10);
  await db.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: Role.SELLER, name: 'Seller QA' },
    create: { email, passwordHash: hash, role: Role.SELLER, name: 'Seller QA' },
  });
  await db.$disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
NODE

info "8/10 Login SELLER e checagem de ACL"
SELLER_RESPONSE=$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$SELLER_EMAIL\",\"password\":\"$SELLER_PASSWORD\"}")
SELLER_TOKEN=$(printf '%s' "$SELLER_RESPONSE" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d.toString());if(!j.token){process.exit(1);}console.log(j.token);});")
SELLER_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SELLER_TOKEN" "$API_BASE/users")
if [ "$SELLER_STATUS" != "403" ]; then
  error "ACL incorreta para SELLER (HTTP $SELLER_STATUS)."
  exit 1
fi
success "ACL validada para SELLER (403 em /api/users)."

info "9/10 Smoke tests HTTPS"
curl -fsSI "$FRONT_DOMAIN" | head -n 1
FRONT_HTML=$(curl -fsS "$FRONT_DOMAIN")
printf '%s' "$FRONT_HTML" | grep -qi "data:image/svg+xml" || {
  error "HTML do front não inclui o favicon inline (data URI)."; exit 1;
}
if printf '%s' "$FRONT_HTML" | grep -qi "s3\.bragi"; then
  error "Encontrada referência a S3 no HTML do front."; exit 1;
fi
success "Front acessível via HTTPS e usando assets locais."

info "Verificando CORS"
CORS_HEADERS=$(curl -sS -o /dev/null -D - -X OPTIONS "$API_BASE/auth/login" \
  -H 'Origin: https://erp.noahomni.com.br' \
  -H 'Access-Control-Request-Method: POST')
printf '%s' "$CORS_HEADERS" | grep -qi 'access-control-allow-origin: https://erp.noahomni.com.br' || {
  error "Cabeçalho CORS inválido."; exit 1;
}
success "CORS respondendo para https://erp.noahomni.com.br."

info "10/10 Limpeza opcional"
echo "Containers ativos:" && docker compose -f docker/compose.prod.yml ps
success "Validação concluída."
