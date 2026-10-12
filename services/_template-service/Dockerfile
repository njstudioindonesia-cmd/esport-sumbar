# ------------------------------------------------------------------------------
# Build Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json ./
COPY packages/ ./packages/
COPY services/_template-service/ ./services/_template-service/

# Install dependencies and build
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @esport-sumbar/template-service... run build

# ------------------------------------------------------------------------------
# Production Runner Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install curl for docker healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/services/_template-service/package.json ./services/_template-service/
COPY --from=builder /app/services/_template-service/dist ./services/_template-service/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/_template-service/node_modules ./services/_template-service/node_modules

USER nestjs

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["node", "services/_template-service/dist/main.js"]
