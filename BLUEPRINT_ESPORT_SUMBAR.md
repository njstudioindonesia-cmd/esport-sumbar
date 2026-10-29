# 🎯 BLUEPRINT & ROADMAP PENGEMBANGAN: ESPORT SUMBAR
> **Status:** Rencana Kerja & Spesifikasi Arsitektur Sistem (Revisi Referensi Desain)  
> **Konsep Visual:** *Tactical Crimson & Clean Off-White Asymmetric UI* (Inspirasi: Visual Referensi Demon Awaken / Valorant Aesthetic)  
> **Posisi Entitas:** Platform Ekosistem & Provider Esports Sumatera Barat (Official Partner ESI Sumbar)  
> **Tanggal Update:** 29 Oktober 2026

---

## 📸 Referensi Desain Resmi

![Design Reference - Crimson Asymmetric UI](C:/Users/njstudio/.gemini/antigravity/brain/bb2e7c7e-14ca-49d5-a306-b5893a9811b7/.user_uploaded/media_1793272019810_25d0823e.jpg)

---

## 1. Bedah Karakter Desain Referensi (*Design Deconstruction*)

Berdasarkan referensi visual yang diberikan, berikut adalah pilar estetika utama yang akan diadaptasi penuh ke dalam antarmuka web **ESPORT SUMBAR**:

### A. Palet Warna & Harmoni Kontras (*High-Contrast Duo Tone*)
* **Canvas Background (Off-White / Cool Silver):** Menggunakan latar belakang abu-abu terang bersih (`#E8ECEF` hingga `#F3F4F6`), bukan hitam pekat. Ini membuat web terasa segar, mewah, tidak monoton, dan memanjakan mata.
* **Dominant Crimson & Blood Red (`#C51A26` / `#E11D48` / `#FF1B51`):** Warna merah pekat bertenaga digunakan sebagai kontainer modular utama, kartu sorotan, dan tombol CTA.
* **High-Contrast Ink Black (`#0B0D11` / `#111827`):** Tipografi judul display, tombol sekunder bergaya kapsul, dan aksen taktis.
* **Pure Clean White (`#FFFFFF`):** Digunakan untuk kartu sorotan aktif (*spotlight/featured card*), kartu metrik, dan teks kontras di atas bidang merah.

### B. Geometri Asimetris & Sudut Taktis (*Chamfered & Asymmetric Cutouts*)
* **Chamfered Frames:** Kontainer section tidak berbentuk persegi biasa, melainkan memiliki potongan sudut diagonal (*diagonal corner notch*) di sudut kiri atas atau kanan bawah (`clip-path: polygon(...)` atau teknik CSS border-radius asimetris).
* **Floating Island Containers:** Section utama melayang di atas canvas off-white seperti modul taktis mandiri dengan sudut melengkung halus (*rounded 24px - 32px*) yang dikombinasikan dengan potongan tajam.
* **Elevated 3D Pop-Out Cards:** Pada bagian daftar koleksi/atlet, kartu yang sedang aktif atau disorot (*active spotlight*) berlatar putih bersih, membesar (*scale-105*), dan melayang keluar dari bidang (*drop-shadow-2xl*) memberikan ilusi kedalaman 3 dimensi yang dinamis.

### C. Tipografi Kuat (*Ultra-Bold Condensed Display*)
* **Display Headline:** Menggunakan tipografi condensed ultra-tebal berkarakter agresif dan modern (seperti *Bebas Neue / Anton / Tungsten / Druk*), dengan aksen teks bertumpuk (*stacked text*) dan efek bayangan lembut.
* **Micro-Data & Ornamen Budaya Futuristik:** Pada referensi terdapat teks kanji Jepang (*彼らの魂*). Untuk **ESPORT SUMBAR**, elemen ini diadaptasi menjadi **Aksen Tipografi Minangkabau Futuristik** (misalnya frasa filosofis *"Lahir Silek Mancari Kawan, Batin Silek Menjaga Kehormatan"* dalam font condensed halus, koordinat geolokasi GPS 19 wilayah, dan kode lisensi taktis).

---

## 2. Realignment Identitas & Posisi Brand
* **Bukan Portal Resmi PBESI Pengprov**, melainkan **Platform Digital Provider Esport Terdepan di Sumatera Barat** yang menjalin kemitraan resmi (*official partnership*) dengan **Pengprov ESI Sumatera Barat**.
* **Fungsi Utama:** Sentralisasi ekosistem independen yang menghubungkan seluruh pemangku kepentingan esports di Ranah Minang: talenta, organisasi, akademisi, dan sarana infrastruktur.

---

## 3. Rencana Transformasi Layout Berdasarkan Referensi

### A. Hero Section (Inspirasi Header Referensi "Demon Awaken")
1. **Latar Belakang:** Kontainer merah crimson bertingkat dengan sudut terpotong (*chamfered*), melayang di atas canvas abu-abu terang.
2. **Karakter Visual Utama:** Foto atlet unggulan Sumbar berformat cutout transparan yang dinamis dengan floating chips statistik (`Accuracy 78.4%`, `Pelatda PON`, `Rating 96`).
3. **Tombol Taktis:** Tombol *Pill* hitam elegan dan tombol putih kontras dengan transisi mikro interaktif.

### B. Section 2: "Sinergi & Profil Ekosistem" (Inspirasi Section Merah "About Us")
1. **Panel Merah Asimetris:** Blok merah crimson bertenaga dengan tipografi raksasa *"EKOSISTEM KAMI"* di sebelah kiri.
2. **Grid Kartu Informasi (4 Modul Putih):** Empat kartu putih bersih di sisi kanan dengan badge nomor (`01 Basis Data Real-Time`, `02 Penjaringan Player`, `03 Kemitraan ESI`, `04 Jangkauan 19 Wilayah`).

### C. Section 3: Direktori & Mesin Pencari (Inspirasi Carousel "Our Collection")
1. **Pilihan Kategori Taktis:** Tab filter bergaya kapsul (`[Semua]`, `[Atlet]`, `[Personal/LFT]`, `[Tim & Squad]`, `[Gaming Venue]`, `[Kampus/Sekolah]`, `[Penggiat]`).
2. **Kartu Decking 3D:**
   - Kartu standar berbalut warna merah gelap/crimson dengan foto dan spesifikasi talenta/venue.
   - **Kartu yang disorot/aktif:** Berubah menjadi warna **putih bersih (*Pure White*)**, terangkat ke depan dengan skala lebih besar dan aksen merah menyala, persis seperti kartu tengah pada gambar referensi.

### D. Tampilan Mobile Apps Style (Inspirasi Frame Mobile di Sisi Kanan Gambar)
1. **Top Bar Ramping:** Tombol menu drawer hamburger taktis dan logo merah di atas latar putih bersih blur.
2. **Hero Terpotong Rapi:** Gambar karakter/atlet tidak bertumpuk berantakan, melainkan terbingkai dalam kartu merah berkontur halus dengan tombol touch-friendly penuh.
3. **Bottom Navigation Bar:** Dock mengambang di bawah dengan 4 tab utama (*Home*, *Direktori*, *Peta*, *Daftar*).

---

## 4. Fitur Mesin Pencari 7 Pilar & Penjaringan Player Mandiri

### A. 7 Kategori Pencarian Real-Time
1. **Atlet (Berprestasi & Pelatda):** Atlet berlisensi, game, role, divisi, dan riwayat medali.
2. **Personal Player (Bakat Baru / LFT):** Pemain komunitas yang mencari tim atau sparring.
3. **Tim & Squad:** Roster aktif, jadwal tanding, dan status open recruitment.
4. **Venue & Gaming Hub:** Alamat iCafe, gaming house, spesifikasi hardware, dan fasilitas.
5. **Kampus:** UKM esports universitas (UNP, Unand, dll.) dan prestasi liga mahasiswa.
6. **Sekolah:** Ekskul dan komunitas pelajar SMA/SMK di 19 kabupaten/kota.
7. **Penggiat:** Caster, wasit lisensi, event organizer (EO), dan pelatih.

### B. Modal Pendaftaran Mandiri (*Talent Scouting Engine*)
* Pengunjung dapat mengklik tombol **"Daftarkan Diri / Tim / Venue"**.
* Membuka form modal bergaya taktis (*Valorant/Crimson Modal*) untuk input data instan.
* Setelah registrasi, sistem langsung menerbitkan **Digital Player HUD Card** bergaya kartu referensi yang bisa diunduh (*export image*) untuk portofolio player.

---

## 5. Rencana Tahapan Eksekusi Pengerjaan (Roadmap)

| Tahap | Lingkup Pekerjaan | Target Hasil |
| :---: | :--- | :--- |
| **Fase 1** | **Redefinisi Brand & Salinan Teks** | Mengganti seluruh narasi *"Portal PBESI Pengprov"* menjadi *"Platform Provider Esport Sumatera Barat - Official Partner ESI Sumbar"*. |
| **Fase 2** | **Implementasi Layout & Tema Asimetris Referensi** | Merombak background ke canvas off-white (`#E8ECEF`), kontainer merah crimson (`#C51A26`), sudut chamfered taktis, dan tipografi condensed tebal. |
| **Fase 3** | **Penyempurnaan Mesin Pencari 7 Pilar** | Menyediakan filter real-time dan kartu profil 3D elevated (putih aktif) untuk Atlet, Personal, Tim, Venue, Kampus, Sekolah, dan Penggiat. |
| **Fase 4** | **Fitur Pendaftaran Mandiri & Player Card** | Menyematkan modal registrasi interaktif dan generator kartu identitas esport digital. |
| **Fase 5** | **Optimasi Mobile, Build & Deploy Vercel** | Memastikan versi mobile dan desktop identik dengan presisi referensi, komit GitHub, dan redeploy live. |
