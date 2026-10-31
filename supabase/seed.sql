-- ==============================================================================
-- ESPORT SUMBAR - OFFICIAL SEED DATA (POSTGRESQL FOR SUPABASE)
-- Mengisi data dasar 19 Pengcab ESI Kab/Kota, Atlet Bintang, Tim, & Venue
-- ==============================================================================

-- 1. SEED 19 WILAYAH KABUPATEN / KOTA SUMATERA BARAT
INSERT INTO public.wilayah (id, kode, nama, tipe, ketua_pengcab, alamat_sekretariat, no_sk, masa_bakti, status_pengcab, atlet_count, klub_count, arena_count)
VALUES
('wil-padang', 'PDG', 'Kota Padang', 'Kota', 'Drs. Hendri Septa, B.Bus', 'GOR H. Agus Salim, Padang', 'SK-01/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 186, 24, 6),
('wil-bukittinggi', 'BKT', 'Kota Bukittinggi', 'Kota', 'H. Erman Safar, SH', 'Jam Gadang Sport Hub, Bukittinggi', 'SK-02/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 142, 16, 4),
('wil-payakumbuh', 'PYK', 'Kota Payakumbuh', 'Kota', 'Drs. H. Riza Falepi, ST, MT', 'GOR M. Yamin, Payakumbuh', 'SK-03/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 118, 12, 3),
('wil-solok-kota', 'SLK', 'Kota Solok', 'Kota', 'H. Zul Elfian Umar, SH, M.Si', 'Lapangan Merdeka, Solok', 'SK-04/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 84, 9, 2),
('wil-sawahlunto', 'SWL', 'Kota Sawahlunto', 'Kota', 'Deri Asta, SH', 'Ombilin Heritage Hall, Sawahlunto', 'SK-05/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 62, 7, 2),
('wil-padangpanjang', 'PPJ', 'Kota Padang Panjang', 'Kota', 'Fadly Amran, B.B.A', 'GOR Chatib Sulaiman, Padang Panjang', 'SK-06/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 76, 8, 2),
('wil-pariaman-kota', 'PRM', 'Kota Pariaman', 'Kota', 'Prof. Dr. Genius Umar, M.Si', 'Pantai Gandoriah Youth Center', 'SK-07/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 94, 10, 3),
('wil-agam', 'AGM', 'Kab. Agam', 'Kabupaten', 'Dr. H. Andri Warman, MM', 'Lubuk Basung Sport Arena', 'SK-08/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 112, 11, 3),
('wil-limapuluhkota', 'LPK', 'Kab. Lima Puluh Kota', 'Kabupaten', 'Safaruddin Dt. Bandaro Rajo', 'Kompleks Kantor Bupati Sarilamak', 'SK-09/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 88, 9, 2),
('wil-tanahdatar', 'TND', 'Kab. Tanah Datar', 'Kabupaten', 'Eka Putra, SE, MM', 'Batusangkar Youth Arena', 'SK-10/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 92, 10, 2),
('wil-padangpariaman', 'PDP', 'Kab. Padang Pariaman', 'Kabupaten', 'Suhatri Bur, SE, MM', 'Parit Malintang Central Hall', 'SK-11/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 104, 11, 3),
('wil-pesisirselatan', 'PSS', 'Kab. Pesisir Selatan', 'Kabupaten', 'Drs. Rusma Yul Anwar, M.Pd', 'Painan Sport Center', 'SK-12/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 96, 8, 2),
('wil-solok-kab', 'KSL', 'Kab. Solok', 'Kabupaten', 'Capt. H. Epyardi Asda, M.Mar', 'Arosuka Sport Hall', 'SK-13/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 78, 7, 2),
('wil-solokselatan', 'SLS', 'Kab. Solok Selatan', 'Kabupaten', 'H. Khairunas, S.IP, M.Si', 'Padang Aro Community Center', 'SK-14/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 54, 5, 1),
('wil-pasaman', 'PSM', 'Kab. Pasaman', 'Kabupaten', 'H. Benny Utama, SH, MM', 'Lubuk Sikaping Arena', 'SK-15/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 68, 6, 2),
('wil-pasamanbarat', 'PSB', 'Kab. Pasaman Barat', 'Kabupaten', 'H. Hamsuardi, S.Ag', 'Simpang Empat Youth Hub', 'SK-16/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 82, 7, 2),
('wil-sijunjung', 'SJJ', 'Kab. Sijunjung', 'Kabupaten', 'Benny Dwifa Yuswir, S.STP, M.Si', 'Muaro Sijunjung Esports Base', 'SK-17/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 58, 5, 1),
('wil-dharmasraya', 'DHR', 'Kab. Dharmasraya', 'Kabupaten', 'Sutan Riska Tuanku Kerajaan, SE', 'Pulau Punjung Sport Hall', 'SK-18/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 64, 6, 2),
('wil-mentawai', 'MTW', 'Kab. Kepulauan Mentawai', 'Kabupaten', 'Martinus Dahlan, S.Sos, MM', 'Tuapejat Cyber Center', 'SK-19/ESI-SB/2024', '2024 - 2028', 'Aktif & Berlisensi', 42, 4, 1)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  ketua_pengcab = EXCLUDED.ketua_pengcab,
  alamat_sekretariat = EXCLUDED.alamat_sekretariat,
  atlet_count = EXCLUDED.atlet_count,
  klub_count = EXCLUDED.klub_count,
  arena_count = EXCLUDED.arena_count;

-- 2. SEED ATLET BINTANG DENGAN PASPOR DIGITAL
INSERT INTO public.atlet (id, paspor_id, nama, ign, game, role, wilayah, nik, email, ovr, status_pelatda, lisensi_status, foto, status_lft, prestasi)
VALUES
('atl-1', 'PBESI-SB-2026-VAL-882', 'Fikri "V4ND4L" Pratama', 'V4ND4L', 'Valorant', 'Duelist / Entry', 'Kota Padang', '1371012304990001', 'rayden@v4nd4l.id', 94, 'PELATDA PON 2026', 'TERVERIFIKASI PBESI', '/images/athlete-v4nd4l.jpg', false, '["Gold Medalist Kejurda Valorant 2025", "Top 3 VCT Challengers ID Qualifier", "Pelatda PON XXI Sumbar"]'::jsonb),
('atl-2', 'PBESI-SB-2026-VAL-699', 'Ahmad Fauzi Rasyid', 'NIGHTHAWK', 'Valorant', 'Initiator / Recon', 'Kota Bukittinggi', '1375021208010003', 'nighthawk@esportsumbar.id', 91, 'POTENSI DAERAH', 'TERVERIFIKASI PBESI', '/images/athlete-v4nd4l.jpg', true, '["Juara 1 Piala Jam Gadang 2025", "MVP Bukittinggi Esports Open"]'::jsonb),
('atl-3', 'PBESI-SB-2026-MOB-871', 'Rifki Pratama Yudha', 'SHADOWFOX', 'Mobile Legends', 'Jungler / Assassin', 'Kota Payakumbuh', '1376031505020002', 'rifki@shadowfox.id', 89, 'PELATDA PON 2026', 'TERVERIFIKASI PBESI', '/images/athlete-v4nd4l.jpg', false, '["Juara 1 Piala Gubernur Sumbar MLBB 2025", "First Team MPL Academy Scouting"]'::jsonb),
('atl-4', 'PBESI-SB-2026-PUB-554', 'Deni Setiawan', 'GHOSTSHOT', 'PUBG Mobile', 'Sniper / Scout', 'Kota Pariaman', '1377042001000004', 'deni@ghostshot.id', 88, 'POTENSI DAERAH', 'TERVERIFIKASI PBESI', '/images/athlete-v4nd4l.jpg', true, '["Top Terminator PMNC West Sumatra", "Runner-up Pariaman Open"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  ign = EXCLUDED.ign,
  ovr = EXCLUDED.ovr,
  status_pelatda = EXCLUDED.status_pelatda,
  status_lft = EXCLUDED.status_lft;

-- 3. SEED TIM / KLUB TERDAFTAR
INSERT INTO public.tim (id, nama, wilayah, tier, game, roster_count, kapten, manager, logo, akreditasi, prestasi_utama, roster)
VALUES
('tim-1', 'Minang Pride Esports', 'Kota Padang', 'Divisi Utama', '["Valorant", "Mobile Legends"]'::jsonb, 10, 'Fikri "V4ND4L" Pratama', 'Irfan Hakim, S.Kom', '/images/esport-sumbar-logo.png', 'Grade A (PBESI Terakreditasi)', 'Juara Umum Kejurda Esports Sumbar 2025', '["V4ND4L", "K4L1BR3", "CYPH3R", "BL1TZ", "PHANT0M"]'::jsonb),
('tim-2', 'Ranah Cyber Club', 'Kota Bukittinggi', 'Divisi 1', '["Mobile Legends", "PUBG Mobile"]'::jsonb, 8, 'Riko Fernando', 'Budi Santoso', '/images/esport-sumbar-logo.png', 'Grade A (PBESI Terakreditasi)', 'Juara 1 Jam Gadang Championship 2025', '["SHADOWFOX", "BL4D3", "M1N4NG", "ZEUS", "AQU4"]'::jsonb),
('tim-3', 'Singa Singgalang Team', 'Kab. Agam', 'Divisi 1', '["PUBG Mobile", "Free Fire"]'::jsonb, 6, 'Deni Setiawan', 'Rahmad Hidayat', '/images/esport-sumbar-logo.png', 'Grade B (Pengcab Terdaftar)', 'Top 4 Piala Walikota Padang', '["GHOSTSHOT", "VIP3R", "STORM", "HUNTER"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  akreditasi = EXCLUDED.akreditasi,
  prestasi_utama = EXCLUDED.prestasi_utama;

-- 4. SEED VENUE & ARENA TERAKREDITASI
INSERT INTO public.venue (id, nama, wilayah, alamat, spek, kapasitas, grade, pic, kontak)
VALUES
('ven-1', 'Padang Gaming Arena & Esports Hub', 'Kota Padang', 'Jl. Khatib Sulaiman No. 45, Padang', '40 PC High-End RTX 4070, Gigabit Fiber 1Gbps Dedicated', '80 Kursi + Panggung Turnamen', 'Grade A Terakreditasi', 'Rian Kurniawan', '081266778899'),
('ven-2', 'Jam Gadang Cyber Lounge', 'Kota Bukittinggi', 'Jl. Panorama No. 12, Bukittinggi', '25 PC Gaming, Mobile Esports Bootcamp Lounge', '50 Pengunjung', 'Grade A Terakreditasi', 'Eko Saputra', '081399887766'),
('ven-3', 'Payakumbuh Esports Basecamp', 'Kota Payakumbuh', 'Jl. Sudirman No. 88, Payakumbuh', '20 PC Gaming + Wifi 6 Gaming Grade', '40 Pengunjung', 'Grade B Terakreditasi', 'Ilham Wahyudi', '082155443322')
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  alamat = EXCLUDED.alamat,
  spek = EXCLUDED.spek;

-- 5. SEED KALENDER EVENT
INSERT INTO public.kalender_event (id, nama, tanggal, lokasi, game, kategori, status)
VALUES
('ev-1', 'Piala Gubernur Esports Sumatera Barat 2026', '15-18 Mei 2026', 'Auditorium UNP Padang', 'MLBB, Valorant, PUBG Mobile', 'Kejuaraan Provinsi', 'Pendaftaran Dibuka'),
('ev-2', 'Kualifikasi Pra-PON XXI Cabor Esports', '22-25 Juni 2026', 'Padang Gaming Arena', 'Valorant, MLBB, Free Fire', 'Seleksi Resmi PBESI', 'Upcoming'),
('ev-3', 'Bukittinggi Esports Open Youth Championship', '10-12 Juli 2026', 'Jam Gadang Cyber Lounge', 'Mobile Legends', 'Turnamen Terbuka', 'Upcoming')
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  tanggal = EXCLUDED.tanggal,
  status = EXCLUDED.status;

-- 6. SEED AKUN ADMIN & PROFILES
INSERT INTO public.profiles (role, email, password_hash, nama, ign, paspor_id, wilayah, permissions)
VALUES
('superadmin', 'admin@esportsumbar.id', 'SumbarSuper2026!', 'Super Admin Platform', 'ADMIN-SUMBAR', NULL, 'Sumatera Barat', '["*"]'::jsonb),
('pengprov', 'pengprov@esi-sumbar.or.id', 'PengprovESI2026!', 'Sekretariat Pengprov ESI Sumbar', 'PENGPROV-SB', NULL, 'Sumatera Barat', '["pengprov:*", "read:pengcab", "approve:pelatda"]'::jsonb),
('pengcab', 'pengcab.padang@esi-sumbar.or.id', 'PengcabPadang2026!', 'Pengcab ESI Kota Padang', 'PENGCAB-PDG', NULL, 'Kota Padang', '["pengcab:padang:*"]'::jsonb),
('atlet', 'rayden@v4nd4l.id', 'RaydenV4nd4l2026', 'Muhammad Rayden', 'V4ND4L', 'PBESI-SB-2026-VAL-882', 'Kota Padang', '["atlet:self"]'::jsonb)
ON CONFLICT (email) DO NOTHING;
