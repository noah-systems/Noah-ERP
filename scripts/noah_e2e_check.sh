#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Uso: $0 --front <host> --api <host> --admin-email <email> --admin-pass <senha>
  --front        Host do front-end publicado (sem protocolo)
  --api          Host da API publicada (sem protocolo)
  --admin-email  E-mail do usuário administrador seedado
  --admin-pass   Senha do usuário administrador seedado
USAGE
}

FRONT_HOST=""
API_HOST=""
ADMIN_EMAIL=""
ADMIN_PASS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --front)
      FRONT_HOST="$2"
      shift 2
      ;;
    --api)
      API_HOST="$2"
      shift 2
      ;;
    --admin-email)
      ADMIN_EMAIL="$2"
      shift 2
      ;;
    --admin-pass)
      ADMIN_PASS="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Parâmetro desconhecido: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$FRONT_HOST" || -z "$API_HOST" || -z "$ADMIN_EMAIL" || -z "$ADMIN_PASS" ]]; then
  echo "Parâmetros obrigatórios ausentes." >&2
  usage
  exit 1
fi

FRONT_URL="https://${FRONT_HOST}"
API_BASE="https://${API_HOST}"
API_URL="${API_BASE}/api"

STATUS="OK"
trap 'if [[ "$STATUS" == "OK" ]]; then echo "STATUS FINAL: OK"; else echo "STATUS FINAL: FAIL"; fi' EXIT

echo "==> Checando front ${FRONT_URL}"
if ! curl -fsS --head --max-time 10 "$FRONT_URL" > /dev/null; then
  echo "Falha ao acessar o front em ${FRONT_URL}" >&2
  STATUS="FAIL"
  exit 1
fi

echo "==> Checando health-check ${API_BASE}/ping"
if ! curl -fsS --max-time 10 "${API_BASE}/ping" | grep -q '"ok":true'; then
  echo "Health-check falhou em ${API_BASE}/ping" >&2
  STATUS="FAIL"
  exit 1
fi

echo "==> Validando preflight CORS em ${API_URL}/auth/login"
if ! curl -fsS -o /dev/null -X OPTIONS "${API_URL}/auth/login" \
  -H "Origin: ${FRONT_URL}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  --max-time 10; then
  echo "Preflight CORS falhou em ${API_URL}/auth/login" >&2
  STATUS="FAIL"
  exit 1
fi

echo "==> Realizando login"
LOGIN_PAYLOAD=$(python3 - <<PY
import json, sys
print(json.dumps({"email": sys.argv[1], "password": sys.argv[2]}))
PY
"$ADMIN_EMAIL" "$ADMIN_PASS")

LOGIN_RESPONSE=$(curl -fsS -H 'Content-Type: application/json' -d "$LOGIN_PAYLOAD" "${API_URL}/auth/login" --max-time 15)
TOKEN=$(printf '%s' "$LOGIN_RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
if [[ -z "$TOKEN" ]]; then
  echo "Login não retornou token" >&2
  STATUS="FAIL"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer ${TOKEN}"

echo "==> Verificando /auth/me"
if ! curl -fsS -H "$AUTH_HEADER" "${API_URL}/auth/me" --max-time 10 > /dev/null; then
  echo "Falha ao chamar /auth/me" >&2
  STATUS="FAIL"
  exit 1
fi

LEAD_NAME="Lead QA $(date +%s)"
echo "==> Criando lead '${LEAD_NAME}'"
CREATE_PAYLOAD=$(python3 - <<PY
import json, sys
print(json.dumps({"name": sys.argv[1], "value": 1234}))
PY
"$LEAD_NAME")

LEAD_RESPONSE=$(curl -fsS -H "$AUTH_HEADER" -H 'Content-Type: application/json' -d "$CREATE_PAYLOAD" "${API_URL}/leads" --max-time 15)
LEAD_ID=$(printf '%s' "$LEAD_RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
if [[ -z "$LEAD_ID" ]]; then
  echo "Criação de lead não retornou id" >&2
  STATUS="FAIL"
  exit 1
fi

echo "==> Movendo lead ${LEAD_ID} para QUALIFICADO"
MOVE_PAYLOAD='{"stage":"QUALIFICADO"}'
if ! curl -fsS -H "$AUTH_HEADER" -H 'Content-Type: application/json' -d "$MOVE_PAYLOAD" "${API_URL}/leads/${LEAD_ID}/move" --max-time 10 > /dev/null; then
  echo "Falha ao mover lead ${LEAD_ID}" >&2
  STATUS="FAIL"
  exit 1
fi

echo "==> Listando leads e garantindo presença do ID"
LIST_RESPONSE=$(curl -fsS -H "$AUTH_HEADER" "${API_URL}/leads" --max-time 10)
python3 - "$LEAD_ID" <<'PY'
import json, sys
lead_id = sys.argv[1]
items = json.loads(sys.stdin.read())
if not any(item.get("id") == lead_id for item in items):
    sys.stderr.write(f"Lead {lead_id} não encontrado na listagem\n")
    sys.exit(1)
PY


echo "==> Apagando lead ${LEAD_ID}"
if ! curl -fsS -X DELETE -H "$AUTH_HEADER" "${API_URL}/leads/${LEAD_ID}" --max-time 10 > /dev/null; then
  echo "Falha ao deletar lead ${LEAD_ID}" >&2
  STATUS="FAIL"
  exit 1
fi

echo "Fluxo concluído com sucesso."
