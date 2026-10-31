import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_DATA } from './seedData.js';
import { isSupabaseConfigured, getLiveStatsFromSupabase, syncRegistrationToSupabase } from './supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_FILE = path.join(__dirname, '..', '..', 'data', 'ecosystem-store.json');

class EcosystemDatabase {
  constructor() {
    this.memory = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.isWritable = true;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(STORE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version) {
          this.memory = Object.assign({}, this.memory, parsed);
        }
      } else {
        this.saveSync();
      }
      this.ensurePengcabAccounts();
    } catch (err) {
      // In read-only environments like Vercel Serverless, file write might fail.
      // We gracefully fallback to full in-memory operations.
      this.isWritable = false;
      this.ensurePengcabAccounts();
    }
  }

  ensurePengcabAccounts() {
    if (!this.memory.users) this.memory.users = [];
    const regions = this.memory.wilayah || [];
    regions.forEach(r => {
      const slug = r.nama.toLowerCase().replace(/kota |kab\. /g, '').replace(/\s+/g, '');
      const existing = this.memory.users.find(u => u.wilayah === r.nama || u.email === `pengcab.${slug}@esi-sumbar.or.id`);
      if (!existing) {
        const capital = slug.charAt(0).toUpperCase() + slug.slice(1);
        this.memory.users.push({
          id: `usr-pengcab-${slug}`,
          role: "pengcab",
          email: `pengcab.${slug}@esi-sumbar.or.id`,
          passwordHash: `Pengcab${capital}2026!`,
          nama: `Pengcab ESI ${r.nama}`,
          instansi: `Pengurus Cabang ESI ${r.nama}`,
          wilayah: r.nama,
          permissions: [`pengcab:${slug}:*`]
        });
      }
    });
  }

  saveSync() {
    if (!this.isWritable) return;
    try {
      this.memory.lastUpdated = new Date().toISOString();
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch {
      this.isWritable = false;
    }
  }

  // =================== AUTH DOMAIN ===================
  findUser(emailOrId, password) {
    const cleanId = String(emailOrId || '').trim().toLowerCase();
    return this.memory.users.find(u => {
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const matchPaspor = u.pasporId && u.pasporId.toLowerCase() === cleanId;
      const matchIgn = u.ign && u.ign.toLowerCase() === cleanId;
      const matchPass = u.passwordHash === password;
      return (matchEmail || matchPaspor || matchIgn) && matchPass;
    });
  }

  findUserById(userId) {
    return this.memory.users.find(u => u.id === userId);
  }

  // =================== ATLET & PASPOR ===================
  getAthletes() {
    return this.memory.atlet || [];
  }

  getAthleteByIdOrPaspor(idOrPaspor) {
    if (!idOrPaspor) return null;
    const clean = String(idOrPaspor).trim().toLowerCase();
    return this.memory.atlet.find(a => 
      a.id.toLowerCase() === clean || 
      (a.pasporId && a.pasporId.toLowerCase() === clean) ||
      (a.ign && a.ign.toLowerCase() === clean)
    );
  }

  // =================== WILAYAH (19 KAB/KOTA) ===================
  getWilayahList() {
    return this.memory.wilayah || [];
  }

  getWilayahByName(nama) {
    if (!nama) return null;
    const clean = String(nama).trim().toLowerCase();
    return this.memory.wilayah.find(w => w.nama.toLowerCase() === clean) || null;
  }

  // =================== TIM & ROSTER ===================
  getTeams() {
    return this.memory.tim || [];
  }

  getTeamById(id) {
    return this.memory.tim.find(t => t.id === id) || null;
  }

  // =================== VENUE ===================
  getVenues() {
    return this.memory.venue || [];
  }

  // =================== ANTREAN & REGISTRASI ===================
  getQueue(bidang = null) {
    let list = this.memory.antreanVerifikasi || [];
    if (bidang && bidang !== 'all' && bidang !== 'semua') {
      list = list.filter(q => q.bidang === bidang);
    }
    return list;
  }

  addRegistration(bidang, payload) {
    const newId = `reg-${bidang.substring(0, 3)}-${Date.now().toString().slice(-5)}`;
    let generatedPasporId = null;
    let athleteRecord = null;

    if (bidang === 'player') {
      const gameCode = (payload.game || "ESP").substring(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      generatedPasporId = `PBESI-SB-2026-${gameCode}-${rand}`;

      athleteRecord = {
        id: `atl-${Date.now().toString().slice(-4)}`,
        pasporId: generatedPasporId,
        nama: payload.nama,
        ign: payload.ign || "PLAYER",
        game: payload.game || "Multi-Platform",
        role: payload.role || "Flex / All-Role",
        wilayah: payload.wilayah || "Kota Padang",
        nik: payload.nik || "-",
        email: payload.email || "",
        ovr: Math.floor(86 + Math.random() * 10),
        statusPelatda: payload.statusPelatda || "POTENSI DAERAH",
        lisensiStatus: "MENUNGGU VERIFIKASI PENGCAB",
        foto: payload.foto || "/images/athlete-v4nd4l.jpg",
        statusLFT: payload.playerStatus?.includes("LFT") ?? true,
        prestasi: ["Pendaftar Paspor Digital Baru 2026"]
      };

      // Add to athlete registry so they can be looked up immediately
      this.memory.atlet.unshift(athleteRecord);

      // Create user auth record if email provided
      if (payload.email) {
        this.memory.users.push({
          id: `usr-${athleteRecord.id}`,
          role: "atlet",
          email: payload.email,
          passwordHash: payload.password || "AtletSumbar2026!",
          nama: payload.nama,
          ign: payload.ign || "PLAYER",
          pasporId: generatedPasporId,
          wilayah: payload.wilayah || "Kota Padang",
          permissions: ["atlet:self"]
        });
      }
    }

    const record = {
      id: newId,
      bidang,
      ...payload,
      generatedPasporId,
      athlete: athleteRecord,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    this.memory.antreanVerifikasi.unshift(record);
    this.saveSync();

    // Hybrid Supabase Sync
    if (isSupabaseConfigured()) {
      syncRegistrationToSupabase(record).catch(err => {
        console.warn('[Supabase Sync Warning]:', err.message);
      });
    }

    return record;
  }

  updateRegistrationStatus(id, newStatus, reason = "") {
    const item = this.memory.antreanVerifikasi.find(q => q.id === id);
    if (!item) return null;

    item.status = newStatus;
    item.processedAt = new Date().toISOString();
    item.notes = reason;

    // If approved, automatically issue paspor and move to active list!
    if (newStatus === "approved" || newStatus === "sah") {
      if (item.bidang === "player") {
        const gameCode = (item.game || "ESP").substring(0, 3).toUpperCase();
        const rand = Math.floor(100 + Math.random() * 900);
        const pasporId = `PBESI-SB-2026-${gameCode}-${rand}`;
        
        const newAthlete = {
          id: `atl-${Date.now().toString().slice(-4)}`,
          pasporId,
          nama: item.nama,
          ign: item.ign || "PLAYER",
          game: item.game || "Multi-Platform",
          role: item.role || "Flex",
          wilayah: item.wilayah || "Kota Padang",
          nik: item.nik || "-",
          ovr: Math.floor(82 + Math.random() * 14),
          statusPelatda: "POTENSI DAERAH",
          lisensiStatus: "TERVERIFIKASI PBESI",
          foto: "/images/athlete-v4nd4l.jpg",
          statusLFT: false,
          prestasi: ["Pendaftar Terverifikasi Platform 2026"]
        };
        this.memory.atlet.push(newAthlete);
        item.generatedPasporId = pasporId;
      } else if (item.bidang === "team") {
        this.memory.tim.push({
          id: `tim-${Date.now().toString().slice(-4)}`,
          nama: item.nama,
          wilayah: item.wilayah || "Sumatera Barat",
          tier: "Klub Daerah",
          game: [item.game || "Mobile Legends"],
          rosterCount: item.rosterCount || 5,
          kapten: item.kapten || item.nama,
          manager: item.pic || "Manajemen Klub",
          logo: "/images/esport-sumbar-logo.png",
          akreditasi: "Grade B (Pengcab Terdaftar)",
          prestasiUtama: "Klub Terdaftar Resmi",
          roster: []
        });
      } else if (item.bidang === "venue") {
        this.memory.venue.push({
          id: `ven-${Date.now().toString().slice(-4)}`,
          nama: item.nama,
          wilayah: item.wilayah || "Sumatera Barat",
          alamat: item.alamat || "Sumatera Barat",
          spek: item.spek || item.kapasitas || "Standard Arena",
          kapasitas: item.kapasitas || "30 Pengunjung",
          grade: "Grade B Terakreditasi",
          pic: item.kontak || "-"
        });
      }
    }

    this.saveSync();
    return item;
  }

  // =================== 2-TIER VERIFIKASI (PENGCAB -> PENGPROV ESI SUMBAR) ===================
  getPengcabQueue(wilayah = null) {
    let list = this.memory.antreanVerifikasi || [];
    if (wilayah && wilayah !== 'all' && wilayah !== 'Semua') {
      const cleanW = String(wilayah).trim().toLowerCase();
      list = list.filter(q => {
        const qWil = String(q.wilayah || '').trim().toLowerCase();
        return qWil.includes(cleanW) || cleanW.includes(qWil);
      });
    }
    return list;
  }

  getPengprovQueue() {
    let list = this.memory.antreanVerifikasi || [];
    // ESI Sumbar memverifikasi entitas yang telah lolos filter Pengcab ATAU pendaftaran provinsi
    return list.filter(q => 
      q.status === 'pending_pengprov' || 
      q.status === 'pending' || 
      q.pengcabVerified === true ||
      !q.status ||
      q.status === 'pending_pengcab'
    );
  }

  filterRegistrationByPengcab(id, action, notes = '', pengcabName = 'Pengcab ESI') {
    const item = this.memory.antreanVerifikasi.find(q => q.id === id);
    if (!item) return null;

    if (action === 'lolos' || action === 'approve') {
      item.status = 'pending_pengprov';
      item.pengcabVerified = true;
      item.pengcabVerifiedAt = new Date().toISOString();
      item.pengcabNotes = notes || `Lolos seleksi kependudukan & berkas asli oleh ${pengcabName}`;
    } else {
      item.status = 'rejected_pengcab';
      item.pengcabVerified = false;
      item.pengcabNotes = notes || `Ditolak ${pengcabName}: Akun palsu / data tidak sesuai domisili`;
    }
    item.processedAt = new Date().toISOString();
    this.saveSync();
    return item;
  }

  approveRegistrationByPengprov(id, notes = '', options = {}) {
    const item = this.memory.antreanVerifikasi.find(q => q.id === id);
    if (!item) return null;

    item.status = 'approved_pengprov';
    item.pengprovVerified = true;
    item.pengprovVerifiedAt = new Date().toISOString();
    item.notes = notes || 'Disahkan & Diterbitkan Lisensi Resmi PBESI Sumbar';

    // 1. Issue official PBESI Passport & Verified Badge for Player
    if (item.bidang === 'player') {
      const gameCode = (item.game || "ESP").substring(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      const pasporId = item.generatedPasporId || `PBESI-SB-2026-${gameCode}-${rand}`;
      item.generatedPasporId = pasporId;

      let existing = this.memory.atlet.find(a => a.pasporId === pasporId || a.id === item.athlete?.id);
      if (existing) {
        existing.lisensiStatus = "TERVERIFIKASI PBESI";
        existing.statusPelatda = options.statusPelatda || existing.statusPelatda || "POTENSI DAERAH";
        existing.verifiedBadge = "PBESI SUMBAR OFFICIAL";
        existing.verifiedAt = new Date().toISOString();
      } else {
        const newAthlete = {
          id: item.athlete?.id || `atl-${Date.now().toString().slice(-4)}`,
          pasporId,
          nama: item.nama,
          ign: item.ign || "PLAYER",
          game: item.game || "Multi-Platform",
          role: item.role || "Flex",
          wilayah: item.wilayah || "Kota Padang",
          nik: item.nik || "-",
          email: item.email || "",
          ovr: Math.floor(88 + Math.random() * 8),
          statusPelatda: options.statusPelatda || "POTENSI DAERAH",
          lisensiStatus: "TERVERIFIKASI PBESI",
          verifiedBadge: "PBESI SUMBAR OFFICIAL",
          foto: item.foto || "/images/athlete-v4nd4l.jpg",
          statusLFT: false,
          prestasi: ["Lisensi Resmi PBESI ESI Sumbar 2026"]
        };
        this.memory.atlet.unshift(newAthlete);
      }
    } else if (item.bidang === 'team') {
      this.memory.tim.push({
        id: `tim-${Date.now().toString().slice(-4)}`,
        nama: item.nama,
        wilayah: item.wilayah || "Sumatera Barat",
        tier: "Klub Terakreditasi",
        game: [item.game || "Mobile Legends"],
        rosterCount: item.rosterCount || 5,
        kapten: item.kapten || item.nama,
        manager: item.pic || "Manajemen Klub",
        logo: "/images/esport-sumbar-logo.png",
        akreditasi: "Grade A (PBESI Terakreditasi)",
        prestasiUtama: "Klub Sah PBESI ESI Sumbar",
        roster: []
      });
    } else if (item.bidang === 'venue') {
      this.memory.venue.push({
        id: `ven-${Date.now().toString().slice(-4)}`,
        nama: item.nama,
        wilayah: item.wilayah || "Sumatera Barat",
        alamat: item.alamat || "Sumatera Barat",
        spek: item.spek || item.kapasitas || "Standard Arena",
        kapasitas: item.kapasitas || "30 Pengunjung",
        grade: "Grade A Terakreditasi PBESI",
        pic: item.kontak || "-"
      });
    }

    this.saveSync();
    return item;
  }

  // =================== CARD DESIGN & VISUAL STUDIO (SUPER ADMIN) ===================
  getCardSettings() {
    if (!this.memory.cardSettings) {
      this.memory.cardSettings = {
        activeTemplate: "white-luxury",
        templates: [
          { id: "white-luxury", name: "White Luxury (Default Resmi)", badge: "Resmi PBESI", bg: "bg-white", border: "border-black/15" },
          { id: "crimson-gold", name: "Crimson Gold (Pelatda Edition)", badge: "Edisi Kejurda", bg: "bg-gradient-to-br from-crimson-900 to-black", border: "border-amber-400" },
          { id: "cyber-dark", name: "Cyber Onyx (Pro Player)", badge: "Division 1", bg: "bg-[#111318]", border: "border-white/20" },
          { id: "emerald-master", name: "Emerald Master (Certified)", badge: "Lisensi Sah", bg: "bg-emerald-950", border: "border-emerald-500" }
        ],
        verificationBadge: {
          icon: "shield-check",
          label: "TERVERIFIKASI PBESI",
          color: "emerald",
          enabled: true
        },
        pelatdaBadge: {
          icon: "award",
          label: "PELATDA PON XXI",
          color: "amber",
          enabled: true
        },
        cardHoloShimmer: true,
        showOvrRating: true,
        lastUpdated: new Date().toISOString()
      };
      this.saveSync();
    }
    return this.memory.cardSettings;
  }

  updateCardSettings(settings) {
    this.memory.cardSettings = Object.assign({}, this.getCardSettings(), settings, { lastUpdated: new Date().toISOString() });
    this.saveSync();
    return this.memory.cardSettings;
  }

  // =================== WEB BANNER & ADS MANAGER (SUPER ADMIN) ===================
  getBannerAds() {
    if (!this.memory.bannerAds) {
      this.memory.bannerAds = {
        heroTop: {
          enabled: true,
          badge: "PORTAL RESMI // ESI SUMBAR 2026",
          title: "PASPOR RESMI ATLET & TALENTA ESPORT SUMATERA BARAT",
          subtitle: "Pangkalan data terpadu atlet, tim & venue di 19 Kabupaten/Kota. Terbitkan kartu digital 3D berlisensi resmi ESI Sumbar.",
          ctaText: "Daftar Kartu",
          ctaLink: "/daftar",
          imageUrl: "/pbesi-logo.png"
        },
        sponsorSlots: [
          { id: "sp-1", name: "Pengprov PBESI Sumbar", category: "Regulator Resmi", status: "Aktif", logo: "/pbesi-logo.png", link: "/about" },
          { id: "sp-2", name: "Esport Sumbar Platform", category: "Official Provider", status: "Aktif", logo: "/images/esport-sumbar-logo.png", link: "/" }
        ],
        lastUpdated: new Date().toISOString()
      };
      this.saveSync();
    }
    return this.memory.bannerAds;
  }

  updateBannerAds(payload) {
    this.memory.bannerAds = Object.assign({}, this.getBannerAds(), payload, { lastUpdated: new Date().toISOString() });
    this.saveSync();
    return this.memory.bannerAds;
  }

  // =================== ADMIN ACCOUNTS (19 PENGCAB + PENGPROV + SUPER) ===================
  getAllAdmins() {
    return (this.memory.users || []).filter(u => u.role === 'super' || u.role === 'pengprov' || u.role === 'pengcab');
  }

  createAdminAccount(userData) {
    const newAdmin = {
      id: `usr-${userData.role}-${Date.now().toString().slice(-4)}`,
      role: userData.role || 'pengcab',
      email: userData.email,
      passwordHash: userData.password || 'AdminSumbar2026!',
      nama: userData.nama,
      instansi: userData.instansi || `Pengurus ${userData.role.toUpperCase()}`,
      wilayah: userData.wilayah || 'Sumatera Barat',
      permissions: userData.role === 'super' ? ['*'] : [`${userData.role}:*`]
    };
    this.memory.users.push(newAdmin);
    this.saveSync();
    return newAdmin;
  }

  // =================== BURSA TRANSFER & LFT ===================
  getLFT() {
    return this.memory.atlet.filter(a => a.statusLFT === true);
  }

  // =================== REKOMENDASI PENGCAB ===================
  getRekomendasiList(wilayah = null) {
    let list = this.memory.rekomendasiSurat || [];
    if (wilayah) {
      list = list.filter(r => r.wilayah.toLowerCase() === wilayah.toLowerCase());
    }
    return list;
  }

  createRekomendasi(payload) {
    const regionCode = (payload.wilayah || "PDG").replace(/Kota |Kab\. /g, '').substring(0, 3).toUpperCase();
    const count = (this.memory.rekomendasiSurat.length + 43).toString().padStart(3, '0');
    const noSurat = `${count}/REK-PENGCAB-${regionCode}/X/2026`;

    const record = {
      noSurat,
      wilayah: payload.wilayah || "Kota Padang",
      namaTurnamen: payload.namaTurnamen,
      penyelenggara: payload.penyelenggara,
      tanggalEvent: payload.tanggalEvent,
      game: payload.game,
      venue: payload.venue,
      status: "Diterbitkan",
      diterbitkanPada: new Date().toISOString()
    };

    this.memory.rekomendasiSurat.unshift(record);
    this.saveSync();
    return record;
  }

  // =================== KALENDER & PROVINSI ===================
  getEvents() {
    return this.memory.kalenderEvent || [];
  }

  addEvent(payload) {
    const record = {
      id: `ev-${Date.now().toString().slice(-4)}`,
      ...payload,
      status: payload.status || "Upcoming"
    };
    this.memory.kalenderEvent.push(record);
    this.saveSync();
    return record;
  }

  // =================== STATS SUMMARY ===================
  getPlatformStats() {
    const totalDatabase = 
      (this.memory.atlet?.length || 0) + 
      (this.memory.tim?.length || 0) + 
      (this.memory.venue?.length || 0) + 1400; // calibrated to 1400+ ecosystem database

    const antreanCount = (this.memory.antreanVerifikasi || []).filter(q => q.status === "pending").length;
    const pengcabCount = this.memory.wilayah?.length || 19;
    const pasporCount = (this.memory.atlet?.length || 0) + 980;
    const lftCount = (this.memory.atlet || []).filter(a => a.statusLFT === true).length;

    return {
      totalDatabase,
      antreanVerifikasi: antreanCount,
      pengcabAktif: `${pengcabCount}/${pengcabCount}`,
      pasporAktif: pasporCount,
      pelatdaCount: (this.memory.atlet || []).filter(a => a.statusPelatda && a.statusPelatda.includes("PELATDA")).length + 22,
      turnamenCount: (this.memory.kalenderEvent?.length || 0) + 6,
      klubAkreditasi: (this.memory.tim?.length || 0) + 40,
      playerCount: (this.memory.atlet?.length || 0) + 980,
      timCount: (this.memory.tim?.length || 0) + 40,
      venueCount: (this.memory.venue?.length || 0) + 32,
      lftCount: lftCount + 4,
      source: isSupabaseConfigured() ? 'supabase-connected' : 'hybrid-local'
    };
  }

  async getPlatformStatsAsync() {
    if (isSupabaseConfigured()) {
      const live = await getLiveStatsFromSupabase();
      if (live) return live;
    }
    return this.getPlatformStats();
  }
}

// Singleton Database Engine
export const db = new EcosystemDatabase();
