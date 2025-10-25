#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN=${1:-erp.noahomni.com.br}

echo "[tls] solicitando certificado LE (webroot)…"
docker compose -f docker/compose.prod.yml run --rm certbot \
  certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -m "${LE_EMAIL:?set in .env}" --agree-tos --no-eff-email \
  --non-interactive --keep-until-expiring --rsa-key-size 4096

echo "[tls] trocando Nginx para HTTPS…"
install -D docker/proxy/default.https.conf /opt/noah-erp/nginx/default.https.conf
ln -sf /opt/noah-erp/nginx/default.https.conf /opt/noah-erp/nginx/default.conf

docker compose -f docker/compose.prod.yml exec -T proxy nginx -s reload || docker compose -f docker/compose.prod.yml restart proxy

echo "[tls] pronto."
