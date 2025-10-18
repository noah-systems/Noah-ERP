#!/usr/bin/env bash
set -euo pipefail
bad=""
while IFS= read -r -d '' f; do
  mt=$(file --mime-type -b "$f" || echo "unknown")
  case "$mt" in
    text/*|application/json|application/javascript|application/xml|application/x-yaml|inode/x-empty) ;;
    *) bad+="$f ($mt)\n" ;;
  esac
done < <(git diff --cached --name-only -z)
if [ -n "$bad" ]; then
  echo -e "❌ Arquivos binários detectados no commit:\n$bad"
  echo "👉 Remova do staging ou converta para SVG/data URI antes de commitar."
  exit 1
fi
