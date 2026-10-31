# Panduan Integrasi Supabase - Platform Provider Esport Sumbar

Sistem backend Esport Sumbar telah dirancang dengan arsitektur **Hybrid Connector**:
1. **Cloud Production**: Terhubung secara native ke Supabase PostgreSQL, Realtime Subscription, dan Row-Level Security (RLS).
2. **Local / Zero-Config Fallback**: Jika kredensial Supabase belum diisi, backend otomatis menggunakan in-memory JSON store yang persisten tanpa downtime atau error.

---

## Langkah 1: Buat Proyek Supabase Baru
1. Buka [https://supabase.com/dashboard](https://supabase.com/dashboard) dan buat organisasi / proyek baru.
2. Beri nama proyek: `esport-sumbar`.
3. Pilih region terdekat: `Singapore (ap-southeast-1)`.
4. Simpan database password yang Anda buat.

---

## Langkah 2: Eksekusi Skema Database
1. Pada menu navigasi kiri Supabase Dashboard, klik **SQL Editor**.
2. Klik **New query**.
3. Buka file `supabase/schema.sql` di proyek ini, salin seluruh kodenya, lalu tempelkan ke SQL Editor Supabase.
4. Klik tombol **Run** (Ctrl + Enter).
   - Tabel `profiles`, `wilayah`, `atlet`, `tim`, `venue`, `antrean_verifikasi`, `rekomendasi_surat`, `kalender_event`, dan `bursa_proposals` akan dibuat.
   - Fungsi RPC `get_platform_stats()` yang menghitung statistik realtime database akan terpasang.
   - Kebijakan keamanan RLS (Row Level Security) otomatis aktif.

---

## Langkah 3: Eksekusi Seed Data Awal
1. Di SQL Editor Supabase, buat query baru.
2. Salin seluruh isi file `supabase/seed.sql`, tempelkan, lalu klik **Run**.
   - 19 Pengcab ESI Kabupaten/Kota se-Sumatera Barat langsung terdaftar.
   - Profil atlet bintang, tim terakreditasi, venue, dan akun admin akan langsung terisi.

---

## Langkah 4: Masukkan API Keys ke Vercel / File .env
1. Di Supabase Dashboard, buka **Project Settings** > **API**.
2. Salin:
   - **Project URL** -> `SUPABASE_URL`
   - **anon / public key** -> `SUPABASE_ANON_KEY`
   - **service_role key** (secret) -> `SUPABASE_SERVICE_ROLE_KEY`
3. Masukkan ke pengaturan Vercel:
   - Buka project di [Vercel Dashboard](https://vercel.com/)
   - Masuk ke **Settings** > **Environment Variables**
   - Tambahkan 3 variabel tersebut untuk environment `Production`, `Preview`, dan `Development`.
4. (Opsional untuk development lokal) Salin `.env.example` menjadi `.env` di komputer lokal Anda dan masukkan 3 kunci tersebut.

---

## Keunggulan Sistem Realtime Supabase
- **Semua angka pada website diperbarui secara realtime** langsung dari PostgreSQL melalui RPC `get_platform_stats()`.
- Setiap kali ada pendaftar baru melalui `/daftar`, status antrean di dashboard Super Admin dan ESI Sumbar terupdate seketika.
- Saat Pengcab atau Super Admin memverifikasi atlet, nomor paspor digital (`PBESI-SB-2026-xxx`) otomatis diterbitkan dan jumlah kartu aktif langsung bertambah secara realtime.
