FROM node:20-alpine AS base
WORKDIR /app
EXPOSE 3000

# ローカル開発（アプリ未初期化時はコンテナを待機、初期化後はdev server起動）
FROM base AS development
CMD ["sh", "-c", "if [ -f package.json ]; then npm run dev; else tail -f /dev/null; fi"]

# 本番ビルド
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
ARG API_BASE_URL=http://backend:8000
ENV API_BASE_URL=${API_BASE_URL}
RUN npm run build

# 本番（pm2）
FROM node:20-alpine AS production
RUN npm install -g pm2
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.* ./
ENV API_BASE_URL=http://backend:8000
ENV NODE_ENV=production
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["pm2-runtime", "npm", "--", "start"]
