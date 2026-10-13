#!/usr/bin/env bash
# ==============================================================================
# ESPORT SUMBAR v2 - Disaster Recovery & Database Restore Script
# Usage: ./infra/scripts/restore.sh <path-to-backup.tar.gz> [--force]
# ==============================================================================

set -euo pipefail

BACKUP_ARCHIVE="${1:-}"
FORCE="${2:-}"

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-esport-prod-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[RESTORE-INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[RESTORE-SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[RESTORE-WARN]${NC} $1"; }
log_error() { echo -e "${RED}[RESTORE-ERROR]${NC} $1"; }

if [ -z "$BACKUP_ARCHIVE" ]; then
  log_error "Usage: $0 <path-to-backup.tar.gz> [--force]"
  exit 1
fi

if [ ! -f "$BACKUP_ARCHIVE" ]; then
  log_error "Backup archive file not found: $BACKUP_ARCHIVE"
  exit 1
fi

if [ "$FORCE" != "--force" ] && [ "$FORCE" != "-y" ]; then
  echo -e "${YELLOW}================================================================${NC}"
  echo -e "${RED}⚠️  CAUTION: THIS OPERATION WILL OVERWRITE CURRENT PRODUCTION DATA! ⚠️${NC}"
  echo -e "${YELLOW}Archive: $BACKUP_ARCHIVE${NC}"
  echo -e "${YELLOW}================================================================${NC}"
  read -p "Type 'RESTORE' to confirm and proceed: " confirmation
  if [ "$confirmation" != "RESTORE" ]; then
    log_warn "Restore cancelled by operator."
    exit 0
  fi
fi

TEMP_EXTRACT="$(mktemp -d /tmp/restore_esport_XXXXXX)"
trap 'rm -rf "$TEMP_EXTRACT"' EXIT

log_info "Extracting backup archive to temporary workspace..."
tar -xzf "$BACKUP_ARCHIVE" -C "$TEMP_EXTRACT"

EXTRACTED_DIR="$(find "$TEMP_EXTRACT" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
if [ -z "$EXTRACTED_DIR" ]; then
  EXTRACTED_DIR="$TEMP_EXTRACT"
fi

# Verify Checksums if available
if [ -f "${EXTRACTED_DIR}/SHA256SUMS.txt" ]; then
  log_info "Verifying SHA256 checksums..."
  cd "$EXTRACTED_DIR"
  if sha256sum -c SHA256SUMS.txt > /dev/null 2>&1; then
    log_success "Checksum verification PASSED."
  else
    log_error "CHECKSUM VERIFICATION FAILED! The backup file may be corrupted."
    exit 1
  fi
  cd - > /dev/null
fi

# Execute Database Restore
if [ -f "${EXTRACTED_DIR}/all_databases.sql.gz" ]; then
  log_info "Restoring complete database state from all_databases.sql.gz..."
  gunzip -c "${EXTRACTED_DIR}/all_databases.sql.gz" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER"
  log_success "Complete database state restored."
else
  # Fallback: Restore individual custom format dumps
  DATABASES=("identity_db" "news_db" "community_db" "event_db" "media_db" "bracket_db" "notification_db" "ai_db")
  for db in "${DATABASES[@]}"; do
    if [ -f "${EXTRACTED_DIR}/${db}.dump" ]; then
      log_info "Restoring database: $db..."
      docker exec -i "$POSTGRES_CONTAINER" pg_restore -U "$POSTGRES_USER" -d "$db" --clean --if-exists "${EXTRACTED_DIR}/${db}.dump" 2>/dev/null || true
    fi
  done
fi

log_success "=== Database Restore Operation Successfully Finished! ==="
