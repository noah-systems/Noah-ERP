FROM node:20-alpine AS build
WORKDIR /app

# Install runtime libraries required by Prisma's engines during the build.
RUN apk add --no-cache openssl

# Install dependencies for the API workspace
COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm ci --no-audit --no-fund

# Copy project sources and Prisma schema
COPY apps/api/prisma ./prisma
COPY apps/api /app/apps/api

RUN rm -f ./prisma/.env && npx prisma generate

# Build TypeScript sources
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PRISMA_MIGRATE_ON_START=0

# Required tools for the entrypoint checks and Prisma engine
RUN apk add --no-cache postgresql-client openssl bash

# Copy only the runtime artifacts
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/package-lock.json ./
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/dist ./dist

RUN mkdir -p /app/scripts
COPY scripts/prisma_migrate_deploy.sh /app/scripts/prisma_migrate_deploy.sh
RUN chmod +x /app/scripts/prisma_migrate_deploy.sh

COPY docker/apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
