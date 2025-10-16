#!/usr/bin/env bash
set -euo pipefail

# Navigate to repository root
cd "$(dirname "$0")/.."
cd /opt/noah-erp/Noah-ERP 2>/dev/null || cd "$(pwd)"

# 1) conferir branch atual (guarde o nome)
BRANCH="$(git rev-parse --abbrev-ref HEAD || echo main)"
echo "Branch atual: $BRANCH"

# 2) SALVAR TUDO (inclusive arquivos não rastreados) num stash com etiqueta
if [ -n "$(git status --porcelain || true)" ]; then
  git stash push -u -m "server-backup-$(date +%F_%H%M%S)"
else
  echo "Sem alterações locais; não é necessário criar stash."
fi

# 3) atualizar a referência do remoto
if git rev-parse --verify origin/$BRANCH >/dev/null 2>&1; then
  git fetch origin

  # 4) trazer as mudanças (rebase deixa histórico limpo)
  git pull --rebase origin "$BRANCH"
else
  echo "Aviso: ramo remoto origin/$BRANCH inexistente; pulando fetch/pull."
fi

# 5) (opcional) ver stashes guardados
git stash list | head -n 3 || true

# 6) reconstruir e subir a stack (usa os arquivos do repositório atualizados)
COMPOSE="docker compose -f docker/compose.prod.yml"
$COMPOSE down --remove-orphans
$COMPOSE build --no-cache web api
$COMPOSE up -d db redis

# 7) esperar Postgres responder
echo "Aguardando Postgres..."
for i in {1..30}; do
  if $COMPOSE exec -T db pg_isready -U "${POSTGRES_USER:-noah}" >/dev/null 2>&1; then
    echo "Postgres ok"; break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "Postgres não respondeu a tempo." >&2
  fi
done

# 8) subir API (o entrypoint deve aplicar migrations)
$COMPOSE up -d api
sleep 3
$COMPOSE logs --no-log-prefix --tail=80 api || true

# 8b) fallback de migrations caso o entrypoint não rode
if ! $COMPOSE logs api | grep -qi "migrate"; then
  $COMPOSE exec api \
    npx prisma migrate deploy --schema prisma/schema.prisma
fi

# 9) garantir admin padrão (idempotente)
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@noahomni.com.br}"
ADMIN_PASS="${ADMIN_PASS:-Admin@2024}"

$COMPOSE exec -T \
  -e ADMIN_EMAIL="$ADMIN_EMAIL" \
  -e ADMIN_PASS="$ADMIN_PASS" \
  api node - <<'JS'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const pass  = process.env.ADMIN_PASS  || 'Admin@2024';
  const db = new PrismaClient();
  const hash = bcrypt.hashSync(pass, 10);
  await db.user.upsert({
    where: { email },
    update: {},
    create: { name:'Admin', email, passwordHash: hash, role: 'ADMIN_NOAH' }
  });
  console.log('Admin ok:', email);
  await db.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
JS

# 10) subir o web (Vite -> NGINX)
$COMPOSE up -d web

# 11) smoke tests rápidos
echo "Web container:"
$COMPOSE exec -T web sh -lc 'wget -qO- http://localhost/ | head -n 3' || true

echo "API login teste:"
curl -sS -X POST http://127.0.0.1:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}" | head -c 200 || true
echo
echo "OK."

cat <<'TXT'
Se depois você quiser re-aplicar algo do stash:
git stash apply (o mais recente) ou git stash pop (aplica e remove).
Se não precisar mais: git stash drop (remove o topo) ou git stash clear.
TXT
