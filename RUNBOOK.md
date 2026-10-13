# ESPORT SUMBAR v2 — Operational Runbook & Incident Response

Buku panduan operasional harian, pemeliharaan berkala, penanganan insiden, dan prosedur disaster recovery platform ESPORT SUMBAR.

---

## 1. Perintah Operasional Cepat (Cheatsheet)

Semua perintah dijalankan di direktori root `/opt/esport-sumbar`:

```bash
# Cek status kesehatan seluruh container
docker compose -f docker-compose.prod.yml ps

# Cek penggunaan CPU dan Memori live
docker stats --no-stream

# Memeriksa log Caddy / Akses Publik
docker logs -f esport-prod-caddy

# Memeriksa log API Gateway
docker logs -f esport-prod-gateway

# Memeriksa log News Ingestor (Instagram)
docker logs -f esport-prod-news-ingestor

# Restart layanan tertentu tanpa mengganggu yang lain
docker compose -f docker-compose.prod.yml restart identity-service

# Menjalankan backup database seketika
make backup

# Melakukan deploy rilis baru dengan auto-rollback
make deploy
```

---

## 2. Prosedur Tanggap Insiden (Incident Response Playbook)

### Skenario A: Portal Web Menampilkan "502 Bad Gateway" atau Down
**Gejala**: Pengguna melaporkan tidak bisa membuka `esportsumbar.id`, `eo.esportsumbar.id`, atau `admin.esportsumbar.id`.
**Langkah Diagnosa**:
1. Periksa apakah Caddy berjalan:
   ```bash
   docker ps | grep caddy
   ```
2. Periksa log reverse proxy Caddy:
   ```bash
   docker logs --tail 50 esport-prod-caddy
   ```
3. Periksa status container frontend (`esport-prod-web`, `eo`, `admin`) dan backend (`gateway`):
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
4. Jika salah satu container berstatus `Exited (137)` (OOM Killed):
   - Periksa swap: `free -h`
   - Restart container yang mati:
     ```bash
     docker compose -f docker-compose.prod.yml restart web gateway
     ```

---

### Skenario B: Instagram Graph API Token Kedaluwarsa / Error 190
**Gejala**: Banner peringatan di Admin Console bertuliskan "Token Instagram kedaluwarsa" atau log `news-ingestor` menampilkan `OAuthException (code 190)`.
**Penyebab**: Long-lived access token Meta berumur 60 hari dan belum diperpanjang sebelum masa berlakunya habis.
**Langkah Penanganan**:
1. Buka Admin Console: `https://admin.esportsumbar.id/instagram`.
2. Klik tombol **Perpanjang Token (60 Hari)**.
3. Jika token sudah terlanjur hangus (melewati 60 hari):
   - Buka [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/).
   - Generate User Access Token baru dengan permission `instagram_basic`, `pages_show_list`, `instagram_manage_insights`.
   - Konversikan ke Long-Lived Token via endpoint oauth.
   - Buka Admin Console → **Pengaturan API** → Masukkan Access Token baru → Klik **Simpan & Uji Koneksi**.
4. Log sinkronisasi akan kembali hijau dalam waktu < 1 menit.

---

### Skenario C: PostgreSQL Database Connection Spike / Deadlock
**Gejala**: Layanan merespon lambat, API Gateway menghasilkan error 504 Gateway Timeout, log backend menampilkan `sorry, too many clients already`.
**Langkah Penanganan**:
1. Periksa jumlah koneksi aktif ke PostgreSQL:
   ```bash
   docker exec -it esport-prod-postgres psql -U postgres -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
   ```
2. Temukan query yang mengalami lock / hanging:
   ```bash
   docker exec -it esport-prod-postgres psql -U postgres -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '10 seconds';"
   ```
3. Hentikan (terminate) proses yang hanging jika diperlukan:
   ```bash
   docker exec -it esport-prod-postgres psql -U postgres -c "SELECT pg_terminate_backend(<PID>);"
   ```
4. Jika koneksi tetap jenuh, restart connection pooler atau restart layanan backend:
   ```bash
   docker compose -f docker-compose.prod.yml restart gateway news-service event-service
   ```

---

### Skenario D: NATS JetStream / Redis Backlog
**Gejala**: Pesan notifikasi atau sinkronisasi berita tertunda lama.
**Langkah Penanganan**:
1. Periksa penggunaan memori Redis:
   ```bash
   docker exec -it esport-prod-redis redis-cli -a "$REDIS_PASSWORD" info memory
   ```
2. Periksa monitoring NATS di port 8222:
   ```bash
   curl -s http://localhost:8222/varz | jq .
   ```
3. Bersihkan antrean yang tersumbat jika terdapat unhandled rejection:
   ```bash
   docker compose -f docker-compose.prod.yml restart news-ingestor notification-service
   ```

---

### Skenario E: Sertifikat SSL Caddy Gagal Terbit
**Gejala**: Browser menampilkan `NET::ERR_CERT_COMMON_NAME_INVALID` atau koneksi tidak aman.
**Langkah Penanganan**:
1. Periksa log Caddy terkait ACME challenges:
   ```bash
   docker logs esport-prod-caddy | grep -i acme
   ```
2. Pastikan port 80 dan 443 terbuka di firewall VPS:
   ```bash
   sudo ufw status
   ```
3. Pastikan DNS A-Record di Cloudflare mengarah tepat ke IP VPS dan tidak ada typo.
4. Paksa Caddy untuk menerbitkan ulang sertifikat:
   ```bash
   docker compose -f docker-compose.prod.yml exec caddy caddy reload --force
   ```

---

## 3. Prosedur Disaster Recovery (Pemulihan Bencana)

Jika server mengalami kerusakan fatal, ikuti langkah pemulihan cepat (RTO < 15 menit, RPO < 24 jam):

### Langkah 1: Siapkan Server Baru
1. Sewa VPS baru di lokasi yang sama.
2. Jalankan `bootstrap.sh`.
3. Arahkan DNS Cloudflare ke IP VPS baru.

### Langkah 2: Ambil Backup Terakhir
Unduh arsip cadangan dari S3 atau server remote:
```bash
# Contoh unduh arsip backup terbaru
aws s3 cp s3://esport-sumbar-backups-sg/backups/esport_sumbar_backup_YYYYMMDD_HHMMSS.tar.gz /opt/esport-sumbar/backups/
```

### Langkah 3: Jalankan Restorasi
```bash
cd /opt/esport-sumbar
make restore ARCHIVE=/opt/esport-sumbar/backups/esport_sumbar_backup_YYYYMMDD_HHMMSS.tar.gz
```
Skrip ini akan memvalidasi integritas SHA256, mengekstrak data PostgreSQL, dan mengembalikan seluruh skema microservices secara utuh.

---

## 4. Jadwal Pemeliharaan Berkala (Preventive Maintenance)

| Frekuensi | Tugas | Panduan |
|---|---|---|
| **Harian** | Otomatis backup PostgreSQL & media | Verifikasi log di `/var/log/esport_backup.log` |
| **Mingguan** | Inspeksi sisa masa berlaku token Instagram | Cek indikator hari di Admin Console |
| **Bulanan** | Uji coba simulasi restore cadangan | Jalankan `restore.sh` di lingkungan staging |
| **Bulanan** | Prune image Docker dan cache tidak terpakai | `docker system prune -af --volumes=false` |
| **Triwulanan**| Rotasi kunci JWT Access & Refresh | Ubah nilai di `.env` lalu restart `identity-service` |
