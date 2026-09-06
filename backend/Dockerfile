# ==============================================================================
# BACKEND DOCKERFILE — MULTI-STAGE BUILD (PNPM)
# ==============================================================================

# Base image
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/
COPY backend/prisma ./backend/prisma/
RUN pnpm --filter backend install --frozen-lockfile=false

# Builder stage
FROM base AS builder
COPY pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npx prisma generate
RUN pnpm build

# Runner stage (production image)
FROM node:22-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
