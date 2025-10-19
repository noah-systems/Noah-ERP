#!/usr/bin/env bash
set -euo pipefail
cp -n ./.env.example ./.env || true
docker compose -f docker/compose.dev.yml up -d --build
echo "Dev up: http://localhost:5173 (web) | http://localhost:3000/api/health (api)"
