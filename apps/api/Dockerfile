FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies for the API workspace
COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm ci --no-audit --no-fund

# Copy project sources and Prisma schema
WORKDIR /app
COPY prisma ./prisma
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN mkdir -p prisma && cp /app/prisma/schema.prisma /app/apps/api/prisma/schema.prisma
RUN npx prisma generate --schema /app/apps/api/prisma/schema.prisma

# Build TypeScript sources
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PRISMA_MIGRATE_ON_START=0

# Required tools for the entrypoint checks and Prisma engine
RUN apk add --no-cache postgresql-client
RUN apk add --no-cache openssl1.1-compat || apk add --no-cache openssl || true

# Copy only the runtime artifacts
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/dist ./dist

COPY docker/apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
