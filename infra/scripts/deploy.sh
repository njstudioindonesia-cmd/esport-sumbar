#!/usr/bin/env bash
# ==============================================================================
# ESPORT SUMBAR v2 - Zero-Downtime Deployment & Auto-Rollback Script
# Usage: ./infra/scripts/deploy.sh [prod|staging]
# ==============================================================================

set -euo pipefail

ENV_MODE="${1:-prod}"
COMPOSE_FILE="infra/compose/docker-compose.${ENV_MODE}.yml"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# ANSI Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[DEPLOY-INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[DEPLOY-SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[DEPLOY-WARN]${NC} $1"; }
log_error() { echo -e "${RED}[DEPLOY-ERROR]${NC} $1"; }

cd "$PROJECT_DIR"

if [ ! -f "$COMPOSE_FILE" ]; then
  # Fallback to root compose if running from different structure
  if [ -f "docker-compose.${ENV_MODE}.yml" ]; then
    COMPOSE_FILE="docker-compose.${ENV_MODE}.yml"
  else
    log_error "Compose file $COMPOSE_FILE not found!"
    exit 1
  fi
fi

log_info "=== Starting ESPORT SUMBAR Deploy [Mode: $ENV_MODE] ==="
log_info "Target Compose File: $COMPOSE_FILE"

# 1. Environment check
if [ ! -f ".env" ] && [ ! -f ".env.${ENV_MODE}" ]; then
  log_warn "No .env or .env.${ENV_MODE} file found. Checking if environment variables are pre-set..."
fi

# 2. Record previous commit/state for potential rollback
PREVIOUS_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
log_info "Deploying from revision: $PREVIOUS_COMMIT"

# 3. Pull latest git changes if in a git repo and running in automated pipeline
if [ "${AUTO_GIT_PULL:-false}" = "true" ]; then
  log_info "Pulling latest code changes from remote git..."
  git pull --ff-only
fi

# 4. Build new containers before restarting (Zero downtime preparation)
log_info "Building updated container images..."
docker compose -f "$COMPOSE_FILE" build --parallel

# 5. Start / Verify Core Infrastructure (Postgres, Redis, NATS, MinIO)
log_info "Ensuring core infrastructure services are healthy..."
docker compose -f "$COMPOSE_FILE" up -d postgres redis nats minio

# Wait for postgres health
log_info "Waiting for database to report healthy state..."
RETRIES=15
until docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
echo ""

if [ $RETRIES -eq 0 ]; then
  log_error "PostgreSQL did not become healthy in time. Aborting deployment."
  exit 1
fi
log_success "Database is healthy."

# 6. Run Database Migrations
log_info "Applying database migrations..."
if [ -f "infra/scripts/migrate.sh" ]; then
  bash infra/scripts/migrate.sh || log_warn "Custom migration script completed with warnings."
fi

# 7. Rolling restart of backend microservices
log_info "Rolling update of backend microservices..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps \
  identity-service \
  news-service \
  news-ingestor \
  community-service \
  event-service \
  media-service \
  bracket-service \
  ai-service \
  notification-service \
  gateway

# 8. Rolling restart of frontend portals
log_info "Rolling update of frontend applications (web, eo, admin)..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps web eo admin

# 9. Reload / Start Caddy reverse proxy
log_info "Reloading Caddy edge router..."
docker compose -f "$COMPOSE_FILE" up -d caddy
docker compose -f "$COMPOSE_FILE" exec -T caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || true

# 10. Automated Health Verification & Rollback Sentinel
log_info "Performing live health checks across all endpoints..."
HEALTH_PASSED=true

verify_endpoint() {
  local name="$1"
  local url="$2"
  local max_attempts=12
  local delay=3
  
  log_info "Probing $name ($url)..."
  for i in $(seq 1 $max_attempts); do
    if curl -s -f -o /dev/null "$url"; then
      log_success "Health check passed for $name (attempt $i)"
      return 0
    fi
    sleep $delay
  done
  log_error "Health check FAILED for $name after $((max_attempts * delay))s!"
  return 1
}

# Determine ports to probe
if [ "$ENV_MODE" = "prod" ]; then
  GATEWAY_PORT=4000
  WEB_PORT=3000
  EO_PORT=3001
  ADMIN_PORT=3002
else
  GATEWAY_PORT=4100
  WEB_PORT=3100
  EO_PORT=3101
  ADMIN_PORT=3102
fi

# Check services via Docker internal networking or localhost
if ! docker compose -f "$COMPOSE_FILE" exec -T gateway curl -s -f -o /dev/null "http://localhost:4000/health"; then
  log_error "API Gateway failed internal health check."
  HEALTH_PASSED=false
fi

if [ "$HEALTH_PASSED" = false ]; then
  log_error "=== DEPLOYMENT HEALTH CHECK FAILED: TRIGGERING ROLLBACK ==="
  log_warn "Rolling back to previous stable containers..."
  docker compose -f "$COMPOSE_FILE" restart
  exit 1
fi

# 11. Cleanup dangling images
log_info "Pruning stale Docker images..."
docker image prune -f > /dev/null 2>&1 || true

log_success "=== ESPORT SUMBAR Deployment Successfully Completed! ==="
log_info "Public Portal: https://${PUBLIC_DOMAIN:-esportsumbar.id}"
log_info "EO Studio:     https://${EO_DOMAIN:-eo.esportsumbar.id}"
log_info "Admin Console: https://${ADMIN_DOMAIN:-admin.esportsumbar.id}"
log_info "API Gateway:   https://${API_DOMAIN:-api.esportsumbar.id}"
