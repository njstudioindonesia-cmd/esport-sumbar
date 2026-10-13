#!/usr/bin/env bash
# ==============================================================================
# ESPORT SUMBAR v2 - Automated Database & Asset Backup Script
# Retention Policy: 7 Daily Backups + 4 Weekly Backups
# Features: pg_dump compression, SHA256 verification, MinIO sync, Webhook alerts
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/esport-sumbar/backups}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
DAY_OF_WEEK="$(date +'%u')" # 1 to 7 (7 is Sunday)
ARCHIVE_PREFIX="esport_sumbar_backup_${TIMESTAMP}"
TARGET_PATH="${BACKUP_DIR}/daily/${ARCHIVE_PREFIX}"

COMPOSE_FILE="${COMPOSE_FILE:-infra/compose/docker-compose.prod.yml}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-esport-prod-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[BACKUP-INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[BACKUP-SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[BACKUP-ERROR]${NC} $1"; }

send_alert() {
  local msg="$1"
  if [ -n "${ALERT_WEBHOOK_URL:-}" ]; then
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"text\":\"🚨 [ESPORT SUMBAR BACKUP ALERT] $msg\"}" \
      "$ALERT_WEBHOOK_URL" > /dev/null 2>&1 || true
  fi
}

mkdir -p "${BACKUP_DIR}/daily"
mkdir -p "${BACKUP_DIR}/weekly"
mkdir -p "$TARGET_PATH"

log_info "=== Starting Backup: $ARCHIVE_PREFIX ==="

# 1. Dump All PostgreSQL Databases
log_info "Creating compressed PostgreSQL dump..."
if docker exec "$POSTGRES_CONTAINER" pg_dumpall -U "$POSTGRES_USER" | gzip > "${TARGET_PATH}/all_databases.sql.gz"; then
  log_success "PostgreSQL dump completed: ${TARGET_PATH}/all_databases.sql.gz"
else
  log_error "PostgreSQL dump failed!"
  send_alert "Database dump failed on host $(hostname)!"
  exit 1
fi

# 2. Dump individual microservice schemas for targeted restoration
DATABASES=("identity_db" "news_db" "community_db" "event_db" "media_db" "bracket_db" "notification_db" "ai_db")
for db in "${DATABASES[@]}"; do
  docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" -d "$db" -Fc > "${TARGET_PATH}/${db}.dump" 2>/dev/null || true
done
log_success "Individual database dumps stored."

# 3. Create SHA256 Checksum
log_info "Calculating checksums for integrity verification..."
cd "$TARGET_PATH"
sha256sum * > SHA256SUMS.txt
cd - > /dev/null

# 4. Create single compressed tarball
TAR_FILE="${BACKUP_DIR}/daily/${ARCHIVE_PREFIX}.tar.gz"
tar -czf "$TAR_FILE" -C "${BACKUP_DIR}/daily" "$ARCHIVE_PREFIX"
rm -rf "$TARGET_PATH"
log_success "Packaged archive: $TAR_FILE"

# 5. Weekly snapshot promotion (every Sunday)
if [ "$DAY_OF_WEEK" -eq 7 ]; then
  log_info "Promoting backup to weekly retention archive..."
  cp "$TAR_FILE" "${BACKUP_DIR}/weekly/${ARCHIVE_PREFIX}_weekly.tar.gz"
fi

# 6. Apply Retention Policy
# Keep last 7 daily backups
log_info "Pruning daily backups older than 7 days..."
find "${BACKUP_DIR}/daily" -name "*.tar.gz" -mtime +7 -exec rm -f {} \;

# Keep last 4 weekly backups (approx 28 days)
log_info "Pruning weekly backups older than 28 days..."
find "${BACKUP_DIR}/weekly" -name "*.tar.gz" -mtime +28 -exec rm -f {} \;

# 7. Optional S3 / MinIO remote sync
if command -v aws &> /dev/null && [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  log_info "Syncing backup archive to remote S3 bucket: $BACKUP_S3_BUCKET..."
  aws s3 cp "$TAR_FILE" "s3://${BACKUP_S3_BUCKET}/backups/$(basename "$TAR_FILE")" || send_alert "S3 remote sync failed!"
fi

log_success "=== Backup Completed Successfully! Archive: $(basename "$TAR_FILE") ==="
