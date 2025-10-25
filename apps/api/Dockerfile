FROM node:20-bookworm-slim AS build
WORKDIR /app

# Dependências de build
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        openssl \
        postgresql-client \
        python3 \
        make \
        g++ \
        git \
    && rm -rf /var/lib/apt/lists/*

# Copiar manifetos e instalar no modo workspace (somente o que é preciso para a API)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY apps/api/package.json ./apps/api/
RUN npm ci --no-audit --no-fund

# Copiar fontes e prisma e buildar
COPY apps/api ./apps/api
COPY apps/api/prisma ./prisma
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app/apps/api

# Ferramentas úteis p/ health e prisma
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        openssl \
        postgresql-client \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar só artefatos de runtime
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY docker/apps/api/entrypoint.sh /entrypoint.sh

ENV NODE_ENV=production PORT=3000
EXPOSE 3000

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
