#!/usr/bin/env bash
set -euo pipefail

echo "Noah-ERP — CI Validate"
fail=0

check() {
  local name="$1"; shift
  if eval "$@"; then
    echo "PASS  $name"
  else
    echo "FAIL  $name"
    fail=1
  fi
}

# Evitar backend duplicado
check "Somente apps/api existe (sem /api)" \
  'test ! -d "api"'

# Front aponta para API Base obrigatória
check "src/lib/api.ts exige VITE_API_BASE" \
  'grep -q "VITE_API_BASE" src/lib/api.ts'

# Guards de ACL presentes
check "RolesGuard presente" \
  'grep -Rqs "export class RolesGuard" apps/api/src/modules/auth/roles.guard.ts'

# Docker compose de prod existe
check "docker/compose.prod.yml existe" \
  'test -f docker/compose.prod.yml'

# Nginx com proxy / e /api
check "Nginx com proxy para / e /api" \
  'grep -q "location /api" docker/proxy/nginx.conf && grep -q "location / " docker/proxy/nginx.conf'

# Prisma schema presente
check "Prisma schema ok" \
  'test -f apps/api/prisma/schema.prisma'

exit $fail
