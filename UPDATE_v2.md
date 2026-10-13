# ESPORT SUMBAR — UPDATE v2

> Pakai bersama `PROJECT_SPEC.md` (v1). File ini adalah **delta**: jika ada konflik, file ini yang menang.
> Simpan sebagai `UPDATE_v2.md` di root repo. Jalankan **Master Update Prompt** (Bagian 1), lalu kerjakan **Update Phase** (Bagian 11) satu per satu.

---

## 1. MASTER UPDATE PROMPT

```
Kamu adalah Principal Engineer + Senior Product Designer + DevOps Lead.
Repo ESPORT SUMBAR v1 sudah ada. Baca PROJECT_SPEC.md dan UPDATE_v2.md.

Tugas update v2:
1. Pisahkan aplikasi menjadi 3 portal: Publik/User, Admin, dan Event Organizer.
2. Rombak seluruh UI agar hidup, tidak kaku, dan tidak terlihat seperti template AI.
3. Tingkatkan kemampuan sistem (Bagian 5).
4. Siapkan seluruh kebutuhan publish dan otomatisasi deploy (Bagian 6).
5. Integrasikan berita dari Instagram @esportsumbar (Bagian 7).

Aturan kerja:
- Audit repo dulu: tulis AUDIT.md (apa yang ada, apa yang rusak, utang teknis), minta persetujuan, baru eksekusi.
- Kerjakan per Update Phase. Berhenti dan beri ringkasan setiap selesai satu phase.
- Jangan menghapus fitur v1 yang masih dipakai. Semua perubahan skema DB lewat migrasi yang bisa di-rollback.
- Semua yang bisa diotomatisasi harus diotomatisasi: migrasi, seed, build, test, deploy, backup.
- Jangan pernah menaruh secret di repo. Gunakan .env.example dan secret manager/GitHub Secrets.
- Jika ada keputusan yang butuh kredensial atau akses yang kamu tidak punya (domain, server, token Instagram),
  buat checklist jelas untuk saya, jangan berpura-pura sudah terkonfigurasi.
```

---

## 2. Pemisahan 3 Portal

Tiga portal, tiga pengalaman berbeda, satu backend microservices. Pemisahan dilakukan di level **aplikasi frontend**, **domain/subdomain**, **session**, dan **hak akses**.

| Portal | Domain | Pengguna | Fokus UI |
|---|---|---|---|
| **Publik / User** | `esportsumbar.id` | Guest, USER | Konten, komunitas, event; ekspresif & visual |
| **EO Studio** | `eo.esportsumbar.id` | ORGANIZER | Produktivitas: form builder, peserta, bracket |
| **Admin Console** | `admin.esportsumbar.id` | ADMIN (+ MODERATOR) | Kontrol, moderasi, audit; padat & efisien |

### Struktur monorepo (perubahan)
```
apps/
├─ web/        # portal publik/user  (ganti isi lama jika perlu)
├─ eo/         # portal EO Studio     (Next.js terpisah)
└─ admin/      # portal Admin Console (Next.js terpisah)
packages/
├─ ui/             # komponen bersama + design tokens
├─ ui-dashboard/   # komponen khusus dashboard (tabel, filter, chart)
├─ auth-client/    # SDK login/session/guard bersama
└─ api-client/     # client typed ke gateway
```

### Aturan pemisahan
- **Auth**: satu identity-service, tetapi token membawa `role` dan `aud` (audience) per portal. Portal EO menolak token tanpa role `ORGANIZER`; Admin menolak selain `ADMIN`/`MODERATOR`.
- **Cookie**: httpOnly + SameSite=Lax, scope per subdomain untuk Admin & EO (jangan dibagi ke domain utama). Admin wajib **2FA (TOTP)**.
- **Gateway**: route prefix `/api/public/*`, `/api/eo/*`, `/api/admin/*` dengan policy berbeda (rate limit, IP allowlist opsional untuk admin).
- **Pindah portal**: user yang ORGANIZER melihat tombol "Buka EO Studio" di menu profil; tidak ada campuran menu admin/EO di portal publik.
- **Onboarding EO**: pengajuan di portal publik → verifikasi admin → akun mendapat role ORGANIZER → akses EO Studio.
- **Layout berbeda**: Publik = navbar atas + konten luas; EO = sidebar + workspace; Admin = sidebar padat + command palette (Ctrl+K) + tabel data besar.
- **Audit log** untuk semua aksi di Admin dan aksi sensitif di EO.

---

## 3. Redesign: Tampilan Tidak Kaku

**Masalah yang ingin dihilangkan**: terlalu kotak, seragam, datar, terlalu banyak kartu sama, tipografi hambar, animasi tidak ada atau berlebihan.

### 3.1 Arah visual baru
- Tema: **"Broadcast Esport + Identitas Minang"**. Energi layar turnamen (overlay, skor, strip live) dipadukan motif halus Minangkabau (pola songket/ukiran, rumah gadang sebagai siluet) sebagai tekstur, bukan dekorasi norak.
- Warna tetap **merah dominan** (`#E10600`) di atas dasar gelap hangat (`#0B0B0D`), ditambah satu warna aksen pendamping (kuning emas `#F5B700` untuk highlight juara/trending) agar tidak monoton.
- Dukung **dark & light mode** dengan token CSS, bukan hardcode.

### 3.2 Prinsip anti-kaku
1. **Ritme layout**: variasikan ukuran blok (headline besar + kartu kecil + strip horizontal), hindari grid 3 kolom seragam berulang.
2. **Bentuk**: kombinasi sudut tegas dan potongan diagonal; elemen yang sengaja "keluar grid" (gambar menimpa batas, angka besar sebagai latar).
3. **Tipografi ekspresif**: judul besar condensed dengan skala kontras tinggi (contoh 72/48/32/20/16), angka skor pakai font tabular.
4. **Kedalaman**: layer, bayangan halus berwarna merah pada elemen aktif, grain/noise tipis, garis tipis dan glow terbatas.
5. **Motion bermakna** (Framer Motion/CSS): reveal saat scroll, hover tilt ringan pada kartu event, transisi halaman, skeleton shimmer, counter animasi, bracket yang "menggambar" garisnya. Durasi 150–400ms, hormati `prefers-reduced-motion`.
6. **Elemen live**: ticker berita berjalan, badge "LIVE" berdenyut untuk match berlangsung, hitung mundur event.
7. **Empty state & error state** punya ilustrasi dan copy bernada gamer ramah (bahasa Indonesia santai tapi sopan).
8. **Mobile-first nyata**: bottom navigation di HP, gesture swipe untuk tab komunitas, kartu bisa di-scroll horizontal.

### 3.3 Halaman kunci yang dirombak
| Halaman | Arah |
|---|---|
| Beranda | Hero live-event + ticker berita, bagian "Trending dari Instagram", event terdekat bergaya tiket, komunitas populer bergaya poster game |
| Berita | Layout editorial: 1 headline besar, 2 sub-headline, daftar kecil; badge sumber (Instagram/Web) |
| Komunitas | Header bergaya banner game, tab sticky, feed bergaya timeline, panel samping bracket/event aktif |
| Event | Kartu tiket pertandingan, halaman detail bergaya match-center |
| Bracket | Tampilan broadcast, garis animasi, zoom/pan, mode layar penuh untuk proyektor/OBS |
| EO Studio | Workspace bersih, stepper pembuatan event, preview form real-time |
| Admin | Padat, tabel cepat, command palette, status bar antrean (review berita, report) |

### 3.4 Aturan kualitas UI
- Wajib buat `/styleguide` di tiap portal dan satu halaman `/design-lab` berisi semua varian komponen.
- Lighthouse ≥ 90 (Performance, A11y, Best Practices, SEO) pada portal publik.
- Kontras WCAG AA, fokus keyboard terlihat, semua gambar punya alt.
- Dilarang: gradient ungu-biru generik, emoji sebagai ikon utama, kartu rounded besar seragam, hero tengah-3-kolom klise, stock photo generik.

---

## 4. Variasi Arah Desain (pilih satu sebelum Phase U2)

**Varian A — "Arena Broadcast"** (rekomendasi)
Gelap, merah tegas, overlay ala siaran turnamen, tipografi condensed, ticker live. Paling terasa "esport pro".

**Varian B — "Ranah Minang Modern"**
Dominan merah-hitam dengan tekstur songket yang lebih terlihat, aksen emas, ilustrasi bergaya poster. Identitas lokal paling kuat.

**Varian C — "Clean Competitive"**
Lebih bersih dan editorial (gaya media olahraga), whitespace lebih lega, merah hanya sebagai aksen. Paling aman untuk keterbacaan berita panjang.

Prompt pemilihan:
```
Buat 3 prototipe halaman Beranda (Varian A, B, C dari UPDATE_v2.md Bagian 4)
di route /design-lab/home-a, /home-b, /home-c dengan data mock. Jangan lanjut
ke halaman lain sebelum saya memilih satu.
```

---

## 5. Peningkatan Kemampuan Sistem

### 5.1 Pengguna & Komunitas
- Login Google + verifikasi email, reset password, 2FA opsional (wajib Admin).
- Profil gamer: game utama, rank, ID game, tautan sosial, badge pencapaian.
- Komunitas: reaksi emoji, polling, mention `@user`, hashtag, repost event/berita ke komunitas, pinned announcement, aturan komunitas, slow mode.
- Direct message sederhana atau chat tim per komunitas (opsional, fase akhir).
- Sistem reputasi & badge (kontributor aktif, juara event).

### 5.2 Event & EO
- Template event (Single Elim, BR Scrim, Weekly Cup) sekali klik.
- Form builder: logika kondisional, auto-validasi ID game, kode undangan tim.
- Check-in peserta (QR code) dan tiket digital.
- Pembayaran pendaftaran opsional (Midtrans/Xendit, sandbox dulu) + verifikasi otomatis.
- Bracket: seeding berdasar rating, reschedule match, dispute/konfirmasi skor oleh kapten, riwayat perubahan skor.
- Mode **Overlay/OBS**: URL khusus bracket & leaderboard untuk live stream.
- Export: CSV, PDF sertifikat peserta/juara otomatis.
- Analitik EO: pendaftar per hari, asal kota/kabupaten, retensi.

### 5.3 Berita & AI
- Sumber berita ganda: **Instagram @esportsumbar** + RSS/web (Bagian 7).
- AI: peringkasan, klasifikasi game/kategori, deteksi duplikat semantik, skor viral, terjemah Inggris→Indonesia, pembuatan judul SEO, auto-tag.
- Smart search (pgvector), rekomendasi personal, "ringkasan hari ini" (daily digest) via email/notifikasi.
- Biaya AI terkontrol: cache hasil, batas harian per pipeline, dashboard biaya di Admin.

### 5.4 Admin
- Dashboard metrik (pengguna, konten, event, biaya AI, antrean).
- Moderasi terpadu: report, konten AI-flagged, antrean berita, verifikasi EO.
- Kelola sumber berita & konfigurasi Instagram, feature flag, banner/pengumuman global, audit log dengan filter.

### 5.5 Platform
- Notifikasi multi-kanal (in-app, email, Web Push; WhatsApp opsional via provider resmi).
- PWA (installable, offline untuk berita yang sudah dibuka).
- SEO: sitemap dinamis, metadata OpenGraph per artikel/event (gambar dinamis), structured data (Article, Event).
- Rate limiting adaptif, caching berlapis (CDN + Redis), job queue dengan retry & dead-letter.
- i18n siap (ID default, EN opsional).
- Semua API terdokumentasi OpenAPI; versi API `/v1`.

---

## 6. Persiapan Publish & Otomatisasi Penuh

Target: dari repo kosong ke produksi hidup dengan **satu perintah** dan semua update berikutnya **otomatis via git push**.

### 6.1 Infrastruktur yang disarankan
- **Opsi hemat (rekomendasi awal)**: 1 VPS (4 vCPU / 8 GB) di region Singapura/Jakarta, Docker Compose produksi, **Caddy** (HTTPS otomatis Let's Encrypt) sebagai reverse proxy, Cloudflare untuk DNS/CDN/WAF.
- **Opsi skala**: Kubernetes terkelola (K3s/managed) + Helm, managed Postgres, managed Redis, S3 asli.
- Pilih salah satu; AI harus mengikuti opsi hemat kecuali saya menentukan lain.

### 6.2 Deliverable yang harus dibuat
```
infra/
├─ docker/            # Dockerfile multi-stage per app/service (image kecil, non-root)
├─ compose/
│  ├─ docker-compose.prod.yml
│  ├─ docker-compose.staging.yml
│  └─ Caddyfile       # esportsumbar.id, eo., admin., api.
├─ scripts/
│  ├─ bootstrap.sh    # setup server baru: Docker, firewall (ufw), fail2ban, user non-root, swap
│  ├─ deploy.sh       # pull image, migrate, restart zero-downtime, health check, rollback otomatis
│  ├─ backup.sh       # dump Postgres + sinkron storage, retensi 7 harian / 4 mingguan
│  ├─ restore.sh
│  └─ seed.sh         # data awal: game, kategori, admin pertama, sumber berita
├─ k8s/ (opsional)    # Helm chart bila memilih opsi skala
└─ monitoring/        # Prometheus, Grafana, Loki, Uptime Kuma / Alertmanager
.github/workflows/
├─ ci.yml             # lint, typecheck, test, build (tiap PR)
├─ deploy-staging.yml # otomatis dari branch `develop`
├─ deploy-prod.yml    # otomatis dari tag `v*` atau merge ke `main` (dengan approval)
└─ scheduled.yml      # cron: backup check, renew token Instagram, dependency audit
Makefile              # make up | down | migrate | seed | deploy | backup | logs
.env.example · .env.production.example
```

### 6.3 Otomatisasi yang wajib berjalan
1. **CI/CD**: push ke `main` → test → build image → push ke GHCR → SSH deploy → migrasi DB → health check → rollback otomatis jika gagal.
2. **Migrasi & seed** otomatis saat container start (idempoten).
3. **HTTPS & domain**: Caddy otomatis; dokumentasikan record DNS yang harus saya buat.
4. **Backup terjadwal** + uji restore bulanan otomatis, notifikasi gagal ke email/Telegram.
5. **Monitoring & alert**: uptime check semua portal, error rate, antrean job, disk, kadaluarsa token Instagram.
6. **Error tracking**: Sentry (atau GlitchTip self-hosted).
7. **Secret management**: GitHub Secrets + file `.env` di server (izin 600), tidak pernah di repo.
8. **Update dependensi** otomatis (Renovate/Dependabot) dengan CI sebagai gerbang.
9. **Environment**: `local`, `staging`, `production` dengan config terpisah.

### 6.4 Checklist go-live (AI harus menghasilkan `GO_LIVE.md`)
- [ ] Domain dibeli & DNS ke Cloudflare
- [ ] VPS dibuat, SSH key terpasang, `bootstrap.sh` dijalankan
- [ ] GitHub Secrets terisi (SSH_HOST, SSH_KEY, DB_URL, JWT_SECRET, AI_API_KEY, IG_*, SMTP_*, dll.)
- [ ] Email transaksional (SPF/DKIM/DMARC) terverifikasi
- [ ] Akun admin pertama dibuat via `seed.sh` + 2FA aktif
- [ ] Token Instagram terkoneksi & uji tarik berita berhasil
- [ ] Halaman Kebijakan Privasi, Syarat & Ketentuan, dan Kontak tersedia
- [ ] Uji beban ringan, uji keamanan dasar, uji backup-restore
- [ ] Google Search Console & sitemap terkirim

**Catatan jujur untuk AI**: kamu tidak bisa membeli domain/VPS atau mengisi secret. Hasilkan semua script, workflow, dan panduan langkah demi langkah, lalu tandai dengan jelas bagian mana yang harus saya kerjakan manual.

---

## 7. Integrasi Berita dari Instagram @esportsumbar

### 7.1 Metode yang BOLEH dipakai
Gunakan **Instagram Graph API resmi (Meta)**. Syaratnya, akun `@esportsumbar` harus akun **Business/Creator** yang terhubung ke Facebook Page, dan saya (pemilik akun) memberi izin lewat Meta Developer App.

**Jangan** membuat scraper/crawler Instagram, memakai login palsu, atau layanan scraping pihak ketiga. Itu melanggar ketentuan Instagram, rawan blokir akun, dan tidak stabil. Jika saya bukan pemilik akun, gunakan **embed resmi (oEmbed)** dengan tautan ke postingan, bukan menyalin konten.

### 7.2 Alur teknis
```
Meta Webhooks / Cron polling
        ▼
instagram-connector (worker baru, bagian dari news-ingestor)
   - GET /{ig-user-id}/media?fields=id,caption,media_type,media_url,
     thumbnail_url,permalink,timestamp,children{media_type,media_url}
   - Simpan raw_item (idempoten berdasarkan ig_media_id)
        ▼
ai-service: klasifikasi (apakah berita/info esport?), ekstrak judul, game, kategori,
            tulis ringkasan & artikel dari caption, buat tag
        ▼
media-service: unduh & simpan salinan gambar/thumbnail (URL IG kedaluwarsa)
        ▼
news-service: buat Article (sumber = Instagram @esportsumbar, permalink wajib)
        ▼
Mode AUTO (konten milik sendiri, skor tinggi) atau REVIEW → publish
```

### 7.3 Aturan konten
- Karena akun itu milik kita, konten IG boleh dipublikasikan ulang di web **dengan atribusi "Sumber: Instagram @esportsumbar" + tautan permalink**.
- Postingan promosi/non-berita (giveaway, repost iklan) diklasifikasikan AI dan bisa disaring (`news`, `event_info`, `promo`, `other`).
- Postingan yang memuat info event diubah menjadi **draft Event** untuk ditinjau admin (judul, tanggal, lokasi diekstrak AI).
- Video/Reels: simpan thumbnail + embed player/tautan, jangan hosting ulang video kecuali ukuran dan izin jelas.
- Gambar yang memuat watermark/hak pihak ketiga ditandai untuk review manual.
- Caption dirapikan (hashtag jadi tag, emoji berlebihan dibersihkan) tanpa mengubah makna.

### 7.4 Konfigurasi & token
```
IG_APP_ID=
IG_APP_SECRET=
IG_USER_ID=
IG_ACCESS_TOKEN=          # long-lived token, ~60 hari
IG_WEBHOOK_VERIFY_TOKEN=
IG_POLL_INTERVAL_MIN=15
IG_PUBLISH_MODE=REVIEW    # REVIEW | AUTO
```
- Token **di-refresh otomatis** sebelum kedaluwarsa (job terjadwal), alert ke admin 10 hari sebelum habis dan jika refresh gagal.
- Halaman Admin → "Koneksi Instagram": status token, tombol sambungkan ulang, log tarikan terakhir, uji tarik manual, ubah mode REVIEW/AUTO, daftar postingan yang ditolak/disaring.
- Tangani rate limit & error API dengan retry eksponensial; tidak boleh menggandakan artikel.

### 7.5 Tampilan di web
- Bagian **"Dari Instagram @esportsumbar"** di Beranda (carousel visual) dan filter sumber di halaman Berita.
- Artikel dari IG menampilkan galeri gambar asli, caption yang sudah dirapikan, tombol "Lihat di Instagram".
- Tombol **Follow @esportsumbar** pada navbar/footer.

### 7.6 Panduan setup untuk saya (AI harus menulis `INSTAGRAM_SETUP.md`)
1. Ubah akun IG ke Business/Creator dan hubungkan ke Facebook Page.
2. Buat Meta Developer App, tambahkan produk Instagram Graph API.
3. Dapatkan token jangka panjang dan `IG_USER_ID`.
4. Isi secret di GitHub dan server, jalankan uji tarik dari Admin.
5. Jika review permission Meta diperlukan untuk mode produksi, siapkan kebijakan privasi dan penjelasan penggunaan data.

---

## 8. Perubahan Data & Kontrak

Tambahan model:
```
Article        + sourceType[INSTAGRAM|RSS|MANUAL|AI], igMediaId?, igPermalink?, mediaGallery[]
RawItem        (id, source, externalId UNIQUE, payload, status, fetchedAt)
InstagramConnection(id, igUserId, tokenEncrypted, expiresAt, lastSyncAt, mode, status)
EventDraft     (id, fromArticleId, extractedJson, status[PENDING|APPROVED|REJECTED])
AdminAuditLog  (id, actorId, action, entity, entityId, diff, ip, at)
UserTwoFactor  (userId, secretEncrypted, enabledAt, recoveryCodesHash[])
Badge / UserBadge, Reaction, Poll, PollVote
Certificate    (id, eventId, participantId, type, fileId)
FeatureFlag    (key, enabled, rules)
```
Event bus tambahan: `instagram.synced`, `instagram.token.expiring`, `article.from_instagram`, `event.draft.created`, `certificate.generated`, `admin.action.logged`.

---

## 9. Keamanan Tambahan v2
- Token Instagram & secret 2FA dienkripsi di database (AES-GCM, kunci dari env/KMS).
- Admin: 2FA wajib, session pendek, IP allowlist opsional, login anomaly alert.
- Pisahkan CORS & CSP per portal; CSP ketat untuk Admin.
- Scan dependensi & image di CI (npm audit / Trivy), secret scanning aktif.
- Backup terenkripsi, akses server hanya SSH key, firewall minimal port 80/443/22.
- Kepatuhan UU PDP: halaman privasi, persetujuan, hapus akun, retensi data.

---

## 10. Definition of Done v2
- Tiga portal berjalan terpisah, role guard teruji (test e2e menolak akses silang).
- Redesign terpasang di semua halaman kunci, lolos Lighthouse ≥ 90 pada portal publik.
- Pipeline Instagram menarik postingan nyata ke artikel tanpa duplikat.
- `make deploy` dan push ke `main` men-deploy ke staging/produksi otomatis dengan rollback.
- Backup + restore teruji. Monitoring & alert aktif.
- Dokumen tersedia: `AUDIT.md`, `GO_LIVE.md`, `INSTAGRAM_SETUP.md`, `RUNBOOK.md`, `CHANGELOG.md`.

---

## 11. UPDATE PHASE PROMPTS (urut)

### U0 — Audit & Rencana
```
Audit repo saat ini terhadap UPDATE_v2.md. Tulis AUDIT.md: kondisi tiap service
dan halaman, bug, utang teknis, risiko migrasi. Buat rencana migrasi bertahap
dan daftar file yang akan berubah. Tunggu persetujuan saya.
```

### U1 — Pisah 3 Portal
```
Kerjakan Bagian 2: buat apps/eo dan apps/admin, packages/auth-client, api-client,
ui-dashboard. Terapkan role+audience pada token, route prefix gateway per portal,
2FA TOTP untuk admin, audit log. Pindahkan semua halaman EO dan admin dari portal
publik. Tambahkan test e2e akses silang yang harus ditolak.
```

### U2 — Redesign
```
Kerjakan Bagian 3 dan 4. Mulai dengan /design-lab (3 varian Beranda), berhenti
dan tunggu pilihan saya. Setelah dipilih, terapkan ke design tokens dan rombak
halaman kunci portal publik, lalu EO Studio, lalu Admin Console. Pastikan
responsif mobile-first, animasi bermakna, dan prefers-reduced-motion.
```

### U3 — Integrasi Instagram
```
Kerjakan Bagian 7 dan 8: instagram-connector dengan Graph API resmi, pipeline ke
ai-service, penyimpanan media, EventDraft dari postingan, halaman Admin "Koneksi
Instagram", refresh token otomatis, UI "Dari Instagram @esportsumbar". Sediakan
mock server Meta untuk test, dan tulis INSTAGRAM_SETUP.md. Jangan membuat scraper.
```

### U4 — Peningkatan Kemampuan
```
Kerjakan Bagian 5 per sub-bagian, urut 5.2 (EO), 5.3 (Berita & AI), 5.1 (User &
Komunitas), 5.4 (Admin), 5.5 (Platform). Setelah tiap sub-bagian: test, demo
singkat, ringkasan.
```

### U5 — Infrastruktur & Otomatisasi Publish
```
Kerjakan Bagian 6 dan 9: Dockerfile multi-stage, compose staging/produksi,
Caddyfile 4 subdomain, bootstrap/deploy/backup/restore/seed script, workflow
GitHub Actions (ci, staging, prod, scheduled), monitoring, Sentry, Makefile.
Hasilkan GO_LIVE.md dan RUNBOOK.md. Uji seluruh alur di staging lokal dengan
docker compose, dan tandai langkah yang harus saya kerjakan manual.
```

### U6 — Hardening & Rilis
```
Jalankan audit keamanan, uji beban ringan, e2e penuh, Lighthouse, perbaiki
temuan, buat CHANGELOG.md dan tag rilis v2.0.0. Verifikasi Definition of Done
Bagian 10 satu per satu dan laporkan statusnya.
```

---

## 12. Versi Prompt Singkat

**Cursor / Windsurf**
```
Update ESPORT SUMBAR sesuai UPDATE_v2.md: pisah 3 portal (publik, EO, admin),
redesign non-kaku bertema broadcast esport + Minang, integrasi Instagram
@esportsumbar via Graph API resmi, CI/CD + Docker + Caddy otomatis. Kerjakan
per phase U0–U6, mulai dari audit.
```

**Claude Code**
```
Baca PROJECT_SPEC.md dan UPDATE_v2.md. Mulai U0: audit repo, tulis AUDIT.md,
rencanakan migrasi, minta persetujuan. Setelah itu eksekusi tiap phase dengan
commit kecil, jalankan lint/typecheck/test di setiap langkah.
```

**Jalur Cepat (prioritas dampak terbesar dulu)**
```
Urutan prioritas: (1) integrasi Instagram + berita, (2) pisah portal Admin & EO,
(3) redesign Beranda + Berita, (4) CI/CD + deploy staging. Sisanya menyusul.
Tetap ikuti UPDATE_v2.md.
```

---

## 13. Keputusan Terbuka (isi sebelum U1)
- [ ] Apakah akun @esportsumbar milik saya dan sudah Business/Creator? (menentukan jalur Graph API vs oEmbed)
- [ ] Mode awal Instagram: `REVIEW` atau `AUTO`
- [ ] Varian desain yang dipilih (A / B / C)
- [ ] Domain final dan penyedia VPS
- [ ] Perlu pembayaran pendaftaran event di v2? (Midtrans/Xendit)
- [ ] Kanal notifikasi alert: email atau Telegram
