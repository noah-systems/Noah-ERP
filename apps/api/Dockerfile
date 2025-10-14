FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY apps/api/package*.json ./apps/api/
WORKDIR /app/apps/api
RUN npm install --no-audit --no-fund && npm i -D @types/bcryptjs --no-audit --no-fund
WORKDIR /app
COPY prisma ./prisma
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npx prisma generate --schema ../../prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/prisma ./prisma
COPY docker/apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
