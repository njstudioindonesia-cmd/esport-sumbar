import { db } from '../store/db.js';

/**
 * MICROSERVICES: PENGPROV ESI SUMATERA BARAT (REGULATOR TINGKAT I)
 * Mengelola koordinasi 19 Pengcab, kontingen Pelatda PON, kalender Kejurda, dan akreditasi Tier 1.
 */
export const MicroPengprov = {
  name: "pengprov",

  // Ringkasan 19 Pengcab Kabupaten/Kota
  async getPengcabSummary() {
    const districts = db.getWilayahList();
    const stats = db.getPlatformStats();

    return {
      success: true,
      statusCode: 200,
      pengprovSK: "018/PBESI/SK-SUMBAR/2024",
      totalKabKota: districts.length,
      statusSK: "100% Aktif",
      stats: {
        pelatdaCount: stats.pelatdaCount,
        turnamenProvinsi: stats.turnamenCount,
        klubAkreditasi: stats.klubAkreditasi
      },
      data: districts
    };
  },

  // Atlet Pelatda PON XXI & Seleknas
  async getPelatdaRoster() {
    const allAthletes = db.getAthletes();
    const pelatda = allAthletes.filter(a => a.statusPelatda && a.statusPelatda.includes("PELATDA"));

    return {
      success: true,
      statusCode: 200,
      caborCount: 4, // Valorant, MLBB, PUBG Mobile, Free Fire
      totalAtlet: pelatda.length,
      data: pelatda
    };
  },

  // Antrean Pengesahan Lisensi Resmi (Tahap 2: ESI Sumbar Legalitas)
  async getVerificationQueue() {
    const queue = db.getPengprovQueue();
    return {
      success: true,
      statusCode: 200,
      regulator: "Pengprov ESI Sumatera Barat",
      totalAntrean: queue.length,
      data: queue
    };
  },

  // Sahkan & Terbitkan Lisensi Resmi PBESI (Terhubung ke Kartu & Web Utama)
  async approveLicense(body) {
    const { id, notes, statusPelatda } = body || {};
    if (!id) {
      return {
        success: false,
        statusCode: 400,
        message: "ID pendaftar wajib disertakan."
      };
    }

    const updated = db.approveRegistrationByPengprov(id, notes || 'Disahkan oleh Sekretariat Pengprov ESI Sumbar', {
      statusPelatda: statusPelatda || null
    });

    if (!updated) {
      return {
        success: false,
        statusCode: 404,
        message: `Pendaftar dengan ID ${id} tidak ditemukan.`
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: `Lisensi Resmi PBESI berhasil diterbitkan untuk ${updated.nama}! Nomor Paspor: ${updated.generatedPasporId || 'PBESI-SB-2026'}. Badge resmi telah aktif di web publik.`,
      data: updated
    };
  },

  // Seluruh Pangkalan Data Provinsi (19 Wilayah)
  async getMasterDatabase() {
    return {
      success: true,
      statusCode: 200,
      totalWilayah: db.getWilayahList().length,
      totalAtlet: db.getAthletes().length,
      totalTim: db.getTeams().length,
      totalVenue: db.getVenues().length,
      wilayah: db.getWilayahList(),
      atlet: db.getAthletes(),
      tim: db.getTeams(),
      venue: db.getVenues()
    };
  },

  // Kalender Kejurda & Porprov
  async getEvents() {
    const events = db.getEvents();
    return {
      success: true,
      statusCode: 200,
      total: events.length,
      data: events
    };
  },

  // Tambah agenda Kejurda
  async createEvent(body) {
    if (!body || !body.judul) {
      return {
        success: false,
        statusCode: 400,
        message: "Judul kejuaraan/event provinsi wajib diisi."
      };
    }
    const record = db.addEvent(body);
    return {
      success: true,
      statusCode: 201,
      message: "Jadwal Kejurda resmi berhasil diterbitkan ke kalender pengprov.",
      data: record
    };
  }
};
