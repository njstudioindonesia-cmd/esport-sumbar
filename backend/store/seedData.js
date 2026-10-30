/**
 * SEED DATA EKOSISTEM ESPORT SUMATERA BARAT
 * Pangkalan data awal resmi: 19 Kabupaten/Kota, Atlet, Tim, Venue, Antrean, dan Lisensi
 */

export const INITIAL_DATA = {
  version: "2.4.0",
  lastUpdated: new Date().toISOString(),

  // Akun Resmi Pengurus & Admin untuk Autentikasi
  users: [
    {
      id: "usr-super",
      role: "super",
      email: "admin@esportsumbar.id",
      passwordHash: "SumbarSuper2026!",
      nama: "Super Admin Platform",
      instansi: "Platform Provider Esport Sumbar",
      permissions: ["*"]
    },
    {
      id: "usr-pengprov",
      role: "pengprov",
      email: "pengprov@esi-sumbar.or.id",
      passwordHash: "PengprovESI2026!",
      nama: "Sekretariat Pengprov ESI Sumbar",
      instansi: "Pengurus Provinsi ESI Sumatera Barat",
      permissions: ["pengprov:*", "read:pengcab", "approve:pelatda"]
    },
    {
      id: "usr-pengcab-pdg",
      role: "pengcab",
      email: "pengcab.padang@esi-sumbar.or.id",
      passwordHash: "PengcabPadang2026!",
      nama: "Pengcab ESI Kota Padang",
      instansi: "Pengurus Cabang ESI Kota Padang",
      wilayah: "Kota Padang",
      permissions: ["pengcab:padang:*"]
    },
    {
      id: "usr-atlet-v4nd4l",
      role: "atlet",
      email: "rayden@v4nd4l.id",
      passwordHash: "RaydenV4nd4l2026",
      nama: "Muhammad Rayden",
      ign: "V4ND4L",
      pasporId: "PBESI-SB-2026-VAL-96",
      permissions: ["atlet:self"]
    }
  ],

  // 19 Kabupaten / Kota Sumatera Barat
  wilayah: [
    { nama: "Kota Padang", sk: "SK-01/ESI-SB/2024", ketua: "Drs. Hendri Septa, B.Bus", sekretariat: "GOR H. Agus Salim, Padang", atlet: 186, tim: 24, venue: 6, porprov: 18, status: "Aktif" },
    { nama: "Kota Bukittinggi", sk: "SK-02/ESI-SB/2024", ketua: "H. Erman Safar, SH", sekretariat: "Jam Gadang Sport Hub, Bukittinggi", atlet: 142, tim: 16, venue: 4, porprov: 14, status: "Aktif" },
    { nama: "Kota Payakumbuh", sk: "SK-03/ESI-SB/2024", ketua: "Drs. H. Riza Falepi, ST, MT", sekretariat: "GOR M. Yamin, Payakumbuh", atlet: 118, tim: 12, venue: 3, porprov: 12, status: "Aktif" },
    { nama: "Kota Solok", sk: "SK-04/ESI-SB/2024", ketua: "H. Zul Elfian Umar, SH, M.Si", sekretariat: "Lapangan Merdeka, Solok", atlet: 84, tim: 9, venue: 2, porprov: 9, status: "Aktif" },
    { nama: "Kota Sawahlunto", sk: "SK-05/ESI-SB/2024", ketua: "Deri Asta, SH", sekretariat: "Ombilin Heritage Hall, Sawahlunto", atlet: 62, tim: 7, venue: 2, porprov: 7, status: "Aktif" },
    { nama: "Kota Padang Panjang", sk: "SK-06/ESI-SB/2024", ketua: "Fadly Amran, B.B.A", sekretariat: "GOR Chatib Sulaiman, Padang Panjang", atlet: 76, tim: 8, venue: 2, porprov: 8, status: "Aktif" },
    { nama: "Kota Pariaman", sk: "SK-07/ESI-SB/2024", ketua: "Prof. Dr. Genius Umar, M.Si", sekretariat: "Pantai Gandoriah Youth Center", atlet: 94, tim: 10, venue: 3, porprov: 10, status: "Aktif" },
    { nama: "Kab. Agam", sk: "SK-08/ESI-SB/2024", ketua: "Dr. H. Andri Warman, MM", sekretariat: "Lubuk Basung Sport Arena", atlet: 135, tim: 15, venue: 4, porprov: 14, status: "Aktif" },
    { nama: "Kab. Tanah Datar", sk: "SK-09/ESI-SB/2024", ketua: "Eka Putra, SE, MM", sekretariat: "Pagaruyung Youth Center", atlet: 112, tim: 13, venue: 3, porprov: 12, status: "Aktif" },
    { nama: "Kab. Lima Puluh Kota", sk: "SK-10/ESI-SB/2024", ketua: "Safaruddin Dt. Bandaro Rajo", sekretariat: "Kompleks Kantor Bupati, Sarilamak", atlet: 108, tim: 12, venue: 3, porprov: 11, status: "Aktif" },
    { nama: "Kab. Padang Pariaman", sk: "SK-11/ESI-SB/2024", ketua: "Suhatri Bur, SE, MM", sekretariat: "IKK Parit Malintang", atlet: 124, tim: 14, venue: 3, porprov: 13, status: "Aktif" },
    { nama: "Kab. Pesisir Selatan", sk: "SK-12/ESI-SB/2024", ketua: "Drs. Rusma Yul Anwar, M.Pd", sekretariat: "GOR Ilyas Yakoub, Painan", atlet: 130, tim: 14, venue: 3, porprov: 13, status: "Aktif" },
    { nama: "Kab. Solok", sk: "SK-13/ESI-SB/2024", ketua: "Capt. H. Epyardi Asda, M.Mar", sekretariat: "Kompleks Arosuka, Solok", atlet: 98, tim: 10, venue: 2, porprov: 10, status: "Aktif" },
    { nama: "Kab. Solok Selatan", sk: "SK-14/ESI-SB/2024", ketua: "H. Khairunas, S.IP, M.Si", sekretariat: "Padang Aro Youth Center", atlet: 68, tim: 7, venue: 2, porprov: 7, status: "Aktif" },
    { nama: "Kab. Sijunjung", sk: "SK-15/ESI-SB/2024", ketua: "Benny Dwifa Yuswir, S.STP, M.Si", sekretariat: "Muaro Sijunjung Sport Hub", atlet: 74, tim: 8, venue: 2, porprov: 8, status: "Aktif" },
    { nama: "Kab. Dharmasraya", sk: "SK-16/ESI-SB/2024", ketua: "Sutan Riska Tuanku Kerajaan, SE", sekretariat: "Sport Center Koto Padang", atlet: 88, tim: 9, venue: 2, porprov: 9, status: "Aktif" },
    { nama: "Kab. Pasaman", sk: "SK-17/ESI-SB/2024", ketua: "H. Benny Utama, SH, MM", sekretariat: "GOR Tuanku Rao, Lubuk Sikaping", atlet: 72, tim: 8, venue: 2, porprov: 8, status: "Aktif" },
    { nama: "Kab. Pasaman Barat", sk: "SK-18/ESI-SB/2024", ketua: "H. Hamsuardi, S.Ag", sekretariat: "Simpang Empat Esports Center", atlet: 96, tim: 11, venue: 3, porprov: 10, status: "Aktif" },
    { nama: "Kab. Kepulauan Mentawai", sk: "SK-19/ESI-SB/2024", ketua: "Fernando Jongguran Simanjuntak", sekretariat: "Tuapejat Hub, Sipora Mentawai", atlet: 48, tim: 5, venue: 1, porprov: 6, status: "Aktif" }
  ],

  // Atlet Terverifikasi dengan Paspor Digital 3D
  atlet: [
    {
      id: "atl-01",
      pasporId: "PBESI-SB-2026-VAL-96",
      nama: "Muhammad Rayden",
      ign: "V4ND4L",
      game: "Valorant",
      role: "Duelist / Entry Fragger",
      wilayah: "Kota Padang",
      nik: "137104********21",
      ovr: 96,
      rank: "Radiant #42 APAC",
      statusPelatda: "PELATDA PON XXI",
      lisensiStatus: "TERVERIFIKASI PBESI",
      foto: "/images/athlete-v4nd4l.jpg",
      timSaatIni: "Minang Pride Esports",
      statusLFT: false,
      prestasi: ["Medali Emas Porprov Sumbar 2024", "Juara 1 Kejurda ESI Sumbar 2025", "Top 4 VCT Challengers ID"]
    },
    {
      id: "atl-02",
      pasporId: "PBESI-SB-2026-VAL-94",
      nama: "Fadhil Pratama",
      ign: "FLASH",
      game: "Valorant",
      role: "Initiator / Sova Specialist",
      wilayah: "Kota Bukittinggi",
      nik: "137501********11",
      ovr: 94,
      rank: "Immortal 3",
      statusPelatda: "PELATDA PON XXI",
      lisensiStatus: "TERVERIFIKASI PBESI",
      foto: "/images/athlete-pro-player.jpg",
      timSaatIni: "Singgalang Rangers",
      statusLFT: false,
      prestasi: ["Medali Perak Porprov Sumbar 2024", "MVP Piala Walikota Bukittinggi"]
    },
    {
      id: "atl-03",
      pasporId: "PBESI-SB-2026-MLB-95",
      nama: "Aditya Ramadhan",
      ign: "SKYL1NE",
      game: "Mobile Legends",
      role: "Jungler / Assassin",
      wilayah: "Kota Padang",
      nik: "137102********09",
      ovr: 95,
      rank: "Mythical Immortal 140+",
      statusPelatda: "PELATDA PON XXI",
      lisensiStatus: "TERVERIFIKASI PBESI",
      foto: "/images/athlete-v4nd4l.jpg",
      timSaatIni: null,
      statusLFT: true,
      salaryExpectation: "Rp 3.500.000 - Rp 6.000.000",
      prestasi: ["Juara 1 Piala Gubernur Sumbar 2025", "Top Global 24 Ling"]
    },
    {
      id: "atl-04",
      pasporId: "PBESI-SB-2026-PUB-92",
      nama: "Rizky Ramadhan",
      ign: "SHADOW",
      game: "PUBG Mobile",
      role: "Scout / Rusher",
      wilayah: "Kota Payakumbuh",
      nik: "137603********55",
      ovr: 92,
      rank: "Conqueror Season 24",
      statusPelatda: "SELEKNAS TIER 2",
      lisensiStatus: "TERVERIFIKASI PBESI",
      foto: "/images/athlete-pro-player.jpg",
      timSaatIni: null,
      statusLFT: true,
      salaryExpectation: "Rp 3.000.000 - Rp 5.000.000",
      prestasi: ["Juara 2 PMNC Regional Sumatera 2025"]
    }
  ],

  // Klub Terakreditasi
  tim: [
    {
      id: "tim-1",
      nama: "Minang Pride Esports",
      wilayah: "Kota Padang",
      tier: "Pelatda Tier 1",
      game: ["Valorant", "Mobile Legends"],
      rosterCount: 6,
      kapten: "Muhammad Rayden (V4ND4L)",
      manager: "Doni Prasetya, SE",
      logo: "/images/esport-sumbar-logo.png",
      akreditasi: "Grade A (Pengprov ESI)",
      prestasiUtama: "Medali Emas Porprov Sumbar & Juara Kejurda 2025",
      roster: [
        { ign: "V4ND4L", nama: "Muhammad Rayden", role: "Duelist / IGL", ovr: 96 },
        { ign: "F4LCON", nama: "Fajri Alamsyah", role: "Initiator", ovr: 92 },
        { ign: "RECON", nama: "Iqbal Maulana", role: "Controller", ovr: 90 },
        { ign: "ARES", nama: "Deni Saputra", role: "Sentinel", ovr: 89 },
        { ign: "VIPER", nama: "Taufik Rahman", role: "Flex Smoker", ovr: 88 },
        { ign: "NIGHT", nama: "Aldi Gunawan", role: "Sub-Flex", ovr: 86 }
      ]
    },
    {
      id: "tim-2",
      nama: "Singgalang Rangers",
      wilayah: "Kota Bukittinggi",
      tier: "Divisi Utama",
      game: ["Mobile Legends", "PUBG Mobile"],
      rosterCount: 5,
      kapten: "Ilham 'Ranger1' Saputra",
      manager: "Rahmat Hidayat",
      logo: "/images/esport-sumbar-logo.png",
      akreditasi: "Grade A (Pengprov ESI)",
      prestasiUtama: "Juara 2 Piala Walikota Bukittinggi 2025",
      roster: [
        { ign: "RANGER1", nama: "Ilham Saputra", role: "Jungler / IGL", ovr: 91 },
        { ign: "TITAN", nama: "Wahyu Hidayat", role: "EXP Laner", ovr: 89 },
        { ign: "CHRONOS", nama: "Farhan Anugrah", role: "Roamer", ovr: 91 },
        { ign: "SNIPE", nama: "Kevin Pratama", role: "Goldlaner", ovr: 90 },
        { ign: "MAGE", nama: "Fahri Kurniawan", role: "Midlaner", ovr: 89 }
      ]
    }
  ],

  // Venue & Gaming Arena Terakreditasi
  venue: [
    {
      id: "ven-1",
      nama: "Minang Cyber Lounge Padang",
      wilayah: "Kota Padang",
      alamat: "Jl. Khatib Sulaiman No. 42, Padang Barat",
      spek: "30 PC Rig RTX 4070 • 240Hz Monitor • FO 500 Mbps",
      kapasitas: "80 Pengunjung / 6 Stage Tournament",
      grade: "Grade A Standar Kompetisi",
      pic: "Hendra Wijaya (0812-6677-8899)"
    },
    {
      id: "ven-2",
      nama: "Nexus Esports Arena Ulak Karang",
      wilayah: "Kota Padang",
      alamat: "Jl. Ulak Karang Selatan, Padang Utara",
      spek: "40 PC Rig RTX 3060 • 165Hz Monitor • Mobile Arena Hub",
      kapasitas: "100 Pengunjung",
      grade: "Grade A Standar Kompetisi",
      pic: "Budi Santoso (0813-7788-9900)"
    },
    {
      id: "ven-3",
      nama: "Jam Gadang Gaming Space",
      wilayah: "Kota Bukittinggi",
      alamat: "Jl. Ahmad Yani No. 15, Bukittinggi",
      spek: "25 PC Rig RTX 3070 • 180Hz Monitor",
      kapasitas: "60 Pengunjung",
      grade: "Grade B Hub Komunitas",
      pic: "Ahmad Fauzi (0821-5566-7788)"
    }
  ],

  // Antrean Verifikasi Pendaftaran Masuk (Pending Queue untuk Super Admin)
  antreanVerifikasi: [
    {
      id: "reg-val-101",
      bidang: "player",
      nama: "Muhammad Rayhan",
      ign: "SKYFALL",
      game: "Valorant",
      role: "Duelist",
      wilayah: "Kota Padang",
      nik: "137105********19",
      kontak: "0812-7711-2233",
      email: "rayhan.skyfall@gmail.com",
      status: "pending",
      submittedAt: "2026-10-30T10:15:00Z",
      dokumenKtp: "KTP_Padang_Terlampir.jpg",
      buktiRank: "Immortal_2_Screenshot.png"
    },
    {
      id: "reg-coa-102",
      bidang: "pelatih",
      nama: "Aldo Wijaya, S.Kom",
      ign: "COACH_ALDO",
      game: "Mobile Legends",
      role: "Head Coach & Taktikal",
      wilayah: "Kota Bukittinggi",
      nik: "137502********44",
      kontak: "0813-8822-3344",
      email: "aldo.coach@gmail.com",
      status: "pending",
      submittedAt: "2026-10-30T11:20:00Z",
      sertifikasi: "Lisensi Kepelatihan PBESI Tingkat B",
      pengalaman: "3 Tahun Pelatih Divisi MDL"
    },
    {
      id: "reg-tea-103",
      bidang: "team",
      nama: "Ranah Cyber Academy",
      kategori: "Klub Talenta Muda",
      game: "Free Fire & Valorant",
      wilayah: "Kota Payakumbuh",
      rosterCount: 5,
      kontak: "0822-3344-5566",
      email: "official@ranahcyber.id",
      status: "pending",
      submittedAt: "2026-10-30T13:45:00Z",
      legalitas: "Akta Notaris & SK Komunitas"
    },
    {
      id: "reg-com-104",
      bidang: "komunitas",
      nama: "Komunitas MLBB Agam Raya",
      kategori: "Fanbase & Event Organizer",
      game: "Mobile Legends",
      wilayah: "Kab. Agam",
      anggotaCount: 350,
      kontak: "0852-6677-8811",
      email: "mlbb.agam@gmail.com",
      status: "pending",
      submittedAt: "2026-10-30T14:10:00Z"
    },
    {
      id: "reg-ven-105",
      bidang: "venue",
      nama: "Sentral Game Center Payakumbuh",
      kategori: "Gaming Lounge & Cafe",
      wilayah: "Kota Payakumbuh",
      kapasitas: "20 Rig PC",
      kontak: "0811-9988-7766",
      email: "sentral.pyk@gmail.com",
      status: "pending",
      submittedAt: "2026-10-30T15:30:00Z"
    }
  ],

  // Surat Rekomendasi Resmi Pengcab
  rekomendasiSurat: [
    {
      noSurat: "042/REK-PENGCAB-PDG/X/2026",
      wilayah: "Kota Padang",
      namaTurnamen: "Padang Youth Esports Cup 2026",
      penyelenggara: "KNPI Kota Padang",
      tanggalEvent: "12 - 14 November 2026",
      game: "Valorant & MLBB",
      venue: "Minang Cyber Lounge Padang",
      status: "Diterbitkan",
      diterbitkanPada: "2026-10-28T09:00:00Z"
    },
    {
      noSurat: "041/REK-PENGCAB-PDG/X/2026",
      wilayah: "Kota Padang",
      namaTurnamen: "Khatib Sulaiman Valorant League",
      penyelenggara: "Minang Cyber Lounge",
      tanggalEvent: "20 - 22 Oktober 2026",
      game: "Valorant",
      venue: "Minang Cyber Lounge Padang",
      status: "Selesai",
      diterbitkanPada: "2026-10-15T08:00:00Z"
    }
  ],

  // Kalender Turnamen Resmi Tingkat Pengprov
  kalenderEvent: [
    {
      id: "ev-01",
      judul: "Kejurda ESI Sumbar 2026",
      kategori: "Kejuaraan Daerah Resmi ESI",
      tingkat: "Provinsi (19 Kab/Kota)",
      tanggal: "15 - 20 Desember 2026",
      lokasi: "Auditorium Universitas Negeri Padang",
      cabor: ["Valorant", "Mobile Legends", "PUBG Mobile", "Free Fire", "E-Football"],
      totalHadiah: "Rp 150.000.000",
      status: "Open Registration"
    },
    {
      id: "ev-02",
      judul: "Piala Gubernur Sumatera Barat Esports Cup",
      kategori: "Piala Bergilir Tingkat I",
      tingkat: "Provinsi",
      tanggal: "10 - 14 Januari 2027",
      lokasi: "GOR H. Agus Salim, Padang",
      cabor: ["Mobile Legends", "Valorant"],
      totalHadiah: "Rp 100.000.000",
      status: "Upcoming"
    }
  ]
};
