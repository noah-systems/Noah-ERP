#!/usr/bin/env sh
set -e

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

cd /app/apps/api
node ./node_modules/.bin/prisma generate --schema ./prisma/schema.prisma
node ./node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma
exec node dist/main.js
