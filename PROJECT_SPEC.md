# ESPORT SUMBAR — Spesifikasi & Prompt Vibe Coding

> Cara pakai: taruh file ini di root repo sebagai `PROJECT_SPEC.md` (atau `CLAUDE.md` / `.cursorrules`).
> Lalu jalankan **Master Prompt** (Bagian 1), dan setelah itu kerjakan **Phase Prompts** (Bagian 11) satu per satu.
> Jangan minta AI membangun semuanya sekaligus. Iterasi per fase hasilnya jauh lebih stabil.

---

## 1. MASTER PROMPT (tempel ini pertama kali)

```
Kamu adalah Principal Software Engineer + Senior Product Designer.
Bangun platform "ESPORT SUMBAR": portal esport Sumatera Barat yang berisi
Berita (dikurasi otomatis oleh AI), Komunitas per game, dan Event dengan
tools lengkap untuk Event Organizer (form pendaftaran, penyimpanan data event,
bracket/leaderboard custom).

Baca PROJECT_SPEC.md sepenuhnya sebelum menulis kode. Ikuti arsitektur
microservices, struktur folder, design system, dan aturan kualitas di dalamnya.

Aturan kerja:
1. Kerjakan per fase. Mulai dari Phase 0. Berhenti setelah tiap fase
   dan beri ringkasan: apa yang dibuat, cara menjalankan, apa yang berikutnya.
2. Jangan menebak. Jika ada keputusan penting yang belum ada di spec, tanyakan
   maksimal 3 pertanyaan, lalu lanjut dengan asumsi yang kamu tulis jelas.
3. Kode harus production-grade: TypeScript strict, validasi input, error
   handling, logging terstruktur, tanpa secret di kode, tanpa placeholder palsu.
4. Setiap service harus bisa jalan lewat `docker compose up` dan punya
   health check endpoint.
5. Tulis test untuk logika bisnis penting (auth, bracket, registrasi event).
6. UI harus mengikuti Design System (Bagian 7). Dilarang tampilan generik ala
   template AI.
```

---

## 2. Ringkasan Produk

| Item | Detail |
|---|---|
| Nama | ESPORT SUMBAR |
| Tujuan | Pusat informasi, komunitas, dan event esport Sumatera Barat, terhubung ke skena Indonesia & dunia |
| Bahasa UI | Bahasa Indonesia (siapkan i18n agar bisa ditambah English) |
| Warna utama | Merah |
| Peran | `USER`, `ORGANIZER` (EO), `ADMIN` |
| Fitur inti | Berita AI, Komunitas, Event + Tools EO |

---

## 3. Peran & Hak Akses

**Guest (belum login)**
- Baca berita, lihat daftar komunitas & event, lihat bracket publik.
- Tidak bisa join komunitas, posting, atau daftar event.

**USER (pengguna biasa)**
- Registrasi & login, kelola profil (nickname, game utama, kota/kabupaten di Sumbar).
- Join/leave komunitas, buat post, komentar, like, report.
- Daftar event (individu atau tim), lihat status pendaftaran, lihat bracket/leaderboard tempat ia ikut.
- Bisa mengajukan upgrade akun menjadi ORGANIZER.

**ORGANIZER (EO)**
- Semua hak USER.
- Dashboard EO: buat/edit/publish event, form pendaftaran custom, kelola peserta (approve/reject/waitlist), unggah dokumen & aset event (poster, rulebook, bukti bayar), bracket & leaderboard builder, hubungkan event ke komunitas, kirim pengumuman ke peserta.
- Hanya bisa mengakses data event miliknya sendiri (tenant isolation).

**ADMIN**
- Verifikasi EO, moderasi konten & report, kelola komunitas/game, kelola sumber berita, review/override artikel AI, lihat audit log.

---

## 4. Fitur Detail

### 4.1 Berita (AI-curated)
- Pipeline otomatis: **Fetch → Dedupe → AI Evaluate → AI Rewrite → Moderation → Publish**.
- Sumber: RSS & halaman berita esport (daftar sumber dikelola admin), plus web search API untuk topik viral.
- Kategori: Dunia, Indonesia, Sumbar, per game (Mobile Legends, Free Fire, PUBG Mobile, Valorant, CS2, Dota 2, dll, dikelola admin).
- AI membuat: judul, ringkasan 2–3 kalimat, artikel ringkas orisinal (bukan salin-tempel), tag, skor "viral/trending", dan estimasi waktu baca.
- **Wajib** mencantumkan atribusi sumber asli + tautan. AI hanya menulis ulang/meringkas dengan kata sendiri, tidak menyalin teks sumber. Kutipan langsung dibatasi sangat pendek.
- Mode publish: `AUTO` (skor kepercayaan tinggi) atau `REVIEW` (masuk antrean admin). Default awal: `REVIEW` sampai kualitas terbukti.
- Fitur pembaca: filter kategori/game, pencarian, trending, bookmark (login), berbagi.
- Jadwal: cron tiap 30–60 menit; idempoten (tidak double post).

### 4.2 Komunitas
- Setiap game punya halaman komunitas resmi (dibuat admin). Pengguna bisa juga membuat sub-komunitas (misal "ML Padang", "Free Fire Bukittinggi") dengan persetujuan/aturan yang jelas.
- Join/leave, peran dalam komunitas: `MEMBER`, `MODERATOR`, `OWNER`.
- Post (teks, gambar, tautan), komentar bertingkat 1 level, like, pin post oleh moderator, report.
- Tab komunitas: **Diskusi · Event · Bracket · Anggota**.
- Tab Bracket/Event menampilkan bracket/leaderboard event yang diikuti anggota komunitas atau yang dihubungkan EO.
- Feed pengguna dari komunitas yang di-join.
- Moderasi: AI pre-moderation (spam, toxic, SARA, judi) + antrean report manual.

### 4.3 Event
- Cakupan: Sumatera Barat, Indonesia, Dunia. Filter: lokasi (Sumbar/Nasional/Global), game, status (akan datang/berlangsung/selesai), online/offline.
- Event dari dua sumber: (a) dibuat EO di platform, (b) event eksternal yang dikurasi (admin/AI) dengan tautan ke sumber.
- Halaman event: info, jadwal, hadiah, rulebook, peserta, bracket/leaderboard, pengumuman.
- Pendaftaran: individu atau tim; komunitas dapat mendaftar sebagai kontingen.
- Kalender event + pengingat (notifikasi in-app & email).

### 4.4 Tools Event Organizer
1. **Form Builder pendaftaran**: drag-and-drop field (teks, pilihan, upload file, ID game, daftar anggota tim), validasi, batas kuota, batas waktu, opsi biaya & upload bukti bayar.
2. **Event Storage khusus**: ruang penyimpanan per EO/per event (poster, rulebook, data peserta, bukti bayar, export CSV). Akses privat, signed URL, kuota ukuran.
3. **Manajemen peserta**: daftar pendaftar, status (pending/approved/rejected/waitlist), check-in, export.
4. **Bracket & Leaderboard Builder custom**:
   - Format: Single Elimination, Double Elimination, Round Robin, Swiss, Group Stage + Playoff, dan Leaderboard poin (cocok battle royale: poin placement + kill).
   - Seeding manual/acak/berdasarkan rating, input skor per match, advance otomatis, bye, tiebreaker.
   - Aturan poin custom (konfigurasi JSON).
   - Update real-time (WebSocket/SSE) di halaman publik, komunitas, dan dashboard peserta.
   - **Embed widget**: bracket bisa ditampilkan di halaman komunitas & lewat link/iframe publik.
5. **Pengumuman & notifikasi** ke peserta.
6. **Analitik sederhana**: jumlah pendaftar, tren, asal daerah.

### 4.5 AI di dalam sistem (ringkas)
| Fitur AI | Fungsi |
|---|---|
| News Curator | Evaluasi relevansi, ringkas, tulis ulang, tag, skor viral |
| Content Moderation | Filter spam/toxic/SARA/judi pada post & komentar |
| Smart Search | Pencarian semantik berita/komunitas/event (embedding + pgvector) |
| EO Assistant | Bantu EO membuat deskripsi event, rulebook, dan struktur bracket dari prompt |
| Rekomendasi | Saran komunitas & event sesuai game dan lokasi pengguna |

Semua akses AI lewat **ai-service** tunggal (abstraksi provider, prompt versioned, logging biaya & latensi, rate limit, fallback). Gunakan Claude API sebagai provider default.

---

## 5. Arsitektur Microservices

### 5.1 Prinsip
- Domain-driven: satu service = satu bounded context, **database sendiri** (schema/DB terpisah, tidak ada join lintas service).
- Komunikasi sinkron: REST/gRPC lewat API Gateway. Komunikasi asinkron: event bus (NATS JetStream atau RabbitMQ).
- Pola: API Gateway/BFF, Outbox pattern untuk event reliabel, idempotency key, saga sederhana untuk alur lintas service.
- Setiap service stateless, 12-factor, config via env, container Docker.
- Observability sejak awal: structured logging, correlation-id, metrics, tracing (OpenTelemetry).

### 5.2 Diagram

```
                 ┌──────────────────────────┐
   Browser ────▶ │  Next.js Web (SSR/BFF)   │
                 └────────────┬─────────────┘
                              ▼
                 ┌──────────────────────────┐
                 │       API Gateway        │  auth check, rate limit, routing
                 └─┬────┬────┬────┬────┬───┬┘
                   ▼    ▼    ▼    ▼    ▼   ▼
              identity news community event bracket notification
                 │      │     │      │     │        │
                 ▼      ▼     ▼      ▼     ▼        ▼
               (PG)   (PG)  (PG)   (PG)  (PG)    (PG/Redis)
                        ▲                ▲
                        └──── ai-service ┘      media-service ─▶ S3/MinIO
                              ▲
              Event Bus (NATS/RabbitMQ): user.registered, news.published,
              event.published, registration.approved, match.updated, ...
```

### 5.3 Daftar Service

| Service | Tanggung jawab | Data utama |
|---|---|---|
| `gateway` | Routing, validasi JWT, rate limit, CORS | - |
| `identity-service` | Register/login, JWT + refresh, OAuth Google, RBAC, profil, verifikasi EO | users, roles, organizer_profiles, sessions |
| `news-service` | Artikel, kategori, sumber, bookmark, antrean review | articles, sources, categories, bookmarks |
| `news-ingestor` (worker) | Cron fetch sumber, dedupe, kirim ke ai-service | ingest_jobs, raw_items |
| `community-service` | Komunitas, keanggotaan, post, komentar, report | communities, memberships, posts, comments, reports |
| `event-service` | Event, form pendaftaran, pendaftar, tim | events, forms, registrations, teams |
| `bracket-service` | Format turnamen, match, skor, leaderboard, realtime | tournaments, rounds, matches, standings |
| `media-service` | Upload file, signed URL, kuota per EO | files, folders |
| `notification-service` | Email, in-app, pengumuman | notifications, templates |
| `ai-service` | Gateway ke LLM, prompt registry, moderasi, embedding | prompt_versions, ai_logs |
| `search` (modul/ service) | Index & pencarian (Postgres FTS + pgvector di awal) | - |

### 5.4 Tech Stack (rekomendasi)
- **Monorepo**: pnpm workspaces + Turborepo.
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui (dikustom total) + TanStack Query + Zod. Animasi: Framer Motion (hemat).
- **Backend**: NestJS (TypeScript) per service, Zod/class-validator, OpenAPI (Swagger) per service.
- **Database**: PostgreSQL (+ pgvector), Prisma atau Drizzle per service. Redis untuk cache, rate limit, session, BullMQ.
- **Messaging**: NATS JetStream (atau RabbitMQ).
- **Storage**: MinIO (dev) / S3-compatible (prod).
- **Realtime**: SSE/WebSocket dari bracket-service.
- **Infra**: Docker + docker-compose (dev), siap Kubernetes (manifest/Helm opsional di fase akhir), GitHub Actions CI.
- **Auth**: JWT access (15 mnt) + refresh rotation, password Argon2, opsi OAuth Google.

> Catatan pragmatis: mulai dengan service yang sudah jelas batasnya (identity, news, community, event, bracket, ai). Hindari memecah lebih kecil sebelum ada kebutuhan nyata.

---

## 6. Struktur Repo

```
esport-sumbar/
├─ apps/
│  └─ web/                      # Next.js frontend
├─ services/
│  ├─ gateway/
│  ├─ identity-service/
│  ├─ news-service/
│  ├─ news-ingestor/
│  ├─ community-service/
│  ├─ event-service/
│  ├─ bracket-service/
│  ├─ media-service/
│  ├─ notification-service/
│  └─ ai-service/
├─ packages/
│  ├─ contracts/                # tipe event bus & DTO bersama (Zod)
│  ├─ ui/                       # komponen UI + design tokens
│  ├─ config/                   # eslint, tsconfig, prettier
│  └─ utils/
├─ infra/
│  ├─ docker/ · k8s/ · nginx/
├─ docker-compose.yml
├─ .env.example
├─ PROJECT_SPEC.md
└─ README.md
```

---

## 7. Design System (anti "tampilan AI")

**Karakter visual**: gaming-pro, tegas, editorial. Referensi rasa: situs liga esport profesional dan media olahraga, bukan landing page SaaS generik.

**Warna (dark-first)**
```
--red-500:   #E10600   /* primary */
--red-600:   #B80500   /* hover/pressed */
--red-400:   #FF3B30   /* aksen terang */
--bg-900:    #0B0B0D   /* background utama */
--bg-800:    #131316   /* surface */
--bg-700:    #1C1C21   /* card */
--line:      #2A2A31   /* border */
--text-100:  #F5F5F7
--text-400:  #9A9AA5
--success: #22C55E · --warning: #F5A524 · --info: #3B82F6
```
Merah hanya untuk CTA, status aktif, highlight; sisanya netral gelap agar tidak norak. Sediakan light mode sebagai opsional.

**Tipografi**
- Heading: font display tegas, condensed/sporty (contoh: *Barlow Condensed*, *Rajdhani*, atau *Bebas Neue* untuk judul besar saja).
- Body/UI: *Inter* atau *Manrope*.
- Angka skor/bracket: font tabular numerik.

**Gaya komponen**
- Sudut tegas (radius kecil 4–8px), garis tipis, potongan diagonal/chamfer pada kartu & tombol sebagai ciri khas.
- Hindari: gradient ungu-biru, glassmorphism berlebihan, ikon emoji sebagai ilustrasi, kartu seragam serba rounded besar, layout hero-center-3-kolom generik, copywriting klise.
- Gunakan foto/ilustrasi esport nyata (placeholder lokal bertema Sumbar: Jam Gadang, motif songket/Minangkabau sebagai pola halus), bukan stock generik.
- Grid editorial pada halaman berita (satu headline besar + daftar kecil), kartu event bergaya tiket pertandingan, bracket bergaya broadcast.
- Motion: transisi cepat 150–250ms, hover bermakna, skeleton loading, tanpa animasi berlebihan.
- Responsif mobile-first (mayoritas pengguna HP), aksesibilitas WCAG AA (kontras merah di atas gelap harus dicek).

**Halaman utama (sitemap)**
```
/                    Beranda (headline berita, event terdekat, komunitas populer)
/berita  /berita/[slug]
/komunitas  /komunitas/[slug]  (tab: diskusi, event, bracket, anggota)
/event  /event/[slug]  /event/[slug]/daftar  /event/[slug]/bracket
/masuk  /daftar  /profil  /bookmark
/eo/dashboard  /eo/event/baru  /eo/event/[id]/(form|peserta|bracket|storage|pengumuman)
/admin/(berita|moderasi|eo|komunitas|sumber)
```

---

## 8. Model Data Inti (ringkas)

```
User(id, email, passwordHash, nickname, role, city, mainGames[], createdAt)
OrganizerProfile(userId, orgName, verifiedStatus, docs[])
Article(id, title, slug, summary, body, sourceName, sourceUrl, category, gameId,
        tags[], viralScore, status[DRAFT|REVIEW|PUBLISHED|REJECTED], aiMeta, publishedAt)
Community(id, gameId, name, slug, type[OFFICIAL|USER], ownerId, region)
Membership(userId, communityId, role[MEMBER|MOD|OWNER])
Post(id, communityId, authorId, content, media[], pinned, status)
Comment(id, postId, authorId, parentId?, content)
Event(id, organizerId, title, slug, gameId, scope[SUMBAR|NASIONAL|GLOBAL],
      mode[ONLINE|OFFLINE], location, startAt, endAt, prize, status, linkedCommunityIds[])
RegistrationForm(id, eventId, schemaJson, quota, deadline, fee)
Registration(id, eventId, userId|teamId, answersJson, status, proofFileId?)
Team(id, name, captainId, members[])
Tournament(id, eventId, format, configJson, seedingType, status)
Match(id, tournamentId, round, slotA, slotB, scoreA, scoreB, winner, scheduledAt, state)
Standing(id, tournamentId, participantId, points, extraJson)
File(id, ownerId, eventId?, key, size, mime, visibility)
```
Semua tabel: `createdAt`, `updatedAt`, soft delete bila perlu, index pada foreign key & kolom filter.

---

## 9. Event Bus (kontrak contoh)

```
user.registered            identity → notification, community
organizer.verified         identity → event, notification
news.ingested              ingestor → ai-service
news.curated               ai-service → news-service
news.published             news-service → notification, search
event.published            event-service → notification, search, community
registration.submitted     event-service → notification
registration.approved      event-service → bracket, notification
match.updated              bracket-service → web(SSE), notification
post.created               community → ai-service(moderation)
moderation.result          ai-service → community
```
Format payload di `packages/contracts` (Zod), versi di nama event (`v1`).

---

## 10. Keamanan & Kualitas

- RBAC + ownership check di setiap endpoint EO (EO A tidak boleh akses event EO B).
- Validasi semua input (Zod), sanitasi konten user (anti XSS), rate limiting, CSRF untuk cookie, CORS ketat, security headers.
- Upload file: batasi tipe/ukuran, scan ekstensi/MIME, simpan di storage privat dengan signed URL.
- Password Argon2, refresh token rotation, brute-force protection, audit log aksi admin/EO.
- Privasi data peserta (UU PDP): minimalkan data, persetujuan eksplisit, kemampuan hapus akun.
- Prompt AI: anggap konten eksternal sebagai data tidak tepercaya (cegah prompt injection), output AI divalidasi skema JSON, ada fallback bila AI gagal.
- Performa: cache berita & event (Redis), pagination cursor, gambar dioptimasi (WebP/AVIF), target Lighthouse ≥ 90.
- Testing: unit (logika bracket, auth), integration per service, e2e Playwright untuk alur utama (daftar → join komunitas → daftar event → lihat bracket).
- CI: lint, typecheck, test, build image pada tiap PR.

**Definition of Done tiap fitur**: berjalan di docker compose, ada validasi & error state, ada test inti, UI sesuai design system dan responsif, dokumentasi endpoint di Swagger, tidak ada secret di repo.

---

## 11. PHASE PROMPTS (jalankan berurutan)

### Phase 0 — Fondasi
```
Kerjakan Phase 0 sesuai PROJECT_SPEC.md: setup monorepo (pnpm + Turborepo),
konfigurasi TypeScript/ESLint/Prettier, packages/contracts, packages/ui dengan
design tokens (warna, font, spacing) dari Bagian 7, docker-compose berisi
Postgres, Redis, NATS, MinIO, serta template service NestJS (health check,
logger, config, Swagger) dan CI GitHub Actions. Berikan README cara menjalankan.
```

### Phase 1 — Identity & Gateway
```
Phase 1: bangun identity-service (register, login, refresh rotation, RBAC
USER/ORGANIZER/ADMIN, profil, pengajuan & verifikasi EO) dan gateway
(routing, JWT validation, rate limit). Sertakan test untuk auth dan RBAC.
Lalu bangun halaman web /masuk, /daftar, /profil sesuai design system.
```

### Phase 2 — Frontend Shell & Design System
```
Phase 2: bangun layout global (navbar, footer, dark theme merah), komponen
inti (Button chamfer, Card, Badge, Tabs, Modal, Skeleton, Toast, Form),
halaman Beranda dengan data mock yang bentuknya sama dengan kontrak API.
Ikuti aturan anti tampilan AI. Buat halaman /styleguide untuk review visual.
```

### Phase 3 — Berita + AI Curator
```
Phase 3: bangun news-service, news-ingestor, dan ai-service (provider
abstraction, prompt registry versioned, logging biaya/latensi). Implementasikan
pipeline Fetch→Dedupe→AI Evaluate→AI Rewrite→Moderation→Review/Publish dengan
atribusi sumber wajib dan output JSON tervalidasi. Bangun /berita, detail
artikel, dan admin antrean review. Mode default REVIEW.
```

### Phase 4 — Komunitas
```
Phase 4: bangun community-service dan UI: daftar komunitas per game, halaman
komunitas (tab Diskusi/Event/Bracket/Anggota), join/leave, post, komentar,
like, report, peran moderator. Hubungkan AI moderation lewat event bus.
```

### Phase 5 — Event & Tools EO
```
Phase 5: bangun event-service, media-service, dan dashboard EO: CRUD event,
Form Builder pendaftaran (schema JSON + validasi dinamis), pendaftaran
individu/tim, manajemen peserta (approve/reject/waitlist/export CSV), storage
khusus per event dengan kuota & signed URL, serta pengumuman. Terapkan
tenant isolation ketat. Bangun halaman publik /event dan pendaftaran.
```

### Phase 6 — Bracket & Leaderboard
```
Phase 6: bangun bracket-service: Single/Double Elimination, Round Robin, Swiss,
Group+Playoff, dan Leaderboard poin custom. Seeding manual/acak, auto-advance,
bye, tiebreaker, input skor, realtime via SSE. Buat bracket viewer bergaya
broadcast dan widget embed untuk halaman komunitas & peserta. Sertakan unit
test lengkap untuk algoritma bracket.
```

### Phase 7 — AI Tambahan, Search, Notifikasi
```
Phase 7: tambahkan EO Assistant (generate deskripsi/rulebook/struktur bracket),
smart search (pgvector), rekomendasi komunitas & event, notification-service
(email + in-app + pengingat event).
```

### Phase 8 — Hardening & Deploy
```
Phase 8: audit keamanan sesuai Bagian 10, observability (OpenTelemetry, metrics),
e2e Playwright, optimasi performa, dokumentasi arsitektur (diagram), dan
manifest deploy (Docker production, opsional Helm/K8s).
```

---

## 12. Variasi Prompt Singkat (pilih sesuai tool)

**Versi Cursor / Windsurf (ringkas)**
```
Bangun ESPORT SUMBAR (Next.js + NestJS microservices, Postgres, NATS, Redis).
Fitur: berita auto-AI, komunitas per game, event + tools EO (form builder,
storage, bracket custom). Peran: User, EO, Admin. UI dark merah gaya
esport pro, bukan template AI. Ikuti PROJECT_SPEC.md, kerjakan per phase.
```

**Versi Claude Code (agentic)**
```
Baca PROJECT_SPEC.md. Buat rencana implementasi Phase 0 dan daftar file yang
akan dibuat, minta persetujuan, lalu eksekusi. Jalankan lint, typecheck, dan
test setelah tiap perubahan besar. Commit per unit kerja dengan pesan jelas.
```

**Versi MVP Cepat (kalau ingin hasil lebih cepat dulu)**
```
Buat MVP ESPORT SUMBAR sebagai modular monolith (satu backend NestJS dengan
modul identity/news/community/event/bracket/ai, batas modul tegas dan komunikasi
lewat event internal) agar nanti mudah dipecah jadi microservices. Fitur dan
UI tetap sesuai PROJECT_SPEC.md.
```

---

## 13. Keputusan Terbuka (isi sebelum mulai)

- [ ] Provider hosting (VPS/Cloud) dan domain
- [ ] Daftar game awal yang didukung
- [ ] Daftar sumber berita awal (RSS) dan kebijakan atribusi
- [ ] Apakah pendaftaran event berbayar perlu payment gateway (Midtrans/Xendit) di versi awal
- [ ] Kebijakan verifikasi EO (dokumen apa yang diminta)
- [ ] Logo & brand asset ESPORT SUMBAR
