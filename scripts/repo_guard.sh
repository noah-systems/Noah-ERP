#!/usr/bin/env bash
set -euo pipefail
if [ -d "./api" ]; then
  echo "❌ ./api detectado (backend legado). Use apenas apps/api."
  exit 1
fi
[ -f "apps/api/src/main.ts" ] || { echo "❌ apps/api/src/main.ts ausente"; exit 1; }
echo "✅ Estrutura OK (apps/api único)."
