# Panduan Integrasi Resmi Meta Instagram Graph API (@esportsumbar)

Dokumen ini adalah panduan langkah demi langkah untuk menghubungkan akun resmi **@esportsumbar** ke platform **ESPORT SUMBAR** menggunakan **Meta Instagram Graph API resmi**.

> [!IMPORTANT]
> **Kebijakan Anti-Scraper**: Platform ESPORT SUMBAR secara ketat **tidak menggunakan scraper/crawler**, sesi login palsu, atau library scraping tidak resmi. Seluruh penarikan berita, sinkronisasi gambar, dan deteksi turnamen dilakukan melalui **Meta Graph API resmi v19.0+** guna memastikan stabilitas jangka panjang dan bebas risiko pemblokiran akun.

---

## 1. Persyaratan Awal Akun Instagram & Facebook

1. **Ubah Akun Instagram ke Tipe Profesional (Business / Creator)**:
   - Buka aplikasi Instagram di ponsel → Buka Profil **@esportsumbar** → Ketuk menu garis tiga (Pengaturan) → **Jenis dan Fitur Akun** → **Beralih ke Akun Profesional**.
   - Pilih kategori yang relevan: *Esports League*, *Gaming Community*, atau *Media*.
2. **Hubungkan ke Halaman Facebook (Facebook Page)**:
   - Instagram Graph API mewajibkan akun Instagram Business terhubung ke setidaknya satu Facebook Page resmi.
   - Buka Pengaturan Instagram → **Pusat Akun Meta** → **Profil** → Hubungkan ke Facebook Page `ESPORT SUMBAR`.
   - Pastikan akun Facebook Anda memiliki peran **Admin Penuh** (Facebook Page Access) pada Halaman tersebut.

---

## 2. Pembuatan Meta Developer App

1. Kunjungi portal developer resmi: [Meta for Developers](https://developers.facebook.com/).
2. Masuk menggunakan akun Facebook Admin yang memiliki Halaman tersebut.
3. Klik tombol **My Apps** (Aplikasi Saya) → **Create App** (Buat Aplikasi).
4. Pilih **Jenis Kasus Penggunaan (Use Case)**:
   - Pilih **Other** (Lainnya) → Klik **Next**.
   - Pilih jenis aplikasi: **Business** (Bisnis).
5. Masukkan detail aplikasi:
   - **App Display Name**: `Esport Sumbar Sync Connector`
   - **App Contact Email**: `admin@esportsumbar.id`
   - **Business Account**: Pilih Akun Bisnis Meta Anda (atau buat baru jika belum ada).
   - Klik **Create App**.

---

## 3. Konfigurasi Produk Instagram Graph API & Izin Akses

1. Pada Dashboard Aplikasi Meta, gulir ke bagian **Add Products to Your App** (Tambahkan Produk).
2. Temukan **Instagram Graph API** → Klik **Set Up** (Siapkan).
3. Buka menu samping kiri: **App Review** → **Permissions and Features**:
   - Minta izin (permissions) berikut:
     - `instagram_basic`: Membaca profil dan media foto/video/carousel postingan feed.
     - `pages_show_list`: Menemukan Halaman Facebook yang terhubung ke akun Instagram.
     - `pages_read_engagement`: Mengautentikasi engagement media feed.
     - `instagram_manage_comments` *(Opsional)*: Membaca jumlah dan interaksi komentar.

---

## 4. Dapatkan Long-Lived User Access Token (60 Hari) & IG_USER_ID

### Langkah 4.1: Buka Graph API Explorer
1. Buka [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. Pada dropdown **Meta App**, pilih `Esport Sumbar Sync Connector`.
3. Pada dropdown **User or Page**, pilih **Get User Access Token**.
4. Di bagian **Permissions**, centang `instagram_basic`, `pages_show_list`, `pages_read_engagement`.
5. Klik **Generate Access Token** dan setujui dialog otorisasi login Facebook.

### Langkah 4.2: Dapatkan Instagram Business Account ID (`IG_USER_ID`)
Jalankan query Graph API berikut pada Graph API Explorer:
```http
GET v19.0/me/accounts?fields=name,instagram_business_account{id,username}
```
Hasil respon JSON akan menampilkan ID akun Instagram Anda:
```json
{
  "data": [
    {
      "name": "Esport Sumbar Official",
      "instagram_business_account": {
        "id": "1784140029381",
        "username": "esportsumbar"
      }
    }
  ]
}
```
> **Catat ID ini**: Nilai `1784140029381` adalah nilai `IG_USER_ID` Anda.

### Langkah 4.3: Tukar Token Pendek (Short-Lived) Menjadi Long-Lived Token (60 Hari)
Buka terminal dan jalankan curl berikut (ganti parameter di dalam tanda kurung kurawal):
```bash
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id={META_APP_ID}&\
client_secret={META_APP_SECRET}&\
fb_exchange_token={SHORT_LIVED_TOKEN}"
```
Respon akan mengembalikan token berjangka 60 hari:
```json
{
  "access_token": "EAAGm0PX4ZCpsBA...",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

---

## 5. Konfigurasi Variabel Lingkungan (`.env`)

Masukkan nilai kredensial ke dalam file `.env` (atau GitHub Actions Secrets untuk produksi):

```ini
# Meta Instagram Graph API Configuration
IG_APP_ID=104829104810283
IG_APP_SECRET=a8f93e2b1c0d4e5f6a7b8c9d0e1f2a3b
IG_USER_ID=1784140029381
IG_ACCESS_TOKEN=EAAGm0PX4ZCpsBA...
IG_WEBHOOK_VERIFY_TOKEN=esportsumbar_secret_verify_token
IG_POLL_INTERVAL_MIN=15
IG_PUBLISH_MODE=REVIEW
```

---

## 6. Uji Sinkronisasi dari Admin Console

1. Buka browser dan arahkan ke Admin Console: [http://localhost:3002/instagram](http://localhost:3002/instagram).
2. Periksa kartu status koneksi:
   - Akun: `@esportsumbar`
   - Status Badge: `TERHUBUNG`
   - Masa Berlaku Token: `60 Hari (Long-Lived Access Token)`
3. Klik tombol **"Sinkronkan Media Sekarang"**:
   - Sistem akan menarik 10 media terakhir dari feed Instagram.
   - AI Pipeline otomatis mengklasifikasikan:
     - Postingan turnamen diekstrak menjadi **EventDraft** (siap dijadikan turnamen resmi oleh panitia).
     - Postingan hasil pertandingan/prestasi dipublikasikan menjadi **Warta Berita** lengkap dengan galeri foto dan atribusi wajib.
     - Postingan giveaway sponsor disaring ke tab **Postingan Disaring**.
4. Mode Publikasi dapat diubah sewaktu-waktu:
   - **REVIEW**: Konten baru masuk ke antrean kurasi redaksi terlebih dahulu.
   - **AUTO**: Konten langsung tayang otomatis di portal publik [esportsumbar.id](http://localhost:3000).

---

## 7. Mekanisme Pembaruan Token Otomatis (Auto-Refresh)

1. Token Meta Long-Lived memiliki masa aktif **60 hari**.
2. Service `news-ingestor` memiliki engine otomatis yang akan me-refresh token sebelum kedaluwarsa via Meta API:
   ```
   GET https://graph.facebook.com/v19.0/refresh_access_token?grant_type=ig_refresh_token&access_token={token}
   ```
3. Peringatan dini (*early warning alert*):
   - Jika sisa masa berlaku token kurang dari **10 hari**, banner peringatan kuning otomatis muncul di Admin Console dan notifikasi dikirim ke admin sistem.
   - Admin dapat mengeklik tombol **"Perbarui Token (60 Hari)"** di dashboard kapan saja untuk me-reset hitungan mundur ke 60 hari.

---

## 8. Panduan Troubleshooting

| Masalah / Error | Penyebab | Solusi |
|---|---|---|
| **Error 190 (Invalid OAuth access token)** | Token kedaluwarsa atau kata sandi akun Facebook diubah | Buat ulang token baru di Graph API Explorer dan perbarui di menu "Atur Kredensial" Admin Console. |
| **Error 10 (Application does not have permission)** | Akun Instagram belum bertipe Business/Creator atau izin belum disetujui | Pastikan akun IG bertipe Profesional dan permissions `instagram_basic` serta `pages_show_list` sudah dicentang. |
| **Error 100 (Cannot find Instagram Business Account)** | Instagram belum dihubungkan ke Facebook Page | Buka Pengaturan Akun Meta di Instagram dan pastikan terhubung ke Halaman Facebook resmi. |
| **Rate Limit Exceeded (Error 4 / 17)** | Terlalu sering memanggil API dalam jeda singkat | Sistem telah dilengkapi exponential backoff retry. Tetapkan `IG_POLL_INTERVAL_MIN=15` (15 menit). |
