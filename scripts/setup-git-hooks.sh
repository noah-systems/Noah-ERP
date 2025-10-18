#!/usr/bin/env bash
set -euo pipefail
if command -v git >/dev/null 2>&1; then
  git config core.hooksPath .husky >/dev/null
fi
