#!/usr/bin/env bash
set -euo pipefail

# 0) Requisitos
if ! command -v docker >/dev/null 2>&1; then
  echo "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" || true
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Instalando Docker Compose Plugin..."
  DOCKER_COMPOSE_VERSION="2.29.7"
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -fsSL -o /usr/local/lib/docker/cli-plugins/docker-compose \
    "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)"
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

# 1) Variáveis mínimas (pode vir de .env)
export NOAH_DOMAIN="${NOAH_DOMAIN:-noah.example.com}"
export VITE_API_BASE="${VITE_API_BASE:-/api}"
export DATABASE_URL="${DATABASE_URL:-postgresql://noah:q%409dlyU0AAJ9@db:5432/noah?schema=public}"
export JWT_SECRET="${JWT_SECRET:-change-me-please-32chars-min}"
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@noahomni.com.br}"
export ADMIN_PASS="${ADMIN_PASS:-D2W3£Qx!0Du#}"

# 2) Subir tudo
COMPOSE="docker compose -f docker/compose.prod.yml"
$COMPOSE pull || true
$COMPOSE up -d --build

# 3) Migrations (idempotente)
$COMPOSE exec -T api npx prisma migrate deploy --schema prisma/schema.prisma || true
$COMPOSE exec -T api npx prisma generate --schema prisma/schema.prisma || true

# 4) Garantir admin (idempotente)
$COMPOSE exec -T \
  -e ADMIN_EMAIL="$ADMIN_EMAIL" \
  -e ADMIN_PASS="$ADMIN_PASS" \
  api node - <<'JS'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const pass  = process.env.ADMIN_PASS  || 'D2W3£Qx!0Du#';
  const hash = await bcrypt.hash(pass, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: 'ADMIN_NOAH' },
    create: { email, name: 'Admin', passwordHash: hash, role: 'ADMIN_NOAH' }
  });
  console.log(`[ok] Admin garantido: ${email}`);
  process.exit(0);
})();
JS

echo
echo "🚀 Noah-ERP no ar."
echo "• Domínio (Nginx): https://${NOAH_DOMAIN}"
echo "• API Base: ${VITE_API_BASE}"
