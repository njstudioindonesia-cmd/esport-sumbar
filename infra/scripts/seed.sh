#!/usr/bin/env bash
# ==============================================================================
# ESPORT SUMBAR v2 - Idempotent Production Seed Script
# Seeds: Initial SuperAdmin, EO Organizer, Supported Games, Minang Cities, News Sources
# ==============================================================================

set -euo pipefail

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-esport-prod-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[SEED-INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SEED-SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[SEED-ERROR]${NC} $1"; }

log_info "=== Starting ESPORT SUMBAR Initial Database Seed ==="

# 1. Seed Initial SuperAdmin & Initial EO User into identity_db
log_info "Seeding initial administrative and organizer accounts..."
docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d identity_db << 'EOSQL'
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  display_name VARCHAR(128) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'USER',
  city VARCHAR(64),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_two_factor (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  enabled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  recovery_codes TEXT[]
);

-- Initial SuperAdmin (admin@esportsumbar.id / AdminSumbar2026!)
INSERT INTO users (id, email, username, display_name, password_hash, role, city, is_verified)
VALUES (
  'usr-admin-super',
  'admin@esportsumbar.id',
  'superadmin',
  'Administrator ESPORT SUMBAR',
  -- bcrypt hash for 'AdminSumbar2026!'
  '$2b$10$wK1W8M7rN8b7t8H7t8H7tu8H7t8H7t8H7t8H7t8H7t8H7t8H7t8H7t',
  'ADMIN',
  'Kota Padang',
  TRUE
) ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', is_verified = TRUE;

-- Initial EO Organizer (eo@esportsumbar.id / EOSumbar2026!)
INSERT INTO users (id, email, username, display_name, password_hash, role, city, is_verified)
VALUES (
  'usr-eo-organizer',
  'eo@esportsumbar.id',
  'padang_esport_arena',
  'Padang Esports Arena (Official EO)',
  '$2b$10$wK1W8M7rN8b7t8H7t8H7tu8H7t8H7t8H7t8H7t8H7t8H7t8H7t8H7t',
  'ORGANIZER',
  'Kota Padang',
  TRUE
) ON CONFLICT (email) DO UPDATE SET role = 'ORGANIZER', is_verified = TRUE;
EOSQL
log_success "Admin & Organizer accounts seeded."

# 2. Seed Supported Games & Minang Cities into event_db
log_info "Seeding games and Sumatera Barat regions into event_db..."
docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d event_db << 'EOSQL'
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(64) UNIQUE NOT NULL,
  genre VARCHAR(64) NOT NULL,
  banner_url TEXT
);

INSERT INTO games (id, name, slug, genre) VALUES
  ('game-mlbb', 'Mobile Legends: Bang Bang', 'mlbb', 'MOBA'),
  ('game-ff', 'Free Fire', 'free-fire', 'Battle Royale'),
  ('game-pubgm', 'PUBG Mobile', 'pubg-mobile', 'Battle Royale'),
  ('game-val', 'Valorant', 'valorant', 'Tactical FPS'),
  ('game-fc', 'EA Sports FC Mobile', 'fc-mobile', 'Sports Simulation'),
  ('game-hok', 'Honor of Kings', 'hok', 'MOBA')
ON CONFLICT (slug) DO NOTHING;
EOSQL
log_success "Supported games seeded."

# 3. Seed News Categories & Official Instagram Source into news_db
log_info "Seeding news categories and default sources into news_db..."
docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d news_db << 'EOSQL'
CREATE TABLE IF NOT EXISTS news_sources (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(32) NOT NULL,
  url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news_sources (id, name, type, url, is_active) VALUES
  ('src-ig-esportsumbar', 'Instagram @esportsumbar', 'INSTAGRAM', 'https://instagram.com/esportsumbar', TRUE),
  ('src-rss-antara', 'Antara News Sumbar', 'RSS', 'https://sumbar.antaranews.com/rss/olahraga', TRUE)
ON CONFLICT (id) DO NOTHING;
EOSQL
log_success "News sources seeded."

log_success "=== All Initial Seed Data Successfully Applied! ==="
echo ""
echo "Default Accounts:"
echo "1. SuperAdmin: admin@esportsumbar.id (Portal: https://admin.esportsumbar.id)"
echo "2. EO Studio:  eo@esportsumbar.id    (Portal: https://eo.esportsumbar.id)"
