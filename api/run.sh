#!/usr/bin/env sh
set -euo pipefail

npm ci
npm run generate
npm run build
npm run migrate
npm run seed
npm start
