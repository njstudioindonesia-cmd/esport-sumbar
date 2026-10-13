# ==============================================================================
# ESPORT SUMBAR v2 - Development, Deployment & Operations Makefile
# ==============================================================================

.PHONY: help dev build test lint format clean up down prod-up prod-down staging-up staging-down deploy deploy-staging backup restore seed logs logs-prod

SHELL := /bin/bash

help: ## Show this help menu
	@echo "ESPORT SUMBAR v2 Management Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# --- Local Development ---
dev: ## Run all local monorepo services & portals concurrently
	pnpm run dev

build: ## Build all 22 monorepo packages, microservices, and Next.js portals
	pnpm run build

test: ## Execute complete test suite across all packages
	pnpm run test

lint: ## Check linting rules across monorepo
	pnpm run lint

format: ## Format all files with Prettier
	pnpm run format

clean: ## Clean build caches (.turbo, dist, .next)
	pnpm run clean

# --- Local Docker Development ---
up: ## Start core local dev infra (Postgres, Redis, NATS, MinIO)
	docker compose up -d

down: ## Stop local dev infra containers
	docker compose down

logs: ## View live logs from local dev infra
	docker compose logs -f

# --- Production Operations ---
prod-up: ## Start full production stack via docker-compose.prod.yml
	docker compose -f docker-compose.prod.yml up -d

prod-down: ## Stop full production stack
	docker compose -f docker-compose.prod.yml down

prod-build: ## Build all production container images
	docker compose -f docker-compose.prod.yml build

logs-prod: ## Stream logs from production containers
	docker compose -f docker-compose.prod.yml logs -f

# --- Staging Operations ---
staging-up: ## Start staging stack on isolated ports
	docker compose -f infra/compose/docker-compose.staging.yml up -d

staging-down: ## Stop staging stack
	docker compose -f infra/compose/docker-compose.staging.yml down

# --- Operational Scripts ---
deploy: ## Run zero-downtime production deployment with healthcheck & rollback
	bash infra/scripts/deploy.sh prod

deploy-staging: ## Run staging deployment
	bash infra/scripts/deploy.sh staging

backup: ## Perform automated database dump with 7d/4w retention
	bash infra/scripts/backup.sh

restore: ## Restore database from backup (Usage: make restore ARCHIVE=<path>)
	@if [ -z "$(ARCHIVE)" ]; then echo "Error: ARCHIVE path required (e.g., make restore ARCHIVE=/path/to/backup.tar.gz)"; exit 1; fi
	bash infra/scripts/restore.sh $(ARCHIVE)

seed: ## Apply idempotent seed data (initial admin, EO, games, Minang cities)
	bash infra/scripts/seed.sh
