# ---- build stage ----
FROM node:24-alpine3.23 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage (non-root) ----
FROM nginxinc/nginx-unprivileged:1.28.0-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx unprivileged ya escucha típicamente en 8080
EXPOSE 8080
