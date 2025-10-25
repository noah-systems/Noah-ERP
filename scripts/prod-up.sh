#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[erro] docker não encontrado no PATH" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[erro] plugin docker compose ausente" >&2
  exit 1
fi

PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python)"
else
  echo "[erro] python3/python não encontrado" >&2
  exit 1
fi

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  cat >"$ENV_FILE" <<'ENV'
# Arquivo gerado automaticamente por scripts/prod-up.sh
# Ajuste os valores conforme necessário e execute o script novamente.
ENV
fi

read_env_var() {
  local key="$1"

  "$PYTHON_BIN" - "$ENV_FILE" "$key" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
key = sys.argv[2]

if not path.exists():
    sys.exit()

for line in path.read_text().splitlines():
    if line.startswith(f"{key}="):
        print(line.split("=", 1)[1])
        break
PY
}

set_env_var() {
  local file="$ENV_FILE"
  local key="$1"
  local value="$2"

  "$PYTHON_BIN" - "$file" "$key" "$value" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

lines = []
if path.exists():
    lines = path.read_text().splitlines()

updated = False
for idx, line in enumerate(lines):
    if line.startswith(f"{key}="):
        lines[idx] = f"{key}={value}"
        updated = True
        break

if not updated:
    lines.append(f"{key}={value}")

path.write_text("\n".join(lines) + "\n")
PY
}

resolve_value() {
  local key="$1"
  local fallback="$2"
  local override=""

  if [ "${!key+x}" = x ]; then
    override="${!key}"
  fi

  if [ -n "$override" ]; then
    printf '%s\n' "$override"
    return
  fi

  local existing=""
  existing="$(read_env_var "$key" 2>/dev/null || true)"
  if [ -n "$existing" ]; then
    printf '%s\n' "$existing"
    return
  fi

  printf '%s\n' "$fallback"
}

build_database_url() {
  local user="$1"
  local password="$2"
  local host="$3"
  local port="$4"
  local database="$5"
  local schema="$6"

  "$PYTHON_BIN" - "$user" "$password" "$host" "$port" "$database" "$schema" <<'PY'
import sys
from urllib.parse import quote

user, password, host, port, database, schema = sys.argv[1:7]

def encode(component):
    return quote(component, safe="")

encoded_user = encode(user)
encoded_password = encode(password)
encoded_db = encode(database)
encoded_host = host
encoded_schema = encode(schema)

print(f"postgresql://{encoded_user}:{encoded_password}@{encoded_host}:{port}/{encoded_db}?schema={encoded_schema}")
PY
}

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    "$PYTHON_BIN" - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
  fi
}

ADMIN_NAME_VALUE="$(resolve_value ADMIN_NAME "Admin Noah")"
ADMIN_EMAIL_VALUE="$(resolve_value ADMIN_EMAIL "admin@example.com")"
ADMIN_PASSWORD_VALUE="$(resolve_value ADMIN_PASSWORD "ChangeMe123!")"
POSTGRES_USER_VALUE="$(resolve_value POSTGRES_USER "noah")"
POSTGRES_PASSWORD_VALUE="$(resolve_value POSTGRES_PASSWORD "noah")"
POSTGRES_DB_VALUE="$(resolve_value POSTGRES_DB "noah")"
POSTGRES_HOST_VALUE="$(resolve_value POSTGRES_HOST "db")"
POSTGRES_PORT_VALUE="$(resolve_value POSTGRES_PORT "5432")"
DATABASE_SCHEMA_VALUE="$(resolve_value DATABASE_SCHEMA "public")"
CORS_ORIGINS_VALUE="$(resolve_value CORS_ORIGINS "http://localhost,http://127.0.0.1")"
VITE_API_BASE_VALUE="$(resolve_value VITE_API_BASE "http://localhost:3000/api")"

JWT_SECRET_VALUE="$(resolve_value JWT_SECRET "")"
if [ -z "$JWT_SECRET_VALUE" ]; then
  JWT_SECRET_VALUE="$(random_secret)"
fi

REDIS_HOST_VALUE="$(resolve_value REDIS_HOST "redis")"
REDIS_PORT_VALUE="$(resolve_value REDIS_PORT "6379")"
REDIS_URL_VALUE="$(resolve_value REDIS_URL "")"
if [ -z "$REDIS_URL_VALUE" ]; then
  REDIS_URL_VALUE="redis://${REDIS_HOST_VALUE}:${REDIS_PORT_VALUE}"
fi

DATABASE_URL_VALUE="$(build_database_url "$POSTGRES_USER_VALUE" "$POSTGRES_PASSWORD_VALUE" "$POSTGRES_HOST_VALUE" "$POSTGRES_PORT_VALUE" "$POSTGRES_DB_VALUE" "$DATABASE_SCHEMA_VALUE")"

set_env_var "NODE_ENV" "production"
set_env_var "PORT" "3000"
set_env_var "JWT_SECRET" "$JWT_SECRET_VALUE"
set_env_var "CORS_ORIGINS" "$CORS_ORIGINS_VALUE"
set_env_var "ADMIN_NAME" "$ADMIN_NAME_VALUE"
set_env_var "ADMIN_EMAIL" "$ADMIN_EMAIL_VALUE"
set_env_var "ADMIN_PASSWORD" "$ADMIN_PASSWORD_VALUE"
set_env_var "POSTGRES_USER" "$POSTGRES_USER_VALUE"
set_env_var "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD_VALUE"
set_env_var "POSTGRES_DB" "$POSTGRES_DB_VALUE"
set_env_var "POSTGRES_HOST" "$POSTGRES_HOST_VALUE"
set_env_var "POSTGRES_PORT" "$POSTGRES_PORT_VALUE"
set_env_var "DATABASE_SCHEMA" "$DATABASE_SCHEMA_VALUE"
set_env_var "DATABASE_URL" "$DATABASE_URL_VALUE"
set_env_var "REDIS_URL" "$REDIS_URL_VALUE"
set_env_var "REDIS_HOST" "$REDIS_HOST_VALUE"
set_env_var "REDIS_PORT" "$REDIS_PORT_VALUE"
set_env_var "VITE_API_BASE" "$VITE_API_BASE_VALUE"

set -a
. "$ENV_FILE"
set +a

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-noah-erp}"
COMPOSE_CMD=(docker compose --project-name "$PROJECT_NAME" --env-file "$ENV_FILE" -f docker/compose.prod.yml)

"${COMPOSE_CMD[@]}" up -d --build db redis api web proxy

if ! "${COMPOSE_CMD[@]}" exec -T db sh -c "for i in \$(seq 1 120); do PGPASSWORD='$POSTGRES_PASSWORD' pg_isready -U '$POSTGRES_USER' -d '$POSTGRES_DB' >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1"; then
  echo "[erro] Postgres indisponível após aguardar 120s" >&2
  exit 1
fi

"${COMPOSE_CMD[@]}" exec -T db env PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -v ON_ERROR_STOP=1 \
  -v user="$POSTGRES_USER" \
  -v pass="$POSTGRES_PASSWORD" \
  -v db="$POSTGRES_DB" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'user', :'pass')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'user')
\gexec
SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'user', :'pass')
\gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'user')
  WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db')
\gexec
SELECT format('ALTER DATABASE %I OWNER TO %I', :'db', :'user')
\gexec
\connect :db
SELECT format('GRANT USAGE, CREATE ON SCHEMA public TO %I', :'user')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %I', :'user')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %I', :'user')\gexec
SQL

"${COMPOSE_CMD[@]}" cp "$ENV_FILE" api:/app/apps/api/.env >/dev/null 2>&1 || \
  "${COMPOSE_CMD[@]}" exec -T api sh -c "cat > /app/apps/api/.env" < "$ENV_FILE"

"${COMPOSE_CMD[@]}" exec -T api npx prisma migrate deploy
"${COMPOSE_CMD[@]}" exec -T api npx prisma generate
"${COMPOSE_CMD[@]}" exec -T api node prisma/seed.js

if ! "${COMPOSE_CMD[@]}" exec -T api wget -qO- http://localhost:3000/api/health >/dev/null; then
  echo "[erro] health-check interno da API falhou" >&2
  exit 1
fi

if ! wget -qO- http://localhost/api/health >/dev/null; then
  echo "[erro] health-check via proxy falhou" >&2
  exit 1
fi

echo "Ambiente Docker disponível: http://localhost:5173 (web) | http://localhost/api/health (api via proxy)"
