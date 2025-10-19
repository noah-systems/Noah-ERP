#!/usr/bin/env bash
set -euo pipefail
if [ -d "./api" ]; then
  echo "❌ Pasta ./api detectada (backend antigo). Use apenas apps/api."
  exit 1
fi
echo "✅ Repo ok (apps/api único)."
