# Changelog ESPORT SUMBAR

Semua perubahan penting pada platform ESPORT SUMBAR didokumentasikan dalam file ini.
Format mengikuti standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan rilis mengikuti [Semantic Versioning](https://semver.org/).

---

## [2.0.0] - 2026-10-13

Rilis besar Update v2 — Transformasi dari monolit konseptual v1 menjadi arsitektur microservices monorepo modern dengan 3 portal mandiri, identitas visual Ranah Minang Modern, integrasi resmi Meta Instagram Graph API v19.0, otomatisasi penuh CI/CD, dan Docker + Caddy edge proxy.

### Ditambahkan (Added)
- **Pemisahan 3 Portal Frontend Terisolasi**:
  - `apps/web` (Port 3000): Portal publik untuk gamer Minang, konten berita editorial, direktori turnamen, tiket match-center, feed komunitas game, dan rute `/design-lab`.
  - `apps/eo` (Port 3001): Portal EO Studio khusus Event Organizer dengan Interactive Form Builder (stepper form drag-and-drop, validasi kondisional), Participant Moderation (ekspor CSV), dan Bracket Controller.
  - `apps/admin` (Port 3002): Portal Admin Console dengan audit log real-time, manajemen sinkronisasi Instagram, moderasi antrean EventDraft AI, dan pengawasan sistem.
- **Autentikasi & Keamanan Berlapis**:
  - Guard Portal Audience (`public`, `eo`, `admin`) di API Gateway untuk mencegah eskalasi hak akses silang (cross-portal access).
  - Mesin 2FA TOTP RFC 6238 terintegrasi di `identity-service` dengan enkripsi rahasia AES-256-GCM.
  - Cookie `httpOnly`, `SameSite=Lax`, scope ketat per domain.
  - Library bersama `packages/auth-client`, `packages/api-client`, dan `packages/ui-dashboard`.
- **Desain "Ranah Minang Modern"**:
  - Palet warna berenergi: Arena Red (`#E10600`), Minang Gold (`#F5B700`), Dark Canvas (`#0B0B0D`), dan aksen Emerald (`#00F59B`).
  - Tekstur songket Minangkabau geometris dan aksen siluet Rumah Gadang sebagai identitas kultural esport Sumatera Barat.
  - Dukungan penuh CSS Design Tokens, dark mode adaptif, dan penghormatan preferensi `prefers-reduced-motion`.
- **Integrasi Resmi Meta Instagram Graph API v19.0 (@esportsumbar)**:
  - Kebijakan Zero-Scraper sesuai ketentuan Meta & UU PDP.
  - `InstagramConnectorService` di `services/news-ingestor` dengan mekanisme backoff eksponensial, perpanjangan otomatis token 60 hari, dan alert dini kedaluwarsa (< 10 hari).
  - AI Classifier untuk memisahkan konten berita (`news`), pengumuman turnamen (`event_info`), dan promosi (`promo`).
  - Auto-extractor `EventDraft` dari caption postingan (judul, game, kota, tanggal, prize pool) untuk disetujui admin menjadi turnamen aktif.
  - Carousel feed "Dari Instagram @esportsumbar" di beranda publik dan filter sumber di halaman `/berita`.
- **Infrastruktur & Otomatisasi Operasional**:
  - Multi-stage Dockerfiles berbasis Alpine non-root (`infra/docker/Dockerfile.service` dan `infra/docker/Dockerfile.app`).
  - Reverse proxy Caddy dengan penerbitan otomatis HTTPS Let's Encrypt untuk 4 subdomain: `esportsumbar.id`, `eo.esportsumbar.id`, `admin.esportsumbar.id`, dan `api.esportsumbar.id`.
  - Skrip operasional produksi di `infra/scripts/`: `bootstrap.sh`, `deploy.sh` (zero downtime + auto rollback), `backup.sh` (retensi 7 hari / 4 minggu + checksum SHA256), `restore.sh`, dan `seed.sh`.
  - Observabilitas & Monitoring (`infra/monitoring/`): Prometheus scrape config, Grafana, Loki, dan Uptime Kuma.
  - Workflow GitHub Actions: `ci.yml`, `deploy-staging.yml`, `deploy-prod.yml`, dan `scheduled.yml`.
  - Root `Makefile` untuk manajemen dev, test, build, lint, deploy, backup, dan restore.
- **Dokumentasi Lengkap**:
  - [`AUDIT.md`](./AUDIT.md): Audit komprehensif monorepo awal.
  - [`INSTAGRAM_SETUP.md`](./INSTAGRAM_SETUP.md): Panduan integrasi Meta App & Instagram Graph API.
  - [`GO_LIVE.md`](./GO_LIVE.md): Checklist rilis produksi, DNS Cloudflare, dan provisioning VPS.
  - [`RUNBOOK.md`](./RUNBOOK.md): Buku panduan operasional, tanggap insiden (Incident Response), dan mitigasi gangguan.

### Diperbaiki (Fixed)
- Memperbaiki ketidakcocokan versi ESLint 10 dengan Next.js flat configuration.
- Memperbaiki skema validasi Zod untuk backward-compatibility pada data mock yang belum memiliki `sourceType`.
- Mencegah memory leaks dan connection spike pada polling service dengan exponential jitter backoff.

### Ditingkatkan (Changed)
- Meningkatkan test coverage pada modul Bracket Engine menjadi 100% Funcs & 100% Lines.
- Memperbarui build pipeline Turborepo sehingga seluruh 22 paket monorepo dapat di-build secara paralel dalam < 30 detik.

---

## [1.0.0] - 2026-10-12
- Inisialisasi awal repositori ESPORT SUMBAR monorepo (vibe-coding spec).
- Microservices dasar: `identity-service`, `news-service`, `news-ingestor`, `community-service`, `event-service`, `media-service`, `bracket-service`, `ai-service`, `notification-service`, dan `gateway`.
- Halaman web prototipe awal.
