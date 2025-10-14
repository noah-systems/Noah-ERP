# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl

# Prisma schema (da raiz)
COPY prisma ./prisma

# Dependências da API
COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
RUN npm i -D @types/bcryptjs --no-audit --no-fund

# Código da API
WORKDIR /app
COPY apps/api ./apps/api

# Gera Prisma Client (apontando para schema da RAIZ)
WORKDIR /app/apps/api
RUN npx prisma generate --schema ../prisma/schema.prisma

# Compila TS -> dist
RUN npm run build

# ---------- RUNTIME ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY prisma ./prisma
COPY apps/api/package*.json ./apps/api/

COPY docker/apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
