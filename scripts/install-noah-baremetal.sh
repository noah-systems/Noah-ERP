#!/usr/bin/env bash
# Noah-ERP — Bare-metal install for Rocky Linux (no Docker)
# One-shot, idempotent, non-interactive.
# After run: Web at https://erp.noahomni.com.br and API reverse-proxied at https://erpapi.noahomni.com.br
set -euo pipefail

### ========= USER-PROVIDED DEFAULTS (EDIT LATER IF NEEDED) =========
DOMAIN_WEB="erp.noahomni.com.br"
DOMAIN_API="erpapi.noahomni.com.br"
ADMIN_NAME="Admin Noah"
ADMIN_EMAIL="admin@noahomni.com.br"
ADMIN_PASSWORD_DEFAULT="D2W3£Qx!0Du#"

DB_USER="noah"
DB_NAME="noah"
DB_PASS_DEFAULT="noah"
DB_PASS="${DB_PASS:-$DB_PASS_DEFAULT}"
API_PORT="3000"
INSTALL_DIR="/opt/noah-erp"
REPO_URL="https://github.com/noah-systems/Noah-ERP.git"
REPO_DIR="${INSTALL_DIR}/Noah-ERP"
WEB_DEPLOY="/var/www/noah-web"

### ========= HELPERS =========
log(){  echo -e "\033[1;96m==> $*\033[0m"; }
ok(){   echo -e "\033[1;92m✔ $*\033[0m"; }
warn(){ echo -e "\033[1;93m⚠ $*\033[0m"; }
err(){  echo -e "\033[1;91m✘ $*\033[0m"; }
need(){ command -v "$1" >/dev/null 2>&1 || { err "Missing '$1'"; exit 1; } }
require_root(){ [ "$(id -u)" -eq 0 ] || { err "Run as root"; exit 1; } }

detect_api_dir(){
  for d in api server backend; do
    if [ -d "${REPO_DIR}/${d}" ] && [ -f "${REPO_DIR}/${d}/package.json" ]; then echo "${REPO_DIR}/${d}"; return; fi
  done
  local s; s="$(find "${REPO_DIR}" -maxdepth 2 -type f -path '*/prisma/schema.prisma' 2>/dev/null | head -n1 || true)"
  [ -n "$s" ] && dirname "$(dirname "$s")" || echo ""
}

ensure_noah_db(){
  local password_sql
  password_sql=$(printf "%s" "$DB_PASS" | sed "s/'/''/g")

  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'noah') THEN
    CREATE ROLE noah LOGIN PASSWORD '${password_sql}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'noah') THEN
    CREATE DATABASE noah OWNER noah;
  END IF;
END $$;

ALTER DATABASE noah OWNER TO noah;
GRANT ALL PRIVILEGES ON DATABASE noah TO noah;

\connect noah
GRANT USAGE, CREATE ON SCHEMA public TO noah;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO noah;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO noah;
SQL
}

### ========= PRECHECKS =========
require_root
need dnf
log "Refreshing dnf metadata..."
dnf -y makecache >/dev/null || true

### ========= PACKAGES =========
log "Installing system packages (Node 20, Nginx, Redis, Postgres, Certbot, SELinux utils)"
# Node 20 via module if available; otherwise NodeSource
if dnf module list nodejs -y 2>/dev/null | grep -qE 'nodejs.*20'; then
  dnf -y module enable nodejs:20 >/dev/null || true
  dnf -y install nodejs >/dev/null
else
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf -y install nodejs >/dev/null
fi
dnf -y install git nginx redis \
  postgresql-server postgresql \
  certbot python3-certbot-nginx \
  policycoreutils-python-utils >/dev/null
ok "Base packages installed"

### ========= DATABASES =========
log "Initializing and enabling PostgreSQL and Redis"
if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
  /usr/bin/postgresql-setup --initdb >/dev/null
fi
systemctl enable --now postgresql >/dev/null
systemctl enable --now redis >/dev/null
ok "PostgreSQL and Redis running"

### ========= FETCH/UPDATE REPOSITORY =========
log "Cloning/updating repository into ${REPO_DIR}"
mkdir -p "${INSTALL_DIR}"
if [ -d "${REPO_DIR}/.git" ]; then
  git -C "${REPO_DIR}" pull --rebase
else
  git clone "${REPO_URL}" "${REPO_DIR}"
fi

### ========= FRONTEND BUILD =========
log "Preparing frontend .env"
cd "${REPO_DIR}"
[ -f ".env" ] || cp -f .env.example .env || true
set_kv(){ local K="$1" V="$2"; grep -q "^${K}=" .env && sed -i "s|^${K}=.*|${K}=${V}|" .env || echo "${K}=${V}" >> .env; }
set_kv VITE_API_BASE "https://${DOMAIN_API}/api"
set_kv VITE_NOAH_FAVICON "/brand/favicon.ico"
set_kv VITE_NOAH_APPLE_TOUCH "/brand/apple-touch-icon.png"
set_kv VITE_LOGIN_BG "/brand/login-eclipse-desktop.png"
set_kv VITE_LOGIN_BG_2X "/brand/login-eclipse@2x.png"
set_kv VITE_LOGIN_BG_PORTRAIT "/brand/login-eclipse-mobile.png"

log "Installing frontend deps and building (force Rollup WASM; include dev deps)"
export ROLLUP_SKIP_NODEJS_NATIVE=true
npm config set registry "https://registry.npmjs.org/" >/dev/null
# Prefer deterministic path; fallbacks keep going even if lock is out-of-sync
npm ci --no-audit --no-fund --include=dev || npm i --no-audit --no-fund --legacy-peer-deps --include=dev
npm run build

log "Publishing static site to ${WEB_DEPLOY}"
rm -rf "${WEB_DEPLOY}"
mkdir -p "${WEB_DEPLOY}"
cp -a "${REPO_DIR}/dist/." "${WEB_DEPLOY}/"
if [ -d "${REPO_DIR}/public/brand" ]; then
  mkdir -p "${WEB_DEPLOY}/brand"
  cp -a "${REPO_DIR}/public/brand/." "${WEB_DEPLOY}/brand/"
fi
semanage fcontext -a -t httpd_sys_content_t "${WEB_DEPLOY}(/.*)?" >/dev/null 2>&1 || true
restorecon -Rv "${WEB_DEPLOY}" >/dev/null 2>&1 || true
ok "Frontend published"

### ========= API PREP (PRISMA + SERVICE) =========
log "Locating API directory"
API_DIR_DISCOVERED="$(detect_api_dir)"
API_DIR="${API_DIR:-/opt/noah-erp/Noah-ERP/api}"
if [ ! -d "${API_DIR}" ]; then
  if [ -n "${API_DIR_DISCOVERED}" ] && [ -d "${API_DIR_DISCOVERED}" ]; then
    API_DIR="${API_DIR_DISCOVERED}"
  fi
fi
[ -d "${API_DIR}" ] || { err "API directory not found (expected api/server/backend)."; exit 1; }
ok "API at ${API_DIR}"

log "Preparing API environment"
cd "${API_DIR}"

log "Creating service user and environment"
id -u noah >/dev/null 2>&1 || useradd --system --home "${INSTALL_DIR}" --shell /sbin/nologin noah

API_ENV_FILE="/etc/noah-erp/api.env"

# (a) Remove prisma/.env if present (it causes collisions)
rm -f "${API_DIR}/prisma/.env"

# (b) Ensure runtime env exists and contains DATABASE_URL for user "noah"
install -d /etc/noah-erp
if [ ! -s "${API_ENV_FILE}" ]; then
  cat >"${API_ENV_FILE}" <<ENV
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://noah:${DB_PASS}@127.0.0.1:5432/noah?schema=public
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=__FILL_ME__
ADMIN_NAME=Admin Noah
ADMIN_EMAIL=admin@noahomni.com.br
ADMIN_PASSWORD=D2W3£Qx!0Du#
CORS_ORIGINS=http://localhost,http://127.0.0.1
ENV
  sed -i "s|^JWT_SECRET=__FILL_ME__|JWT_SECRET=$(openssl rand -hex 32)|" "${API_ENV_FILE}" || true
fi

# (c) Force correct DATABASE_URL (in case file existed but had wrong user)
sed -i '/^DATABASE_URL=/d' "${API_ENV_FILE}"
echo "DATABASE_URL=postgresql://noah:${DB_PASS}@127.0.0.1:5432/noah?schema=public" >>"${API_ENV_FILE}"

# (d) Link api/.env to the runtime env and export vars to current shell
ln -snf "${API_ENV_FILE}" "${API_DIR}/.env"
set -a; . "${API_ENV_FILE}"; set +a

# (e) Guardrails: fail fast if DATABASE_URL is missing
grep -q '^DATABASE_URL=' "${API_ENV_FILE}" || { err '[FATAL] DATABASE_URL missing in /etc/noah-erp/api.env'; exit 1; }

# (f) (Optional) Log which DB URL is being used (mask password)
echo "DATABASE_URL ativa: $(echo "$DATABASE_URL" | sed 's#://\([^:]*\):[^@]*@#://\1:***@#')"

log "Installing API deps"
npm ci --no-audit --no-fund --include=dev || npm i --no-audit --no-fund --legacy-peer-deps --include=dev

log "Ensuring Postgres role/database for user 'noah'"
ensure_noah_db

# (h) Run Prisma strictly in order; abort if any step fails
log "Running Prisma generate/migrate/seed"
if ! ( cd "${API_DIR}" && \
    npx prisma generate && \
    npx prisma migrate deploy && \
    node prisma/seed.js ); then
  err "[FATAL] Prisma pipeline failed"
  exit 1
fi

ok "Prisma pipeline OK"

npm run build || true

chown -R noah:noah "${INSTALL_DIR}"

log "Registering systemd service: noah-api"
cat >/etc/systemd/system/noah-api.service <<SERVICE
[Unit]
Description=Noah ERP API (Node)
After=network.target postgresql.service redis.service

[Service]
User=noah
Group=noah
EnvironmentFile=/etc/noah-erp/api.env
WorkingDirectory=${API_DIR}
ExecStart=/usr/bin/env bash -lc 'PORT=\${PORT} NODE_ENV=\${NODE_ENV} npm start'
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable --now noah-api
ok "API started"

log "Running API smoke tests"
sleep 2
if curl -fsS "http://127.0.0.1:${API_PORT}/api/worker/health" >/dev/null; then
  ok "Health check ok"
else
  warn "Health check failed (see systemctl status noah-api)"
fi

log "Testing admin login"
LOGIN_RESPONSE="$(curl -s -X POST "http://127.0.0.1:${API_PORT}/api/auth/login" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" || true)"
if echo "${LOGIN_RESPONSE}" | grep -q 'accessToken'; then
  ok "Login succeeded"
else
  warn "Login failed; response: ${LOGIN_RESPONSE}"
fi

### ========= NGINX + TLS =========
log "Configuring Nginx (web + API reverse proxy)"
cat >/etc/nginx/conf.d/noah-erp.conf <<NGINX
server {
  listen 80;
  server_name ${DOMAIN_WEB};
  root ${WEB_DEPLOY};
  index index.html;
  location /.well-known/acme-challenge/ { root /var/lib/letsencrypt/.well-known/acme-challenge/; }
  location / { try_files $uri /index.html; }
}
server {
  listen 80;
  server_name ${DOMAIN_API};
  location /.well-known/acme-challenge/ { root /var/lib/letsencrypt/.well-known/acme-challenge/; }
  location / {
    proxy_pass http://127.0.0.1:${API_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection "";
  }
}
NGINX

nginx -t
systemctl enable --now nginx

# Firewall (if firewalld exists)
if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --add-service=http --add-service=https --permanent || true
  firewall-cmd --reload || true
fi

# ACME certificates (best-effort)
log "Issuing TLS certificates with certbot (best-effort, non-interactive)"
mkdir -p /var/lib/letsencrypt/.well-known/acme-challenge/
restorecon -Rv /var/lib/letsencrypt >/dev/null 2>&1 || true
certbot --nginx -d "${DOMAIN_WEB}" -d "${DOMAIN_API}" --email "${ADMIN_EMAIL}" --agree-tos --no-eff-email -n || true
systemctl reload nginx || true
ok "Nginx configured"

### ========= SMOKE TESTS =========
log "Smoke tests"
set +e
curl -fsSI "http://${DOMAIN_WEB}" >/dev/null && ok "WEB HTTP OK (http://${DOMAIN_WEB})" || warn "WEB HTTP not reachable yet"
curl -fsSI "https://${DOMAIN_WEB}" >/dev/null && ok "WEB HTTPS OK (https://${DOMAIN_WEB})" || warn "WEB HTTPS not ready (cert?)"
curl -fsS "http://${DOMAIN_API}/api/worker/health" | grep -q '"ok":true' && ok "API health OK (HTTP)" || warn "API health not OK yet (check journalctl -u noah-api -f)"
set -e

echo
ok "Installation finished."
echo "Open WEB:  https://${DOMAIN_WEB}"
echo "API proxied: https://${DOMAIN_API}"
echo "Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD_DEFAULT}  (change later in /etc/noah-erp/api.env and: systemctl restart noah-api)"
