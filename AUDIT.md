# 📋 AUDIT & RENCANA MIGRASI UPDATE v2 — ESPORT SUMBAR

> **Dokumen Audit Repositori & Rencana Kerja Bertahap (Phase U0)**  
> Dibuat berdasarkan: `PROJECT_SPEC.md` (v1) dan `UPDATE_v2.md`.  
> Status: **Menunggu Persetujuan User sebelum Eksekusi Phase U1**.

---

## 1. Executive Summary

Repositori **ESPORT SUMBAR** telah menyelesaikan seluruh fondasi v1 (Phase 0 sampai Phase 8) dengan 10 microservices NestJS, Next.js 15 Web, API Gateway, Docker compose, dan suite unit test dengan kelulusan 100%.

Namun, untuk memenuhi visi **UPDATE v2**, sistem memerlukan transformasi besar di 5 pilar utama:
1. **Pemisahan 3 Portal Terisolasi**: Memecah satu frontend monolitik menjadi 3 portal terpisah: Portal Publik/User (`esportsumbar.id`), EO Studio (`eo.esportsumbar.id`), dan Admin Console (`admin.esportsumbar.id`).
2. **Redesign Visual Non-Kaku**: Menghilangkan kesan template AI yang datar dengan tema *"Broadcast Esport + Identitas Minang"* (tekstur songket/ukiran Minang halus, tipografi condensed ekspresif, motion bermakna, micro-interactions, dark & light theme tokens).
3. **Peningkatan Kemampuan Sistem**: Integrasi 2FA TOTP Admin, template event EO, OBS overlay mode, QR check-in, dan sistem badge/reputasi.
4. **Integrasi Resmi Instagram Meta Graph API**: Penarikan postingan dari akun resmi `@esportsumbar` tanpa scraping ilegal, lengkap dengan ekstraksi EventDraft, pengunduhan media lokal, dan pembaruan token 60 hari otomatis.
5. **Otomatisasi Penuh Deploy & Operasional**: Multi-subdomain Caddyfile (HTTPS otomatis Let's Encrypt), skrip server (`bootstrap.sh`, `deploy.sh`, `backup.sh`, `restore.sh`, `seed.sh`), Makefile, dan CI/CD GitHub Actions ke GHCR dengan rollback otomatis.

---

## 2. Kondisi Tiap Komponen Repositori Saat Ini (v1 Status Matrix)

| Komponen | Status v1 Saat Ini | Kesiapan untuk Update v2 | Catatan Teknis & Utang |
| :--- | :---: | :---: | :--- |
| **`apps/web`** | Aktif (Port 3000) | Perlu Refactor | Halaman EO (`/eo/*`) dan Admin (`/admin/*`) saat ini masih berada di dalam satu aplikasi web publik. Desain masih berorientasi kartu seragam. |
| **`apps/eo`** | *Belum ada* | Wajib Dibuat (U1) | Akan dibangun sebagai aplikasi Next.js mandiri untuk EO Studio (workspace, form builder preview, live scoring dispute, analitik peserta). |
| **`apps/admin`** | *Belum ada* | Wajib Dibuat (U1) | Akan dibangun sebagai aplikasi Next.js mandiri untuk Admin Console (command palette Ctrl+K, antrean moderasi berita/laporan, koneksi Instagram, audit log). |
| **`packages/contracts`** | Lengkap (v1) | Perlu Ditambah (U1, U3) | Perlu skema baru: `Article.sourceType`, `RawItem`, `InstagramConnection`, `EventDraft`, `AdminAuditLog`, `UserTwoFactor`, `Certificate`. |
| **`packages/ui`** | Lengkap (v1) | Perlu Ditambah (U2) | Perlu token CSS dark/light, aksen emas Minang (`#F5B700`), motif songket SVG, dan varian animasi Framer Motion. |
| **`packages/ui-dashboard`** | *Belum ada* | Wajib Dibuat (U1) | Komponen khusus dashboard: Data table, filter bar, metric cards, timeline, status badge. |
| **`packages/auth-client`** | Tersebar di `web/lib/api.ts` | Wajib Dibuat (U1) | Perlu package SDK bersama untuk handle audience validation (`aud`), httpOnly cookie session, dan guard per portal. |
| **`packages/api-client`** | Tersebar di `web/lib/api.ts` | Wajib Dibuat (U1) | Perlu typed API client terpusat yang otomatis menambahkan token, correlation-id, dan prefix rute portal. |
| **`packages/utils`** | Lengkap (v1) | Siap Digunakan | Sudah memiliki sanitasi anti-XSS, masking data UU PDP, audit logger, correlation-id, dan Prometheus metrics collector. |
| **`services/gateway`** | Aktif (Port 4000) | Perlu Refactor (U1) | Perlu prefix rute portal: `/api/public/*`, `/api/eo/*`, `/api/admin/*`, validasi audience token, dan proteksi 2FA untuk admin. |
| **`services/identity-service`**| Aktif (Port 4001) | Perlu Ditambah (U1) | Perlu penambahan `aud` pada JWT payload, 2FA TOTP (Google Authenticator) untuk admin, dan model `UserTwoFactor`. |
| **`services/news-service`** | Aktif (Port 4002) | Perlu Ditambah (U3) | Perlu kolom `sourceType` (INSTAGRAM/RSS/MANUAL/AI), `igMediaId`, `igPermalink`, dan `mediaGallery`. |
| **`services/news-ingestor`** | Aktif (Port 4003) | Perlu Ditambah (U3) | Perlu penambahan worker `instagram-connector` menggunakan Instagram Graph API resmi (Meta) dan cron sync. |
| **`services/community-service`**| Aktif (Port 4004)| Perlu Ditambah (U4) | Perlu fitur reaksi emoji, polling, hashtag, rules komunitas, dan mention. |
| **`services/event-service`** | Aktif (Port 4005) | Perlu Ditambah (U4) | Perlu fitur template event sekali klik, check-in QR code, dan ekstraksi `EventDraft` dari Instagram. |
| **`services/media-service`** | Aktif (Port 4006) | Perlu Ditambah (U3) | Perlu downloader & storage permanen untuk media Instagram sebelum URL sementara Meta kedaluwarsa. |
| **`services/bracket-service`** | Aktif (Port 4007)| Perlu Ditambah (U4) | Perlu mode URL OBS/Overlay broadcast, reschedule match, dan konfirmasi skor oleh kapten. |
| **`services/ai-service`** | Aktif (Port 4008) | Perlu Ditambah (U3) | Perlu prompt classifier Instagram (memisahkan berita vs promo vs event info) dan auto-generator EventDraft. |
| **`services/notification-service`**| Aktif (Port 4009)| Perlu Ditambah (U4)| Perlu multi-channel dispatch (in-app, email, web push, alert Telegram admin). |

---

## 3. Identifikasi Bug, Kesenjangan & Utang Teknis

1. **Pencampuran Hak Akses di Frontend**:
   * *Masalah*: Rute `/admin/*` dan `/eo/*` saat ini berada di satu project Next.js yang sama dengan rute publik, berisiko kebocoran bundle kode internal ke publik.
   * *Solusi v2*: Pemisahan fisik menjadi `apps/web`, `apps/eo`, dan `apps/admin`.
2. **Ketiadaan Validasi Audience Token**:
   * *Masalah*: Token JWT yang diterbitkan saat ini belum membatasi portal tujuan (`aud`), sehingga secara teoritis token user biasa dapat ditembakkan ke endpoint admin jika tidak ada guard ketat.
   * *Solusi v2*: Menambahkan claim `aud: 'public' | 'eo' | 'admin'` dan menolak token yang tidak sesuai di API Gateway & Identity Service.
3. **Autentikasi Dua Faktor (2FA)**:
   * *Masalah*: Belum ada dukungan TOTP (Time-based One-Time Password) untuk akun administrator.
   * *Solusi v2*: Implementasi 2FA TOTP wajib untuk role ADMIN di `identity-service` dan verifikasi di `apps/admin`.
4. **Desain Visual Seragam**:
   * *Masalah*: Tampilan beranda dan berita masih didominasi kartu grid persegi yang terasa seperti template AI umum.
   * *Solusi v2*: Menerapkan 3 prototipe di `/design-lab`, memilih varian (rekomendasi: Varian A "Arena Broadcast" + sentuhan Minang), lalu merombak halaman utama dengan ritme asimetris, tipografi condensed, dan motion hidup.
5. **Ketergantungan Data Eksternal Instagram**:
   * *Masalah*: URL media dari Instagram Graph API memiliki masa berlaku (biasanya 24–48 jam).
   * *Solusi v2*: `media-service` wajib mengunduh file media asli ke MinIO/S3 lokal segera setelah ingest agar artikel tetap memiliki gambar permanen.

---

## 4. Analisis Risiko Migrasi & Strategi Mitigasi

| Risiko Migrasi | Tingkat Dampak | Strategi Mitigasi |
| :--- | :---: | :--- |
| **Pemisahan monorepo Next.js merusak import shared packages** | Sedang | Manfaatkan `pnpm-workspace.yaml` dan Turborepo yang sudah ada, ekstrak logika shared ke `packages/auth-client`, `packages/api-client`, dan `packages/ui-dashboard`. |
| **Perubahan skema database memecah service yang sudah jalan** | Rendah | Menggunakan skema migrasi aditif (menambahkan kolom opsional baru tanpa menghapus kolom lama v1). |
| **Kredensial Meta Developer App / Token Instagram belum tersedia dari user** | Sedang | Menyediakan **Mock Meta Graph API Provider** dan seed data Instagram lokal untuk development dan unit test, sembari membuat panduan jelas di `INSTAGRAM_SETUP.md`. |
| **Docker Compose multi-portal menjadi berat di memori lokal** | Sedang | Gunakan multi-stage build Alpine ringan dan shared node_modules pnpm. |

---

## 5. Rencana Migrasi Bertahap (Update Phases U0 – U6)

### 📌 Phase U0 — Audit & Rencana (Tahap Saat Ini)
* [x] Membaca dan menganalisis `UPDATE_v2.md`.
* [x] Menyalin file spesifikasi sebagai `UPDATE_v2.md` di root repo.
* [x] Menyusun dokumen audit menyeluruh (`AUDIT.md`) dengan gap analysis dan file manifest.
* [ ] **Menunggu konfirmasi / persetujuan dari User untuk mulai mengeksekusi Phase U1**.

---

### 📌 Phase U1 — Pemisahan 3 Portal & Auth Hardening
1. **Membuat Package Bersama Baru**:
   * `packages/auth-client`: SDK login, session management, token refresh, audience verification, guard per portal.
   * `packages/api-client`: Client HTTP ter-type untuk API Gateway.
   * `packages/ui-dashboard`: Komponen layout dashboard (Sidebar, Header, Command Palette Ctrl+K, Data Table, Stats Card).
2. **Membuat Aplikasi Frontend Terpisah**:
   * `apps/eo` (Next.js 15): EO Studio (`eo.esportsumbar.id`). Pindahkan dan perluas `/eo/dashboard`, `/eo/event/[id]`, `/eo/event/baru`.
   * `apps/admin` (Next.js 15): Admin Console (`admin.esportsumbar.id`). Pindahkan dan perluas `/admin/berita`, `/admin/moderasi`, tambah antrean audit dan Instagram connection.
   * `apps/web`: Bersihkan rute admin dan EO dari portal publik, tambahkan tombol pindah portal di profil.
3. **Hardening Auth & API Gateway**:
   * Tambahkan claim `aud` (`public`, `eo`, `admin`) pada JWT token.
   * Implementasi 2FA TOTP (generate secret, QR code, verifikasi token 6 digit) di `identity-service`.
   * Konfigurasi route prefix gateway: `/api/public/*`, `/api/eo/*`, `/api/admin/*`.
   * Tulis test e2e pengujian akses silang yang wajib ditolak (User biasa ditolak di EO & Admin; EO ditolak di Admin).

---

### 📌 Phase U2 — Redesign Visual ("Broadcast Esport + Identitas Minang")
1. **Membuat Lab Prototipe Desain ([`/design-lab`](file:///F:/AI%20DEV/ESPORT%20SUMBAR/apps/web/src/app/design-lab/page.tsx))**:
   * `/design-lab/home-a`: Varian A — *"Arena Broadcast"* (gelap, merah tegas `#E10600`, strip live, tipografi condensed).
   * `/design-lab/home-b`: Varian B — *"Ranah Minang Modern"* (aksen emas Minang `#F5B700`, tekstur songket/ukiran, poster game lokal).
   * `/design-lab/home-c`: Varian C — *"Clean Competitive"* (whitespace lebih lega, gaya media olahraga modern).
   * **Berhenti dan meminta User memilih varian desain**.
2. **Penerapan Desain Terpilih**:
   * Update design tokens di `packages/ui` (dukungan Dark/Light theme via CSS variables).
   * Rombak Beranda (Live match hero, trending Instagram, tiket event, poster komunitas).
   * Rombak Portal Berita, Komunitas (banner hero & timeline), dan Bracket (animasi garis).
   * Desain ulang workspace EO Studio dan Admin Console (sidebar padat, command palette).

---

### 📌 Phase U3 — Integrasi Instagram @esportsumbar (Meta Graph API Resmi)
1. **Model Data & Kontrak**:
   * Tambahkan DTO `InstagramConnection`, `EventDraft`, dan perluas `Article` di `packages/contracts`.
2. **Konektor Instagram di `news-ingestor`**:
   * Polling scheduler Meta Graph API (`/{ig-user-id}/media`).
   * Mock Meta Graph API provider untuk pengujian tanpa token asli.
   * Pipeline klasifikasi AI: Pisahkan postingan berita, info turnamen, promo, dan santai.
   * Pipeline ekstraksi `EventDraft` otomatis saat postingan memuat jadwal turnamen.
3. **Penyimpanan Media Permanen di `media-service`**:
   * Mengunduh gambar dan thumbnail dari CDN Instagram ke MinIO lokal sebelum URL Meta kedaluwarsa.
4. **Halaman Admin "Koneksi Instagram"**:
   * Status koneksi token 60 hari, countdown kedaluwarsa, tombol refresh token, log penarikan, filter postingan ditolak.
5. **Frontend Publik**:
   * Carousel visual *"Dari Instagram @esportsumbar"* di Beranda.
   * Dokumentasi lengkap panduan integrasi akun resmi di `INSTAGRAM_SETUP.md`.

---

### 📌 Phase U4 — Peningkatan Kemampuan Sistem
1. **Fitur EO (5.2)**: Template event sekali klik, QR code check-in peserta, mode OBS Overlay URL (`/embed/overlay/bracket`), dispute skor oleh kapten, export sertifikat/CSV.
2. **Fitur Berita & AI (5.3)**: Deteksi duplikat semantik, pembuatan judul SEO otomatis, auto-tagging, terjemahan, ringkasan hari ini (*daily digest*).
3. **Fitur User & Komunitas (5.1)**: Reaksi emoji, polling interaktif, mention `@user`, aturan komunitas & slow mode, profil rank gamer.
4. **Fitur Admin & Platform (5.4 & 5.5)**: Dashboard metrik biaya AI, global banner pengumuman, SEO dynamic OpenGraph gambar per artikel, PWA manifest.

---

### 📌 Phase U5 — Infrastruktur & Otomatisasi Deploy
1. **Konfigurasi Caddy Multi-Subdomain**:
   * Reverse proxy otomatis Let's Encrypt untuk: `esportsumbar.id`, `eo.esportsumbar.id`, `admin.esportsumbar.id`, dan `api.esportsumbar.id`.
2. **Skrip Otomatisasi Operasional Server**:
   * `infra/scripts/bootstrap.sh`: Inisialisasi VPS baru (Docker, ufw firewall, fail2ban, swap, non-root user).
   * `infra/scripts/deploy.sh`: Pull image, migrasi DB, restart zero-downtime, health check, auto-rollback jika gagal.
   * `infra/scripts/backup.sh` & `restore.sh`: Backup Postgres dan S3 storage dengan retensi 7 harian / 4 mingguan.
   * `infra/scripts/seed.sh`: Seeding game, kategori, admin pertama, dan sumber berita.
3. **Makefile**:
   * Perintah praktis: `make up`, `make down`, `make migrate`, `make seed`, `make deploy`, `make backup`, `make logs`.
4. **GitHub Actions CI/CD Penuh**:
   * Workflows: `ci.yml`, `deploy-staging.yml`, `deploy-prod.yml`, dan `scheduled.yml` (cron check backup & token IG).
5. **Panduan Operasional**:
   * Menghasilkan dokumen `GO_LIVE.md` dan `RUNBOOK.md`.

---

### 📌 Phase U6 — Hardening Akhir & Rilis v2.0.0
1. Security audit akhir & sanitasi input menyeluruh.
2. Uji performa Lighthouse (target $\ge 90$ untuk portal publik).
3. Verifikasi menyeluruh terhadap Definition of Done v2.
4. Menghasilkan `CHANGELOG.md` dan tagging rilis `v2.0.0`.

---

## 6. Rincian File yang Akan Dibuat dan Diubah

### A. Aplikasi Baru:
* `apps/eo/`: Next.js 15 App Router untuk EO Studio (`package.json`, `tsconfig.json`, `next.config.js`, `src/app/*`).
* `apps/admin/`: Next.js 15 App Router untuk Admin Console (`package.json`, `tsconfig.json`, `next.config.js`, `src/app/*`).

### B. Packages Baru & Diperbarui:
* `packages/ui-dashboard/`: Library UI tabel, sidebar, stats card, filter.
* `packages/auth-client/`: Library autentikasi, audience validation, portal guard.
* `packages/api-client/`: Library gateway client ter-type.
* `packages/contracts/src/dtos.ts`: Penambahan DTO Instagram, 2FA, EventDraft, Certificate, AuditLog.
* `packages/ui/`: Penambahan design tokens v2, motif Minang, CSS variables.

### C. Services yang Diperbarui:
* `services/gateway/`: Route prefixes `/api/public`, `/api/eo`, `/api/admin`, audience policy, proxy routing.
* `services/identity-service/`: 2FA TOTP (speakeasy/crypto), token audience claim.
* `services/news-ingestor/`: Worker `instagram-connector`, scheduler, Meta Graph API client & mock provider.
* `services/media-service/`: Downloader media Instagram ke MinIO permanen.
* `services/news-service/`: Schema penambahan sumber Instagram dan media gallery.
* `services/event-service/`: Event templates, QR check-in generator.
* `services/bracket-service/`: Rute OBS overlay broadcast realtime.

### D. File Infrastruktur & Panduan Baru:
* `infra/compose/Caddyfile`
* `infra/scripts/bootstrap.sh`, `deploy.sh`, `backup.sh`, `restore.sh`, `seed.sh`
* `Makefile`
* `.github/workflows/deploy-staging.yml`, `deploy-prod.yml`, `scheduled.yml`
* `GO_LIVE.md`, `INSTAGRAM_SETUP.md`, `RUNBOOK.md`, `CHANGELOG.md`
* `UPDATE_v2.md` *(sudah tersimpan)*
* `AUDIT.md` *(file ini)*

---

## 7. Status Keputusan Terbuka (Open Decisions)

Sebelum melangkah lebih jauh, berikut status dan asumsi default yang digunakan:
1. **Akun Instagram @esportsumbar**: Kita siapkan integrasi resmi Instagram Graph API + Mock Meta API Provider lokal, serta dokumentasi langkah Meta App di `INSTAGRAM_SETUP.md`. Mode awal: `REVIEW`.
2. **Varian Desain**: Prototipe 3 varian akan dibuat di `/design-lab` pada awal Phase U2 untuk dipilih langsung oleh User.
3. **Penyedia Hosting**: Opsi hemat 1 VPS (Docker Compose + Caddy otomatis Let's Encrypt + Cloudflare) sesuai rekomendasi Bagian 6.1.
4. **Pembayaran Event**: Opsional sandbox Midtrans/Xendit disiapkan di Phase U4.
5. **Kanal Notifikasi**: In-app + Email default, webhook Telegram untuk alert admin.
