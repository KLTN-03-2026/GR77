# ---------- builder ----------
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# pnpm via corepack
RUN corepack enable

# Copy workspace manifests first (cache tốt)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# Copy ALL package manifests in monorepo to ensure pnpm install can validate lockfile
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install full deps (vì cần build + prisma generate)
# Use --no-frozen-lockfile to allow pnpm to adjust versions for monorepo consistency during build
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY . .

# Generate prisma + build api
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# Deploy production bundle for api into /out
# (chỉ production deps + built output của api)
RUN pnpm --filter api deploy --legacy --prod /out

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy deployed bundle only
COPY --from=builder /out ./

RUN npx prisma generate

# IMPORTANT:
# deploy thường tạo cấu trúc kiểu:
# /app/package.json, /app/node_modules, /app/dist, ...
# Với dự án bạn, entry là dist/src/main.js
EXPOSE 3000
CMD ["node", "dist/src/main.js"]