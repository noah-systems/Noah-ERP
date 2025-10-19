#!/usr/bin/env bash
set -euo pipefail

# Navigate to repository root
cd "$(dirname "$0")/.."
cd /opt/noah-erp/Noah-ERP 2>/dev/null || cd "$(pwd)"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@noahomni.com.br}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-D2W3£Qx!0Du#}"

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
COMPOSE=(docker compose -f docker/compose.prod.yml)
"${COMPOSE[@]}" down --remove-orphans
"${COMPOSE[@]}" build --no-cache web api
"${COMPOSE[@]}" up -d db redis

# 7) esperar Postgres responder
echo "Aguardando Postgres..."
for i in {1..60}; do
  if "${COMPOSE[@]}" exec -T db pg_isready -U "${POSTGRES_USER:-noah}" >/dev/null 2>&1; then
    echo "Postgres ok"; break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "Postgres não respondeu a tempo." >&2
    exit 1
  fi
done

# 8) subir API (o entrypoint aplica migrations + seed)
"${COMPOSE[@]}" up -d api
sleep 5
"${COMPOSE[@]}" logs --no-log-prefix --tail=80 api || true

# 9) garantir seed idempotente (executa novamente por segurança)
"${COMPOSE[@]}" exec -T api npx prisma db seed --schema ../prisma/schema.prisma

# 10) subir o web (Vite -> Nginx)
"${COMPOSE[@]}" up -d web

# 11) smoke tests rápidos
echo "Validando proxy/nginx..."
"${COMPOSE[@]}" up -d proxy
"${COMPOSE[@]}" exec proxy nginx -t
"${COMPOSE[@]}" exec proxy nginx -s reload || true

"${COMPOSE[@]}" up -d certbot

echo "Web container:"
"${COMPOSE[@]}" exec -T web sh -lc 'wget -qO- http://localhost/ | head -n 3' || true

echo "API login teste:"
curl -sS -X POST https://erpapi.noahomni.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" | head -c 200 || true
echo

echo "Healthcheck:"
curl -sS https://erpapi.noahomni.com.br/api/worker/health || true
echo

echo "OK."

echo "Se depois você quiser re-aplicar algo do stash:" && cat <<'TXT'
git stash apply (o mais recente) ou git stash pop (aplica e remove).
Se não precisar mais: git stash drop (remove o topo) ou git stash clear.
TXT
