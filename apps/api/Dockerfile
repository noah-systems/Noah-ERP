FROM node:20-alpine AS build
WORKDIR /app

RUN set -eux; \
    printf 'nameserver 1.1.1.1\nnameserver 8.8.8.8\n' > /etc/resolv.conf; \
    if [ -d /etc/apt ]; then \
        mkdir -p /etc/apt/apt.conf.d; \
        printf 'Acquire::Retries "5";\n' > /etc/apt/apt.conf.d/80-retries; \
        sed -i 's#http://deb.debian.org/debian#http://mirror.hetzner.com/debian#g; s#http://security.debian.org/debian-security#http://mirror.hetzner.com/debian-security#g' /etc/apt/sources.list || true; \
    fi; \
    apk add --no-cache \
        bash \
        openssl \
        postgresql-client \
        python3 \
        make \
        g++ \
        git

# Copiar manifestos e scripts necessários para instalar dependências (cache melhor)
COPY apps/api/package*.json ./apps/api/
COPY apps/api/scripts ./apps/api/scripts
WORKDIR /app/apps/api
RUN set -eux; \
    npm config set fund false; \
    npm config set audit false; \
    npm config set fetch-retry-mintimeout 20000; \
    npm config set fetch-retry-maxtimeout 120000; \
    npm config set fetch-retry-factor 10; \
    install_success=0; \
    ci_attempted=0; \
    for attempt in 1 2 3; do \
        if [ -f package-lock.json ] && [ "${ci_attempted}" -eq 0 ]; then \
            if npm ci --no-audit --no-fund; then \
                install_success=1; \
                break; \
            fi; \
            echo 'npm ci failed; falling back to npm install' >&2; \
            ci_attempted=1; \
        fi; \
        if npm install --no-audit --no-fund; then \
            install_success=1; \
            break; \
        fi; \
        if [ "${attempt}" -eq 3 ]; then \
            break; \
        fi; \
        echo "npm install attempt ${attempt} failed, cleaning cache and retrying..." >&2; \
        npm cache clean --force; \
        sleep $((attempt * 2)); \
    done; \
    if [ "${install_success}" -ne 1 ]; then \
        echo 'npm dependency installation failed after retries' >&2; \
        exit 1; \
    fi

# Copiar fontes e prisma e buildar
COPY apps/api ./
RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app/apps/api

# Ferramentas úteis p/ health e prisma
RUN set -eux; \
    printf 'nameserver 1.1.1.1\nnameserver 8.8.8.8\n' > /etc/resolv.conf; \
    if [ -d /etc/apt ]; then \
        mkdir -p /etc/apt/apt.conf.d; \
        printf 'Acquire::Retries "5";\n' > /etc/apt/apt.conf.d/80-retries; \
        sed -i 's#http://deb.debian.org/debian#http://mirror.hetzner.com/debian#g; s#http://security.debian.org/debian-security#http://mirror.hetzner.com/debian-security#g' /etc/apt/sources.list || true; \
    fi; \
    apk add --no-cache \
        bash \
        openssl \
        postgresql-client \
        curl

# Copiar só artefatos de runtime
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY docker/apps/api/entrypoint.sh /entrypoint.sh

ENV NODE_ENV=production PORT=3000
EXPOSE 3000

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
