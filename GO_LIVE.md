# ESPORT SUMBAR v2 — Panduan & Checklist Go-Live (Produksi)

Dokumen ini memandu proses rilis dari kode lokal ke server produksi hidup (**Single VPS 4 vCPU / 8 GB + Docker Compose + Caddy + Cloudflare**).

---

## 1. Pemetaan Tanggung Jawab (Otomatis vs Manual)

| Komponen | Status Otomatisasi | Tindakan Manual Operator |
|---|---|---|
| **Penyediaan Server & Domain** | ❌ Manual (Memerlukan kartu kredit/akun penyedia) | Beli domain & sewa VPS Ubuntu 22.04/24.04 |
| **Konfigurasi DNS Cloudflare** | ❌ Manual (Akses dashboard Cloudflare) | Tambahkan 4 DNS Record A/CNAME |
| **Server Hardening & Docker** |  Otomatis via `infra/scripts/bootstrap.sh` | Jalankan 1 perintah via SSH |
| **GitHub Secrets / Kredensial** | ❌ Manual (Rahasia keamanan) | Masukkan secret di repository GitHub Settings |
| **Build, Test, & Linting** |  Otomatis via GitHub Actions CI | Otomatis berjalan per PR / Push |
| **Deploy & Rolling Update** |  Otomatis via `infra/scripts/deploy.sh` | Dijalankan oleh CI/CD atau manual `make deploy` |
| **Database Migrations & Seed** |  Otomatis via `infra/scripts/seed.sh` | Akun superadmin & game ter-seed otomatis |
| **HTTPS SSL Let's Encrypt** |  Otomatis via Caddy | Otomatis diterbitkan dan diperpanjang |
| **Backup Harian & Retensi** |  Otomatis via `infra/scripts/backup.sh` | Cron job harian (7 hari daily / 4 minggu weekly) |
| **Koneksi Instagram Graph API** |  Semi-Otomatis | Isi 4 kredensial Meta App di Admin Console |

---

## 2. Langkah Demi Langkah Go-Live

### Langkah 1: Beli Domain & Atur Cloudflare DNS [MANUAL]
1. Beli domain `esportsumbar.id` (atau domain pilihan Anda) di registrar terpercaya (Niagahoster, DomaiNesia, Namecheap, dll.).
2. Ubah Name Server domain ke Cloudflare.
3. Di dashboard Cloudflare DNS, arahkan record berikut ke IP Publik VPS Anda (mode DNS Only / Proxy aktif):

| Type | Name | Content / Target | Proxy Status |
|---|---|---|---|
| **A** | `@` (`esportsumbar.id`) | `<IP_PUBLIK_VPS>` | DNS Only (atau Proxied) |
| **A** | `eo` (`eo.esportsumbar.id`) | `<IP_PUBLIK_VPS>` | DNS Only (atau Proxied) |
| **A** | `admin` (`admin.esportsumbar.id`) | `<IP_PUBLIK_VPS>` | DNS Only (atau Proxied) |
| **A** | `api` (`api.esportsumbar.id`) | `<IP_PUBLIK_VPS>` | DNS Only (atau Proxied) |

> **Catatan Cloudflare**: Jika menggunakan mode **Proxied (Orange Cloud)**, pastikan pengaturan SSL/TLS di Cloudflare diset ke **Full (Strict)** agar Caddy dapat melakukan validasi sertifikat SSL dengan benar.

---

### Langkah 2: Provisioning VPS & Bootstrap [1 PERINTAH]
1. Sewa VPS (Rekomendasi: Hetzner, DigitalOcean, Linode, atau IDCloudHost) dengan spesifikasi:
   - **4 vCPU / 8 GB RAM** (Region Singapura atau Jakarta)
   - OS: **Ubuntu 22.04 LTS** atau **Ubuntu 24.04 LTS**
   - SSH Key login aktif.
2. Login ke VPS sebagai root:
   ```bash
   ssh root@<IP_PUBLIK_VPS>
   ```
3. Unduh dan jalankan skrip bootstrap resmi:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/<YOUR_ORG>/esport-sumbar/master/infra/scripts/bootstrap.sh -o bootstrap.sh
   bash bootstrap.sh
   ```
   *Skrip ini otomatis mengkonfigurasi: Swap 4GB, Docker Engine, UFW Firewall (hanya port 22, 80, 443), Fail2ban, kernel tuning, dan user `deployer`.*

---

### Langkah 3: Konfigurasi GitHub Secrets [MANUAL]
Buka repositori GitHub Anda → **Settings** → **Secrets and variables** → **Actions** → Buat secret berikut:

| Secret Name | Keterangan | Contoh Nilai |
|---|---|---|
| `PROD_SSH_HOST` | IP Publik VPS Produksi | `103.123.45.67` |
| `PROD_SSH_USER` | Pengguna deployment non-root | `deployer` |
| `PROD_SSH_KEY` | Private SSH Key deployer (id_rsa) | `-----BEGIN OPENSSH PRIVATE KEY...` |
| `POSTGRES_PASSWORD` | Password root PostgreSQL | `Pass_S4ngat_Kuat_2026!` |
| `REDIS_PASSWORD` | Password autentikasi Redis | `Redis_Sumbar_Kuat_2026!` |
| `JWT_SECRET` | Kunci enkripsi access token | Buat via `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET`| Kunci enkripsi refresh token | Buat via `openssl rand -base64 48` |
| `TOTP_ENCRYPTION_KEY`| Enkripsi AES rahasia 2FA TOTP | Buat string 32-karakter acak |
| `ANTHROPIC_API_KEY` | API Key Claude untuk AI Ingestor | `sk-ant-api03-...` |
| `SMTP_PASS` | API Key pengiriman email Resend/SES | `re_...` |

---

### Langkah 4: Setup Lingkungan di Server [SEMI-OTOMATIS]
Masuk sebagai user `deployer`:
```bash
ssh deployer@<IP_PUBLIK_VPS>
cd /opt/esport-sumbar
git clone https://github.com/<YOUR_ORG>/esport-sumbar.git .

# Salin template env produksi dan isi secret Anda
cp .env.production.example .env
chmod 600 .env
nano .env # Periksa dan simpan password/kredensial
```

---

### Langkah 5: Eksekusi Deployment Awal & Seed Data
Jalankan perintah deployment dan inisialisasi:
```bash
# 1. Jalankan build dan deployment zero-downtime
make deploy

# 2. Terapkan data awal (SuperAdmin, EO, Game Minang, Kategori Berita)
make seed
```

---

### Langkah 6: Verifikasi Akses 4 Subdomain
Buka peramban (browser) dan pastikan keempat domain menampilkan gembok hijau HTTPS yang valid:
1. **Portal Publik**: `https://esportsumbar.id` → Memuat Beranda Ranah Minang Modern, berita feed, dan event cards.
2. **EO Studio**: `https://eo.esportsumbar.id` → Memuat halaman login & studio manajemen turnamen EO.
3. **Admin Console**: `https://admin.esportsumbar.id` → Memuat konsol admin dengan 2FA protection.
4. **API Gateway**: `https://api.esportsumbar.id/health` → Menghasilkan respon JSON `{"status":"ok"}`.

---

### Langkah 7: Aktivasi Koneksi Instagram Graph API (@esportsumbar)
1. Buka `https://admin.esportsumbar.id` dan login menggunakan akun SuperAdmin default (`admin@esportsumbar.id`).
2. Masuk ke menu **Instagram Sync** (`/instagram`).
3. Klik tombol **Pengaturan API** dan masukkan kredensial Meta App:
   - `IG_APP_ID`
   - `IG_APP_SECRET`
   - `IG_USER_ID`
   - `IG_ACCESS_TOKEN` (Long-lived token)
4. Klik **Simpan & Uji Sinkronisasi**. Pastikan postingan terbaru dari `@esportsumbar` berhasil ditarik ke dalam antrean moderasi berita!
*(Panduan lengkap pembuatan token Meta tersedia di [`INSTAGRAM_SETUP.md`](file:///F:/AI%20DEV/ESPORT%20SUMBAR/INSTAGRAM_SETUP.md)).*

---

### Langkah 8: Jadwalkan Backup Otomatis (Cron Job)
Tambahkan cron job di VPS untuk backup otomatis setiap pukul 03:00 WIB:
```bash
crontab -e
```
Tambahkan baris berikut:
```cron
0 20 * * * /opt/esport-sumbar/infra/scripts/backup.sh >> /var/log/esport_backup.log 2>&1
```
*(Pukul 20:00 UTC = 03:00 WIB waktu lokal Padang).*

---

## 3. Checklist Verifikasi Akhir Sebelum Rilis Publik

- [ ] **SSL / TLS**: Seluruh 4 subdomain lolos verifikasi sertifikat SSL A+ Qualys SSL Labs.
- [ ] **2FA TOTP**: SuperAdmin berhasil mengaktifkan Google Authenticator di Admin Console.
- [ ] **Cross-Portal Guard**: Mencoba login akun role `USER` ke `admin.esportsumbar.id` berhasil ditolak dengan `403 Forbidden`.
- [ ] **Instagram Pipeline**: Berita dari Instagram berhasil tampil di Beranda Publik dengan atribusi `@esportsumbar`.
- [ ] **Audit UU PDP & Legal**: Halaman Kebijakan Privasi (`/kebijakan-privasi`), Syarat & Ketentuan (`/syarat-ketentuan`), dan Kontak terpasang di footer publik.
- [ ] **Disaster Recovery**: Berhasil menguji coba `make backup` dan file dump tersimpan dengan SHA256 checksum valid.
