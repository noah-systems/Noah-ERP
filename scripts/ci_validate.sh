#!/usr/bin/env bash
set -euo pipefail
API="${API_BASE:-http://localhost:3000}"
WEB="${WEB_BASE:-http://localhost:5173}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq é obrigatório para validar o healthcheck" >&2
  exit 1
fi

echo ">> HEALTH"
health="$(curl -fsS "${API}/health")"
echo "$health" | jq -e '.ok == true and .api == "up"' >/dev/null || { echo "Healthcheck inválido"; exit 1; }

# Login opcional (só testa se o endpoint existir e ADMIN_* estiverem setados)
if curl -fsS -o /dev/null -w '%{http_code}' "${API}/api/auth/login" | grep -qE '200|401|404'; then
  if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
    token="$(curl -sf -X POST "${API}/api/auth/login" -H 'Content-Type: application/json' \
      -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" | jq -r '.access_token // .token // empty' || true)"
    [ -n "$token" ] && echo "token ok" || echo "login não validado (endpoint pode não existir)"
  fi
fi

echo ">> CORS preflight"
code="$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "${API}/health" \
  -H "Origin: ${WEB}" -H "Access-Control-Request-Method: GET")"
[ "$code" = "204" -o "$code" = "200" ] || { echo "CORS falhou ($code)"; exit 1; }

echo "OK"
