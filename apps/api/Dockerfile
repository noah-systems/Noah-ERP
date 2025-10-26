FROM node:20-alpine AS build
WORKDIR /app

ENV PRISMA_SCHEMA_PATH=/app/prisma/schema.prisma

RUN set -eux; \
    if [ -d /etc/apt ]; then \
        mkdir -p /etc/apt/apt.conf.d; \
        printf 'Acquire::Retries "5";\n' > /etc/apt/apt.conf.d/80-retries; \
        sed -i 's#http://deb.debian.org/debian#http://mirror.hetzner.com/debian#g; s#http://security.debian.org/debian-security#http://mirror.hetzner.com/debian-security#g' /etc/apt/sources.list || true; \
    fi; \
    apk add --no-cache \
        bash \
        openssl \
        ca-certificates \
        postgresql-client \
        python3 \
        make \
        g++ \
        git; \
    if command -v apt-get >/dev/null 2>&1; then \
        apt-get update; \
        apt-get install -y --no-install-recommends openssl ca-certificates; \
        rm -rf /var/lib/apt/lists/*; \
    fi

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
COPY prisma /app/prisma
COPY apps/api ./
RUN rm -rf prisma && ln -s ../prisma prisma
RUN npx prisma generate --schema "$PRISMA_SCHEMA_PATH" && npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
ENV PRISMA_SCHEMA_PATH=/app/prisma/schema.prisma
WORKDIR /app/apps/api

# Ferramentas úteis p/ health e prisma
RUN set -eux; \
    if [ -d /etc/apt ]; then \
        mkdir -p /etc/apt/apt.conf.d; \
        printf 'Acquire::Retries "5";\n' > /etc/apt/apt.conf.d/80-retries; \
        sed -i 's#http://deb.debian.org/debian#http://mirror.hetzner.com/debian#g; s#http://security.debian.org/debian-security#http://mirror.hetzner.com/debian-security#g' /etc/apt/sources.list || true; \
    fi; \
    apk add --no-cache \
        bash \
        openssl \
        ca-certificates \
        postgresql-client \
        curl; \
    if command -v apt-get >/dev/null 2>&1; then \
        apt-get update; \
        apt-get install -y --no-install-recommends openssl ca-certificates; \
        rm -rf /var/lib/apt/lists/*; \
    fi

# Copiar só artefatos de runtime
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/prisma ./prisma
COPY docker/apps/api/entrypoint.sh /entrypoint.sh

ENV NODE_ENV=production PORT=3000
EXPOSE 3000

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
