#!/bin/sh
set -e
echo "[api] prisma migrate deploy..."
node ./apps/api/node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma || true
echo "[api] starting..."
node ./apps/api/dist/main.js
