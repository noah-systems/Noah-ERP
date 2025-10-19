#!/usr/bin/env bash
set -euo pipefail
API="${API_BASE:-http://localhost:3000}"
WEB="${WEB_BASE:-http://localhost:5173}"

echo ">> HEALTH"
curl -fsS "${API}/api/health" >/dev/null || curl -fsS "${API}/api/worker/health" >/dev/null

# Login opcional: se existir endpoint /api/auth/login, tenta validar token.
if curl -fsS -o /dev/null -w '%{http_code}' "${API}/api/auth/login" | grep -qE '200|401|404'; then
  if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
    echo ">> LOGIN (se suportado)"
    token="$(curl -sf -X POST "${API}/api/auth/login" -H 'Content-Type: application/json' \
      -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" | jq -r '.access_token // .token // empty' || true)"
    [ -n "$token" ] && echo "token ok" || echo "login não validado (endpoint pode não existir)"
    # ACL opcional: só testa /api/users se obteve token
    if [ -n "$token" ]; then
      code="$(curl -s -o /dev/null -w '%{http_code}' "${API}/api/users" -H "Authorization: Bearer ${token}")"
      case "$code" in
        2*) echo "ACL básica OK (users respondeu ${code})." ;;
        *)  echo "ACL: verifique papeis/guards (HTTP ${code})." ;;
      esac
    fi
  fi
fi

echo ">> CORS preflight"
code="$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "${API}/api/health" \
  -H "Origin: ${WEB}" -H "Access-Control-Request-Method: GET")"
[ "$code" = "204" -o "$code" = "200" ] || { echo "CORS falhou ($code)"; exit 1; }

echo "OK"
