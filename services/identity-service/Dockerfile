# ------------------------------------------------------------------------------
# Build Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json ./
COPY packages/ ./packages/
COPY services/identity-service/ ./services/identity-service/

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @esport-sumbar/identity-service... run build

# ------------------------------------------------------------------------------
# Production Runner Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001

RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/services/identity-service/package.json ./services/identity-service/
COPY --from=builder /app/services/identity-service/dist ./services/identity-service/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/identity-service/node_modules ./services/identity-service/node_modules

USER nestjs

EXPOSE 4001

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

CMD ["node", "services/identity-service/dist/main.js"]
