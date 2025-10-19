#!/usr/bin/env bash
set -euo pipefail

API="${API_BASE:-http://localhost:3000}"
WEB="${WEB_BASE:-http://localhost:5173}"

echo ">> Health"
curl -fsS "${API}/api/health" >/dev/null || curl -fsS "${API}/api/worker/health" >/dev/null

echo ">> Login (admin)"
token="$(curl -fsS -X POST "${API}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL:-admin@noahomni.com.br}\",\"password\":\"${ADMIN_PASSWORD:-change-me-now}\"}" \
  | jq -r '.access_token // .token')"
test -n "$token" && [ "$token" != "null" ]

echo ">> ACL sanity (users requires ADMIN)"
code="$(curl -s -o /dev/null -w '%{http_code}' "${API}/api/users" -H "Authorization: Bearer ${token}")"
test "$code" -ge 200 -a "$code" -lt 300

echo ">> CORS preflight (web origin)"
code="$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "${API}/api/health" \
  -H "Origin: ${WEB}" -H "Access-Control-Request-Method: GET")"
test "$code" = "204" -o "$code" = "200"

echo "OK"
