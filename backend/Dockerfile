# -------- deps --------
FROM node:20-alpine3.23 AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# -------- build --------
FROM node:20-alpine3.23 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# -------- runtime (prod only + non-root) --------
FROM node:20-alpine3.23 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Directorio de logs y permisos al usuario node
RUN mkdir -p /app/logs /app/uploads \
    && chown -R node:node /app

USER node

EXPOSE 3000
CMD ["node", "dist/server.js"]
