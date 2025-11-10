FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
WORKDIR /app

# Instala dependências da API (inclui dev para build)
COPY package.json /app/
RUN npm install && npm cache clean --force

# Copia código da API
COPY tsconfig.build.json tsconfig.json /app/
COPY src /app/src

# Build
RUN npm run build

# Remove dependências de dev para o runtime
RUN npm prune --omit=dev && npm cache clean --force

# Runtime stage
FROM node:20-alpine AS runtime
RUN apk add --no-cache netcat-openbsd postgresql-client
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3000
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/dist /app/dist
COPY --from=base /app/src/database /app/src/database
COPY package.json /app/package.json

EXPOSE 3000
CMD ["node", "dist/main.js"]
