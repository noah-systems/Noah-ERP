#!/usr/bin/env bash
# noah-erp_rocky.sh
# Rocky Linux 9/10 – instala Docker/Compose, abre portas, prepara .env,
# sobe stack Noah-ERP (db/redis/api/web/proxy/certbot), emite TLS e executa health checks.
# Subcomandos: setup | upgrade | health

set -euo pipefail

### ======== CONFIG (EDITE) ========
ERP_WEB_DOMAIN="erp.seudominio.com.br"        # FRONT público (HTTPS)
ERP_API_DOMAIN="erpapi.seudominio.com.br"     # API pública (HTTPS)
CERTBOT_EMAIL="admin@seudominio.com.br"       # e-mail Let's Encrypt (obrigatório)

# Admin seed (criado/atualizado no primeiro boot da API)
ADMIN_NAME="Admin Noah"
ADMIN_EMAIL="admin@seudominio.com.br"
ADMIN_PASSWORD="TroqueEstaSenha123!"

# Banco/Redis (mantém compatível com o compose do projeto)
POSTGRES_DB="noah"
POSTGRES_USER="noah"
POSTGRES_PASSWORD="noah"
REDIS_URL="redis://redis:6379"

# Paths
INSTALL_DIR="/opt/noah-erp"
REPO_URL="https://github.com/noah-systems/Noah-ERP.git"
REPO_DIR="${INSTALL_DIR}/Noah-ERP"
COMPOSE_FILE="docker/compose.prod.yml"

# Ajustes de SELinux (se Enforcing) – marcar diretórios como acessíveis aos containers
APPLY_SELINUX_CONTEXTS=1

### ======== UTIL ========
log(){ printf "\n\033[1;34m[NOAH-ERP]\033[0m %s\n" "$*"; }
ok(){  printf "\033[1;32m✔\033[0m %s\n" "$*"; }
err(){ printf "\033[1;31m[ERRO]\033[0m %s\n" "$*" >&2; }
need_cmd(){ command -v "$1" >/dev/null 2>&1 || { err "Comando obrigatório ausente: $1"; exit 1; }; }
require_root(){ [ "$(id -u)" -eq 0 ] || { err "Execute como root: sudo $0 <setup|upgrade|health>"; exit 1; }; }
get_public_ip(){ curl -fsS https://api.ipify.org || true; }

port_free(){
  local p="$1"
  if ss -ltn | awk -v p=":$p" '$4 ~ p {found=1} END{exit found?1:0}'; then
    return 0
  else
    return 1
  fi
}

### ======== ROCKY / DOCKER / FIREWALLD ========
install_deps_rocky(){
  log "Instalando dependências base…"
  dnf -y install dnf-plugins-core curl git openssl bind-utils policycoreutils-python-utils || true
}

install_docker_if_needed(){
  if command -v docker >/dev/null 2>&1; then
    ok "Docker encontrado: $(docker --version)"
  else
    log "Instalando Docker Engine + Compose plugin (repo oficial Docker)…"
    dnf -y install dnf-plugins-core
    dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
    ok "Docker instalado e serviço iniciado."
  fi

  if docker compose version >/dev/null 2>&1; then
    ok "Plugin docker compose OK: $(docker compose version | head -n1)"
  else
    err "Plugin 'docker compose' não encontrado (docker-compose-plugin)."
    exit 1
  fi
}

open_firewalld_ports(){
  if systemctl is-active --quiet firewalld; then
    log "Abrindo portas 80/443 no firewalld…"
    firewall-cmd --permanent --add-service=http || true
    firewall-cmd --permanent --add-service=https || true
    firewall-cmd --reload || true
    ok "Portas 80/443 liberadas no firewalld."
  else
    log "firewalld não está ativo – pulando abertura de portas."
  fi
}

check_ports_free(){
  for p in 80 443; do
    if port_free "$p"; then
      ok "Porta $p livre."
    else
      err "Porta $p em uso. Pare Nginx/Apache/Traefik locais antes de continuar."
      exit 1
    fi
  done
}

### ======== DNS / SELINUX ========
check_dns_points(){
  need_cmd dig
  local host_ip dns_ip
  host_ip="$(get_public_ip)"
  [ -n "$host_ip" ] || { err "Não foi possível obter IP público para validar DNS."; exit 1; }

  for d in "$ERP_WEB_DOMAIN" "$ERP_API_DOMAIN"; do
    dns_ip="$(dig +short A "$d" | tail -n1)"
    if [ "$dns_ip" != "$host_ip" ]; then
      err "DNS de ${d} não aponta para este servidor. Esperado ${host_ip}, obtido ${dns_ip:-<vazio>}."
      exit 1
    else
      ok "DNS OK para ${d} → ${dns_ip}"
    fi
  done
}

apply_selinux_contexts(){
  if [ "${APPLY_SELINUX_CONTEXTS}" -eq 0 ]; then
    log "Ajustes de SELinux desativados por configuração."
    return 0
  fi
  if command -v getenforce >/dev/null 2>&1 && [ "$(getenforce)" = "Enforcing" ]; then
    log "SELinux Enforcing detectado – aplicando contextos para /opt/noah-erp…"
    dnf -y install container-selinux || true
    if command -v semanage >/dev/null 2>&1; then
      semanage fcontext -a -t container_file_t "${INSTALL_DIR}(/.*)?"
      restorecon -Rv "${INSTALL_DIR}" || true
      ok "Contexto SELinux container_file_t aplicado."
    else
      chcon -Rt svirt_sandbox_file_t "${INSTALL_DIR}" || true
      ok "Contexto SELinux svirt_sandbox_file_t aplicado via chcon."
    fi
  else
    log "SELinux não está Enforcing (ou ausente) – pulando ajuste de contextos."
  fi
}

### ======== REPO / VARS ========
prepare_repo(){
  mkdir -p "$INSTALL_DIR"
  if [ -d "$REPO_DIR/.git" ]; then
    log "Repositório já existe. Atualizando do origin/main…"
    git -C "$REPO_DIR" fetch --all -p
    git -C "$REPO_DIR" reset --hard origin/main
  else
    log "Clonando repositório…"
    git clone "$REPO_URL" "$REPO_DIR"
  fi
}

ensure_jwt_secret(){
  if [ -z "${JWT_SECRET:-}" ]; then
    JWT_SECRET="$(openssl rand -hex 32)"
    export JWT_SECRET
  fi
}

write_env_root(){
  log "Gerando arquivo .env (raiz) para docker compose…"
  cat > "${REPO_DIR}/.env" <<EOF_ENV
# ===== Variáveis consumidas pela compose/api =====
DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
REDIS_URL=${REDIS_URL}
JWT_SECRET=${JWT_SECRET}
ADMIN_NAME=${ADMIN_NAME}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
CORS_ORIGINS=https://${ERP_WEB_DOMAIN}

# Domínios para proxy/certbot
ERP_WEB_DOMAIN=${ERP_WEB_DOMAIN}
ERP_API_DOMAIN=${ERP_API_DOMAIN}
CERTBOT_EMAIL=${CERTBOT_EMAIL}
EOF_ENV
  ok ".env (raiz) escrito."
}

write_env_web(){
  log "Ajustando .env do frontend (Vite)…"
  if [ -f "${REPO_DIR}/web/.env.example" ]; then
    cp -n "${REPO_DIR}/web/.env.example" "${REPO_DIR}/web/.env" || true
    sed -i "s#^VITE_API_BASE=.*#VITE_API_BASE=https://${ERP_API_DOMAIN}/api#g" "${REPO_DIR}/web/.env"
    ok "web/.env atualizado (VITE_API_BASE)."
  elif [ -f "${REPO_DIR}/.env.example" ]; then
    cp -n "${REPO_DIR}/.env.example" "${REPO_DIR}/.env" || true
    sed -i "s#^VITE_API_BASE=.*#VITE_API_BASE=https://${ERP_API_DOMAIN}/api#g" "${REPO_DIR}/.env" || true
    ok ".env (raiz) ajustado para VITE_API_BASE (fallback)."
  else
    log "Aviso: não encontrei .env.example do frontend – continue apenas se já existir configuração de front."
  fi
}

### ======== COMPOSE / TLS / HEALTH ========
compose_build(){
  log "Buildando imagens…"
  docker compose -f "$COMPOSE_FILE" build
}

compose_up_infra(){
  log "Subindo dependências (db, redis)…"
  docker compose -f "$COMPOSE_FILE" up -d db redis

  log "Aguardando Postgres responder…"
  for i in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      ok "Postgres pronto."
      break
    fi
    sleep 2
    if [ "$i" -eq 30 ]; then
      err "Timeout esperando Postgres."
      exit 1
    fi
  done
}

compose_up_apps(){
  log "Subindo API, Web e Proxy…"
  docker compose -f "$COMPOSE_FILE" up -d api web proxy
}

issue_certs(){
  log "Emitindo certificados TLS (Let's Encrypt)…"
  docker compose -f "$COMPOSE_FILE" run --rm certbot \
    certonly --webroot -w /var/www/certbot \
    -d "$ERP_WEB_DOMAIN" -d "$ERP_API_DOMAIN" \
    --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email
  ok "Certificados emitidos."

  log "Testando configuração e recarregando Nginx…"
  docker compose -f "$COMPOSE_FILE" exec proxy nginx -t
  docker compose -f "$COMPOSE_FILE" exec proxy nginx -s reload
}

health_checks(){
  need_cmd curl

  log "Health check da API (worker)…"
  local code_api
  code_api=$(curl -sk -o /dev/null -w "%{http_code}" "https://${ERP_API_DOMAIN}/api/worker/health")
  if [[ "$code_api" =~ ^2 ]]; then
    ok "API worker saudável (HTTP ${code_api})."
  else
    err "API worker retornou HTTP ${code_api}."
    exit 1
  fi

  log "Verificando front (status HTTP 200/301/302 esperado)…"
  local code_web
  code_web=$(curl -sk -o /dev/null -w "%{http_code}" "https://${ERP_WEB_DOMAIN}/")
  case "$code_web" in
    200|301|302) ok "Front responde (HTTP ${code_web}).";;
    *) err "Front com status inesperado (HTTP ${code_web})."; exit 1;;
  esac
}

### ======== WORKFLOWS ========
do_setup(){
  require_root
  install_deps_rocky
  install_docker_if_needed
  open_firewalld_ports
  check_ports_free
  check_dns_points

  prepare_repo
  ensure_jwt_secret
  write_env_root
  write_env_web
  apply_selinux_contexts

  (cd "$REPO_DIR"
    compose_build
    compose_up_infra
    compose_up_apps
    issue_certs
  )

  health_checks
  ok "Noah-ERP operacional com TLS no Rocky Linux. 🚀"
}

do_upgrade(){
  require_root
  install_docker_if_needed
  open_firewalld_ports

  if [ ! -d "$REPO_DIR/.git" ]; then
    err "Repositório não encontrado em ${REPO_DIR}. Rode 'setup' primeiro."
    exit 1
  fi

  prepare_repo   # atualiza do origin/main
  apply_selinux_contexts

  (cd "$REPO_DIR"
    compose_build
    docker compose -f "$COMPOSE_FILE" up -d api web proxy  # db/redis só se necessário
  )

  health_checks
  ok "Atualização concluída e serviços saudáveis. ✅"
}

do_health(){
  require_root
  health_checks
  ok "Checks concluídos."
}

### ======== MAIN ========
case "${1:-}" in
  setup)  do_setup ;;
  upgrade) do_upgrade ;;
  health) do_health ;;
  *) echo "Uso: $0 {setup|upgrade|health}"; exit 1 ;;
esac
