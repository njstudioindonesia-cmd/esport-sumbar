# 🏛️ ESPORT SUMBAR — Arsitektur Sistem & Spesifikasi Teknis

> **Portal Esport All-in-One Sumatera Barat**  
> Standar Arsitektur: *Microservices Monorepo*, *Event-Driven Architecture (EDA)*, *Tenant Isolation Keras*, *Realtime Server-Sent Events (SSE)*, dan *AI-Powered Content & Moderation*.

---

## 1. Diagram Arsitektur Sistem (High-Level Microservices)

```mermaid
graph TD
    Client["Next.js 15 Web Frontend (App Router, Port 3000)"]
    PublicAPI["API Gateway (NestJS, Port 4000, Reverse Proxy, Rate Limit, Helmet)"]

    Client -->|REST & SSE Requests| PublicAPI

    subgraph "Backend Microservices Monorepo"
        PublicAPI -->|/api/auth, /api/users| Identity["identity-service (Port 4001)"]
        PublicAPI -->|/api/news| News["news-service (Port 4002)"]
        PublicAPI -->|/api/ingest| Ingestor["news-ingestor (Port 4003)"]
        PublicAPI -->|/api/communities| Community["community-service (Port 4004)"]
        PublicAPI -->|/api/events, /api/eo| Event["event-service (Port 4005)"]
        PublicAPI -->|/api/media| Media["media-service (Port 4006)"]
        PublicAPI -->|/api/brackets, /stream| Bracket["bracket-service (Port 4007)"]
        PublicAPI -->|/api/ai, /api/search| AI["ai-service (Port 4008)"]
        PublicAPI -->|/api/notifications| Notification["notification-service (Port 4009)"]
    end

    subgraph "Infrastructure & Data Layer"
        Postgres[("PostgreSQL 16 + pgvector")]
        Redis[("Redis 7 (Cache, Session, Rate Limit)")]
        NATS[("NATS JetStream (Event Bus)")]
        MinIO[("MinIO / S3 Object Storage")]
    end

    Identity -.-> Postgres
    News -.-> Postgres
    News -.-> Redis
    Community -.-> Postgres
    Event -.-> Postgres
    Media -.-> MinIO
    Bracket -.-> Postgres
    Bracket -.-> Redis
    Notification -.-> Postgres
    AI -.-> Postgres
```

---

## 2. Diagram Alur Data & Event Bus (Event-Driven Pipeline)

```mermaid
sequenceDiagram
    autonumber
    participant Ingestor as news-ingestor
    participant NATS as NATS JetStream (Event Bus)
    participant AI as ai-service
    participant News as news-service
    participant Notification as notification-service
    participant Client as Next.js Web Frontend

    Note over Ingestor: Fetch feeds RSS/portal lokal Sumbar
    Ingestor->>NATS: Publish event `news.ingested.v1`
    NATS->>AI: Consume `news.ingested.v1`
    Note over AI: Claude / Mock LLM Evaluasi Viralitas & Rewrite
    AI->>NATS: Publish event `news.curated.v1`
    NATS->>News: Consume `news.curated.v1` (Simpan status REVIEW)
    Note over News: Admin menyetujui artikel di antrean
    News->>NATS: Publish event `news.published.v1`
    NATS->>Notification: Trigger notifikasi berita trending
    NATS->>Client: Web UI menampilkan berita terkurasi
```

---

## 3. Diagram Bracket Engine & Realtime SSE Streaming

```mermaid
sequenceDiagram
    autonumber
    participant EO as EO Organizer Admin
    participant Bracket as bracket-service (Port 4007)
    participant Client as Public Bracket Viewer (Port 3000)
    participant Embed as Standalone Embed Widget

    Client->>Bracket: Connect SSE: GET /tournaments/:id/stream
    Embed->>Bracket: Connect SSE: GET /tournaments/:id/stream
    Note over Client,Embed: Koneksi HTTP SSE aktif (Heartbeat 15s)

    EO->>Bracket: PATCH /tournaments/:id/matches/:matchId/score (Score: 2 - 1)
    Note over Bracket: Hitung Winner & Jalankan Auto-Advance ke Ronde Berikutnya
    Bracket-->>Client: SSE Event: MATCH_SCORE_UPDATED (Payload JSON)
    Bracket-->>Embed: SSE Event: MATCH_SCORE_UPDATED (Payload JSON)
    Note over Client,Embed: Re-render UI instan tanpa reload browser!
```

---

## 4. Model Keamanan & Tenant Isolation Keras

```mermaid
flowchart TD
    Req["Incoming HTTP Request"] --> Gateway["API Gateway (Port 4000)"]
    Gateway --> RateLimit{"Global Rate Limit<br/>100 req/min (Auth: 20 req/min)"}
    RateLimit -->|Pass| SecHeaders["Helmet CSP & Security Headers"]
    SecHeaders --> AuthCheck{"JWT & Role Guard<br/>USER / ORGANIZER / ADMIN"}
    AuthCheck -->|Unauthorized| Deny["401 Unauthorized / 403 Forbidden"]
    AuthCheck -->|Authorized| ProxyReq["Forward with Headers:<br/>x-user-id, x-user-role, x-correlation-id"]
    ProxyReq --> Microservice["Target Microservice (Event/Media/EO)"]
    Microservice --> TenantCheck{"Tenant Ownership Verification<br/>event.organizerId === req.headers['x-user-id']"}
    TenantCheck -->|Mismatch| TenantDeny["403 Forbidden: Akses event EO lain ditolak"]
    TenantCheck -->|Match| AllowAction["Eksekusi Operasi & Catat Security Audit Log"]
```

---

## 5. Direktori Port Layanan & Rute Gateway

| Service | Port | Tanggung Jawab Utama | Rute Gateway Proxy |
| :--- | :---: | :--- | :--- |
| **API Gateway** | `4000` | Entry point tunggal, Rate Limit, Helmet, Correlation ID | `http://localhost:4000` |
| **identity-service** | `4001` | Auth, Register, Login, Token Refresh Rotation, Profil, EO Status | `/api/auth`, `/api/users`, `/api/organizer` |
| **news-service** | `4002` | Portal berita, CRUD editorial, Bookmark, Trending Viral Score | `/api/news`, `/api/admin/news` |
| **news-ingestor** | `4003` | Background RSS crawler, SHA-256 deduplikasi, Ingest pipeline | `/api/ingest` |
| **community-service**| `4004` | Hub komunitas per game, forum diskusi, moderasi, anggota | `/api/communities`, `/api/admin/moderation` |
| **event-service** | `4005` | Wizard turnamen, Form Builder dinamis, pendaftaran peserta | `/api/events`, `/api/eo` |
| **media-service** | `4006` | Storage privat per event, kuota 50MB, HMAC-SHA256 signed URL | `/api/media` |
| **bracket-service** | `4007` | 6 format turnamen, Seeding, Auto-advance, Realtime SSE | `/api/brackets` |
| **ai-service** | `4008` | Kurasi Claude LLM, Moderasi teks, EO Assistant, Semantic Search | `/api/ai`, `/api/search` |
| **notification-service** | `4009` | In-app notification center, unread counter, event reminders | `/api/notifications` |
| **Next.js Web** | `3000` | Frontend UI App Router, Broadcast Viewer, Standalone Embed | `http://localhost:3000` |

---

## 6. Format Turnamen yang Didukung (Algoritma Bracket)

1. **SINGLE_ELIMINATION**: Sistem gugur tunggal standar kompetisi internasional dengan seeding rating/acak dan penanganan BYE otomatis.
2. **DOUBLE_ELIMINATION**: Bracket Upper & Lower (Losers Bracket) dengan babak Grand Final yang adil.
3. **ROUND_ROBIN**: Sistem setengah kompetisi, setiap tim bertanding satu sama lain dalam grup dengan akumulasi poin W-D-L.
4. **SWISS_SYSTEM**: Format kompetisi berpasangan berdasarkan rekor skor terkini tanpa eliminasi dini.
5. **GROUP_PLAYOFF**: Babak penyisihan grup dilanjutkan dengan bracket eliminasi untuk tim yang lolos kualifikasi.
6. **LEADERBOARD (BATTLE ROYALE)**: Format akumulasi poin khusus game Battle Royale (Free Fire / PUBG Mobile) dengan bobot Placement Point + Kill Point serta kriteria tiebreaker bertingkat (Total Poin $\rightarrow$ Total Placement $\rightarrow$ Total Kills $\rightarrow$ Skor Match Terakhir).
