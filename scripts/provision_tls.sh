#!/usr/bin/env bash
set -euo pipefail

DOMAIN_WEB=${DOMAIN_WEB:-"erp.noahomni.com.br"}
DOMAIN_API=${DOMAIN_API:-"erpapi.noahomni.com.br"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@noahomni.com.br"}
COMPOSE_FILE=${COMPOSE_FILE:-"docker/compose.prod.yml"}
FRONT_ENV_FILE=${FRONT_ENV_FILE:-".env.production"}
EXPECTED_PUBLIC_IP=${EXPECTED_PUBLIC_IP:-""}
ADMIN_NAME=${ADMIN_NAME:-"Admin Noah"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-""}
CORS_ORIGINS=${CORS_ORIGINS:-"https://erp.noahomni.com.br,https://erpapi.noahomni.com.br"}
DATABASE_URL=${DATABASE_URL:-"postgres://noah:noah@db:5432/noah"}
REDIS_URL=${REDIS_URL:-"redis://redis:6379"}
PRISMA_MIGRATE_ON_START=${PRISMA_MIGRATE_ON_START:-"1"}
JWT_SECRET=${JWT_SECRET:-""}
PYTHON_BIN=${PYTHON_BIN:-python3}

export DOMAIN_WEB DOMAIN_API ADMIN_EMAIL ADMIN_NAME ADMIN_PASSWORD \
  CORS_ORIGINS DATABASE_URL REDIS_URL PRISMA_MIGRATE_ON_START JWT_SECRET

STEP_INDEX=0
step() {
  STEP_INDEX=$((STEP_INDEX + 1))
  echo "==> ${STEP_INDEX}) $1"
}

die() {
  echo "[ERRO] $1" >&2
  exit 1
}

warn() {
  echo "[AVISO] $1" >&2
}

require_cmd() {
  local cmd=$1
  local message=$2
  if ! command -v "$cmd" >/dev/null 2>&1; then
    die "$message"
  fi
}

port_in_use() {
  local port=$1
  if command -v ss >/dev/null 2>&1; then
    if ss -ltn 2>/dev/null | awk -v p=":${port}" 'NR>1 && $4 ~ p {exit 0} END {exit 1}'; then
      return 0
    fi
  elif command -v lsof >/dev/null 2>&1; then
    if lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | awk -v p=":${port}" '$9 ~ p {exit 0} END {exit 1}'; then
      return 0
    fi
  else
    warn "Não foi possível verificar porta ${port} (faltam utilitários ss/lsof)."
    return 1
  fi
  return 1
}

ensure_ports_free() {
  local ports=(80 443)
  for port in "${ports[@]}"; do
    if port_in_use "$port"; then
      die "Porta ${port} está em uso. Libere-a antes de continuar."
    fi
  done
}

ensure_root() {
  if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
    die "Execute este script como root ou via sudo."
  fi
}

ensure_repo_root() {
  if [[ ! -f docker/compose.prod.yml ]]; then
    die "Arquivo docker/compose.prod.yml não encontrado. Execute a partir da raiz do repositório."
  fi
}

resolve_public_ip() {
  if [[ -n ${EXPECTED_PUBLIC_IP} ]]; then
    echo "$EXPECTED_PUBLIC_IP"
    return
  fi

  if command -v curl >/dev/null 2>&1; then
    local ip
    ip=$(curl -fsS https://api.ipify.org 2>/dev/null || true)
    if [[ -n $ip ]]; then
      echo "$ip"
      return
    fi
  fi

  if command -v dig >/dev/null 2>&1; then
    local ip
    ip=$(dig +short myip.opendns.com @resolver1.opendns.com 2>/dev/null | tail -n1)
    if [[ -n $ip ]]; then
      echo "$ip"
      return
    fi
  fi

  die "Não foi possível detectar o IP público automaticamente. Defina EXPECTED_PUBLIC_IP."
}

check_dns_record() {
  local domain=$1
  local expected_ip=$2
  local ips
  ips=$(dig +short "$domain" A | sort -u)
  if [[ -z $ips ]]; then
    die "Domínio ${domain} não possui registros A. Ajuste o DNS antes de continuar."
  fi

  if ! grep -qx "$expected_ip" <<<"$ips"; then
    echo "$ips" | sed 's/^/  -> /'
    die "Domínio ${domain} não aponta para ${expected_ip}. Atualize o DNS e aguarde propagação."
  fi
}

parse_front_env() {
  local file=$1
  if [[ ! -f $file ]]; then
    die "Arquivo ${file} não encontrado. Crie .env.production com VITE_API_BASE."
  fi

  local line
  line=$(grep -E '^VITE_API_BASE=' "$file" | tail -n1 || true)
  if [[ -z $line ]]; then
    die "Variável VITE_API_BASE não encontrada em ${file}."
  fi

  local value=${line#VITE_API_BASE=}
  value=${value%$'\r'}
  value=${value//\"/}

  if [[ $value != https://* ]]; then
    die "VITE_API_BASE deve começar com https:// (valor atual: ${value})."
  fi

  if [[ $value != */api ]]; then
    die "VITE_API_BASE deve terminar com /api (valor atual: ${value})."
  fi

  local host
  host=$(printf '%s' "$value" | sed -E 's#https://([^/]+)/.*#\1#')
  if [[ -z $host ]]; then
    die "Não foi possível extrair o host de VITE_API_BASE (${value})."
  fi

  if [[ $host != "$DOMAIN_API" ]]; then
    die "VITE_API_BASE (${value}) não aponta para ${DOMAIN_API}. Ajuste o arquivo ${file}."
  fi
}

check_env_vars() {
  if [[ -z ${JWT_SECRET:-} ]]; then
    die "Defina JWT_SECRET com um valor forte antes de prosseguir."
  fi
  if [[ -z ${ADMIN_PASSWORD:-} ]]; then
    die "Defina ADMIN_PASSWORD (senha do usuário admin)."
  fi
  if [[ -z ${ADMIN_EMAIL:-} ]]; then
    die "Defina ADMIN_EMAIL (e-mail do usuário admin)."
  fi
  if [[ ${PRISMA_MIGRATE_ON_START} != "1" ]]; then
    warn "PRISMA_MIGRATE_ON_START diferente de 1 (valor atual: ${PRISMA_MIGRATE_ON_START})."
  fi
  if [[ -z ${CORS_ORIGINS:-} ]]; then
    warn "CORS_ORIGINS não definido; utilizando fallback padrão."
  else
    if [[ ${CORS_ORIGINS} != *"${DOMAIN_WEB}"* ]]; then
      warn "CORS_ORIGINS não inclui ${DOMAIN_WEB}. Confirme as origens permitidas."
    fi
  fi
}

docker_compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

wait_for_postgres() {
  local retries=30
  local attempt=1
  while (( attempt <= retries )); do
    if docker_compose exec -T db pg_isready -U noah -d noah >/dev/null 2>&1; then
      return
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  die "Postgres não respondeu a tempo. Verifique os logs do serviço db."
}

wait_for_http() {
  local method=$1
  local url=$2
  local host_header=$3
  local expected=$4
  local retries=30
  local attempt=1
  local resolve_arg=${5:-}
  while (( attempt <= retries )); do
    if [[ -n $resolve_arg ]]; then
      if response=$(curl -fsS -o /dev/null -w '%{http_code}' --resolve "$resolve_arg" -H "Host: $host_header" -X "$method" "$url" 2>/dev/null); then
        if [[ $response == "$expected" ]]; then
          return
        fi
      fi
    else
      if response=$(curl -fsS -o /dev/null -w '%{http_code}' -H "Host: $host_header" -X "$method" "$url" 2>/dev/null); then
        if [[ $response == "$expected" ]]; then
          return
        fi
      fi
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  die "Falha ao obter HTTP ${expected} de ${url} após ${retries} tentativas."
}

check_containers() {
  local services=(db redis api web proxy certbot)
  local json
  json=$(docker_compose ps --format json)
  printf '%s\n' "$json" | "$PYTHON_BIN" - "${services[@]}" <<'PY'
import json
import sys
from typing import List

services: List[str] = sys.argv[1:]
raw = sys.stdin.read()
if not raw.strip():
    print("[ERRO] Não foi possível obter o estado dos containers (docker compose ps).", file=sys.stderr)
    sys.exit(1)

data = json.loads(raw)
state_by_service = {item["Service"]: item["State"] for item in data}
missing = [svc for svc in services if svc not in state_by_service]
if missing:
    print("[ERRO] Serviços ausentes: " + ", ".join(missing), file=sys.stderr)
    sys.exit(1)
not_running = [svc for svc in services if not state_by_service[svc].startswith("running")]
if not_running:
    print("[ERRO] Serviços não estão ativos: " + ", ".join(f"{svc} ({state_by_service[svc]})" for svc in not_running), file=sys.stderr)
    sys.exit(1)
PY
}

ensure_certbot_service() {
  local json
  json=$(docker_compose ps --format json certbot)
  printf '%s\n' "$json" | "$PYTHON_BIN" - <<'PY'
import json
import sys

raw = sys.stdin.read()
if not raw.strip():
    print('[AVISO] Não foi possível ler o estado do certbot.', file=sys.stderr)
    sys.exit(0)

data = json.loads(raw)
if not data:
    print('[AVISO] Serviço certbot não encontrado na saída do docker compose ps.', file=sys.stderr)
    sys.exit(0)

state = data[0].get('State', '')
if not state.startswith('running'):
    print(f"[AVISO] Serviço certbot não está em execução (estado: {state}).", file=sys.stderr)
PY
  echo "Logs recentes do certbot:" && docker_compose logs --tail=10 certbot || warn "Não foi possível obter logs do certbot."
}

login_admin() {
  local body
  body=$(cat <<JSON
{"email":"${ADMIN_EMAIL}","password":"${ADMIN_PASSWORD}"}
JSON
)
  local response
  response=$(curl -fsS --resolve "${DOMAIN_API}:443:127.0.0.1" -H 'Content-Type: application/json' -d "$body" "https://${DOMAIN_API}/api/auth/login" 2>/dev/null || true)
  if [[ -z $response ]]; then
    die "Falha ao autenticar admin. Verifique logs da API e credenciais."
  fi
  if ! grep -q 'access_token' <<<"$response"; then
    echo "$response"
    die "Autenticação do admin não retornou token."
  fi
}

step "Pré-checagens"
require_cmd docker "Docker não encontrado no PATH. Instale Docker 24+."
require_cmd curl "curl não encontrado. Instale o utilitário curl."
require_cmd dig "dig não encontrado. Instale o pacote dnsutils/bind9-host."
require_cmd "$PYTHON_BIN" "Python 3 não encontrado (defina PYTHON_BIN se necessário)."
ensure_root
ensure_repo_root
ensure_ports_free

step "Validação de DNS"
PUBLIC_IP=$(resolve_public_ip)
echo "IP público detectado: ${PUBLIC_IP}"
check_dns_record "$DOMAIN_WEB" "$PUBLIC_IP"
check_dns_record "$DOMAIN_API" "$PUBLIC_IP"

step "Validação dos arquivos de configuração"
parse_front_env "$FRONT_ENV_FILE"
check_env_vars

step "Build das imagens"
docker_compose build

step "Subindo serviços de infraestrutura"
docker_compose up -d db redis
wait_for_postgres

echo "Postgres pronto."

step "Subindo API, Web, Proxy e Certbot"
docker_compose up -d api web proxy certbot
check_containers

step "Checando webroot ACME"
docker_compose exec -T proxy sh -lc '
  mkdir -p /var/www/certbot/.well-known/acme-challenge &&
  echo OK > /var/www/certbot/.well-known/acme-challenge/ping.txt
'
wait_for_http GET "http://127.0.0.1/.well-known/acme-challenge/ping.txt" "$DOMAIN_WEB" 200
wait_for_http GET "http://127.0.0.1/.well-known/acme-challenge/ping.txt" "$DOMAIN_API" 200
echo "Webroot disponível para ACME."

step "Emitindo certificados via webroot"
docker_compose run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN_WEB" -d "$DOMAIN_API" \
  -m "$ADMIN_EMAIL" --agree-tos --no-eff-email --rsa-key-size 4096

step "Carregando certificados no Nginx"
docker_compose exec -T proxy nginx -t
docker_compose exec -T proxy nginx -s reload

step "Smoke tests HTTP/HTTPS"
curl -fsSI -H "Host: ${DOMAIN_WEB}" http://127.0.0.1/ | head -n 1
echo
curl -fsSI --resolve "${DOMAIN_WEB}:443:127.0.0.1" "https://${DOMAIN_WEB}/" | head -n 5 | sed 's/^/  /'
wait_for_http GET "https://${DOMAIN_API}/api/worker/health" "$DOMAIN_API" 200 "${DOMAIN_API}:443:127.0.0.1"
login_admin
echo "Admin autenticado com sucesso."

step "Certbot"
ensure_certbot_service

cat <<MSG
✔ Provisionamento concluído.
- Front: https://${DOMAIN_WEB}
- API  : https://${DOMAIN_API}/api/worker/health
MSG
