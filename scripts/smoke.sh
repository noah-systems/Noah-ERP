#!/usr/bin/env bash
set -euo pipefail
API="https://erpapi.noahomni.com.br/api"
FRONT="https://erp.noahomni.com.br"

cecho(){ printf "\033[1;34m==> %s\033[0m\n" "$*"; }

cecho "Preflight"
curl -s -o /dev/null -w "%{http_code}\n" -X OPTIONS \
  -H 'Origin: '"$FRONT" \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type' \
  "$API/auth/login" | grep -qx 204

cecho "Login 401 sem token (esperado)"
curl -s -o /dev/null -w "%{http_code}\n" "$API/auth/me" | grep -qx 401

cecho "Login admin (200)"
HTTP=$(curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -H 'content-type: application/json' \
  -d '{"email":"admin@noahomni.com.br","password":"D2W3£Qx!0Du#"}' \
  "$API/auth/login")
[ "$HTTP" = "200" ]

cecho "Front /login (200 SPA)"
curl -s -o /dev/null -w "%{http_code}\n" "$FRONT/login" | grep -qx 200

echo "OK"
