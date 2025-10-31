#!/bin/bash
set -euo pipefail

# Script para Codex - Configurar PostgreSQL e Redis

# 1. Configurar PostgreSQL
sudo -u postgres psql -c "CREATE USER noah_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE noah_erp;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE noah_erp TO noah_user;"

# 2. Instalar e configurar Redis
sudo apt-get update
sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server

# 3. Testar conexões
psql -U noah_user -d noah_erp -h localhost -c "SELECT 1;"
redis-cli ping

# 4. Executar migrações
cd /var/www/erp.noahomni.com.br/apps/api
npx prisma db push
