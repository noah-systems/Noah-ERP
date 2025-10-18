FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl

COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm install --no-audit --no-fund

COPY apps/api /app/apps/api
RUN rm -f prisma/.env && npx prisma generate --schema prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PRISMA_MIGRATE_ON_START=0

RUN apk add --no-cache postgresql-client openssl

COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/dist ./dist

COPY docker/apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
