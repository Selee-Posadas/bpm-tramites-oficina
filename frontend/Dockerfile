# ==============================================================================
# FRONTEND DOCKERFILE — MULTI-STAGE BUILD (PNPM NEXT.JS)
# ==============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY frontend/package.json frontend/
RUN pnpm --filter frontend install --frozen-lockfile=false

# Builder stage
FROM base AS builder
COPY pnpm-workspace.yaml package.json ./
COPY frontend/package.json frontend/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend/ ./frontend/
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app/frontend
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
