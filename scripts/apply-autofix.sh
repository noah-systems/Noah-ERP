#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

run() {
  log "→ $*"
  "$@"
}

log "Starting Noah ERP automatic repair"

log "Cleaning previous node modules and cache"
rm -rf node_modules package-lock.json apps/api/package-lock.json
run npm cache clean --force

log "Installing root dependencies"
run npm install --legacy-peer-deps --force

log "Installing API specific dependencies"
run npm --prefix apps/api install --legacy-peer-deps --force

log "Building API"
run npm run build:api

log "Building web frontend"
run npm run build:web

if command -v pm2 >/dev/null 2>&1; then
  log "Restarting PM2 managed API"
  pm2 delete all || true
  run pm2 start npm --name "noah-api" -- run start:prod
  pm2 save || true
  pm2 startup | bash || true
else
  log "pm2 not found; skipping process manager restart"
fi

HEALTH_URL="https://erp.noahomni.com.br/api/health"
log "Waiting for service health check at ${HEALTH_URL}"
for attempt in {1..10}; do
  if curl -fsS "${HEALTH_URL}" >/tmp/noah-health.log; then
    log "Health check passed"
    cat /tmp/noah-health.log
    exit 0
  fi
  log "Health check attempt ${attempt} failed; retrying in 5s"
  sleep 5

done

log "Health check failed after multiple attempts"
exit 1
