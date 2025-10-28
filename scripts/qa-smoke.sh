#!/usr/bin/env bash
set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "curl é obrigatório para executar o smoke test" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq é obrigatório para validar a API" >&2
  exit 1
fi

curl -fsS http://localhost/ | grep -qi '</html>'

curl -fsS http://localhost/api/health \
  | jq -e '.ok == true and .api == "up"' >/dev/null

if command -v psql >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
  psql "${DATABASE_URL}" -c 'SELECT 1' >/dev/null
fi

echo "Smoke test concluído com sucesso."
