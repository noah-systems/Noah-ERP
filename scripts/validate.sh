#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-https://erpapi.noahomni.com.br/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@noaherp.local}"
ADMIN_PASS="${ADMIN_PASS:-D2W3£Qx!0Du#}"

echo "🔎 Health worker"
curl -fsS "$BASE/worker/health" | jq .

echo "🔐 Login"
TOKEN=$(curl -fsS -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" | jq -r '.token // .accessToken')
test -n "$TOKEN"

echo "👤 /auth/me"
curl -fsS -H "Authorization: Bearer $TOKEN" "$BASE/auth/me" | jq .

echo "🚫 ACL (rota admin sem token)"
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/users")
([[ "$code" == "401" || "$code" == "403" ]]) || (echo "ACL frouxa: $code" && exit 1)

echo "✅ Smoke OK"
