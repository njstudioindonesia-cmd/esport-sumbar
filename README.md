# ESPORT SUMBAR — Portal Esport Sumatera Barat

Platform esport Sumatera Barat: **Berita AI**, **Komunitas per game**, dan **Event & Tools Event Organizer** (form builder pendaftaran, event storage, bracket & leaderboard custom).

---

## Arsitektur Monorepo

```
esport-sumbar/
├─ apps/
│  └─ web/                      # Next.js App Router frontend (Phase 2)
├─ services/
│  ├─ gateway/                  # API Gateway (Phase 1)
│  ├─ identity-service/         # Auth, RBAC, Profil, Verifikasi EO (Phase 1)
│  ├─ news-service/             # Artikel, Kategori, Sumber (Phase 3)
│  ├─ news-ingestor/            # Worker fetch RSS & dedupe (Phase 3)
│  ├─ community-service/        # Forum, Post, Komentar, Report (Phase 4)
│  ├─ event-service/            # Event, Form Builder, Pendaftar (Phase 5)
│  ├─ bracket-service/          # Format Bracket, Leaderboard SSE (Phase 6)
│  ├─ media-service/            # S3/MinIO Storage & Signed URLs (Phase 5)
│  ├─ notification-service/     # Email, In-app, Pengumuman (Phase 7)
│  ├─ ai-service/               # LLM Provider Gateway & Prompts (Phase 3)
│  └─ _template-service/        # Template service NestJS production-grade
├─ packages/
│  ├─ contracts/                # Zod schemas, Event Bus payload, DTOs
│  ├─ ui/                       # Design tokens (Merah, Dark surface, Chamfer), Tailwind preset
│  ├─ config/                   # ESLint, Prettier, tsconfig bersama
│  └─ utils/                    # Structured logger, correlation-id, safe result
├─ infra/
│  └─ docker/                   # Postgres init scripts & compose configs
├─ docker-compose.yml           # Postgres (pgvector), Redis, NATS (JetStream), MinIO
├─ .env.example                 # Template variabel lingkungan
├─ PROJECT_SPEC.md              # Spesifikasi lengkap proyek
└─ README.md
```

---

## Prasyarat Lingkungan

- **Node.js**: v20.x atau v22+ (`node -v`)
- **pnpm**: v9+ / v12+ (`pnpm -v`)
- **Docker & Docker Compose**: untuk menjalankan database, broker, cache, dan storage lokal.

---

## Panduan Menjalankan (Local Development)

### 1. Salin Konfigurasi Environment
```bash
cp .env.example .env
```

### 2. Jalankan Infrastruktur Lokal (Docker Compose)
Pastikan Docker Desktop sudah aktif, lalu jalankan:
```bash
docker compose up -d
```
Service yang akan berjalan:
- **PostgreSQL 16 (pgvector)**: `localhost:5432` (database terisolasi per microservice otomatis dibuat)
- **Redis 7**: `localhost:6379` (cache & sessions)
- **NATS JetStream**: `localhost:4222` (monitoring UI di `localhost:8222`)
- **MinIO S3**: API di `localhost:9000`, Web Console di `http://localhost:9001` (user: `admin`, pass: `supersecret123`)

Periksa status container:
```bash
docker compose ps
```

### 3. Install Dependensi Workspace
```bash
pnpm install
```

### 4. Build Paket Bersama (Contracts, Utils, UI)
```bash
pnpm run build
```

### 5. Menjalankan Template Service (Tes Health Check & Swagger)
```bash
cd services/_template-service
pnpm run dev
```
Buka browser:
- **Swagger OpenAPI**: [http://localhost:4000/docs](http://localhost:4000/docs)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## Design System Tokens (Anti "Tampilan AI")

Sesuai spesifikasi Bagian 7:
- **Primary Brand Red**: `#E10600` (Hover: `#B80500`, Bright: `#FF3B30`)
- **Dark Neutral Surfaces**: `#0B0B0D` (bg utama), `#131316` (surface), `#1C1C21` (card), Border: `#2A2A31`
- **Typography**: Display *Rajdhani / Barlow Condensed*, Body *Inter / Manrope*, Tabular numbers untuk bracket.
- **Chamfer & Cutouts**: Sudut tegas (4–8px) dan potongan chamfer diagonal gaming-pro.

Tersedia di `@esport-sumbar/ui` dan `@esport-sumbar/ui/styles/theme.css`.

---

## Status Fase Pengembangan

- [x] **Phase 0 — Fondasi**: Monorepo Turborepo, pnpm workspaces, packages (contracts, ui, config, utils), docker-compose (PG, Redis, NATS, MinIO), NestJS template service, GitHub Actions CI.
- [ ] **Phase 1 — Identity & Gateway**: `identity-service`, `gateway`, auth JWT + refresh rotation, RBAC, profil & verifikasi EO.
- [ ] **Phase 2 — Frontend Shell & Design System**: Layout global, komponen inti chamfer, Beranda & `/styleguide`.
- [ ] **Phase 3 — Berita + AI Curator**: `news-service`, `news-ingestor`, `ai-service`, review queue.
- [ ] **Phase 4 — Komunitas**: `community-service`, diskusikan, join/leave, AI moderation.
- [ ] **Phase 5 — Event & Tools EO**: `event-service`, form builder, pendaftaran tim/individu, storage terisolasi.
- [ ] **Phase 6 — Bracket & Leaderboard**: `bracket-service`, Single/Double elim, Swiss, Leaderboard, live SSE.
- [ ] **Phase 7 — AI Tambahan, Search & Notifikasi**: EO assistant, semantic search, email/in-app notification.
- [ ] **Phase 8 — Hardening & Deploy**: Audit keamanan, OpenTelemetry, test E2E Playwright, manifest deploy.
