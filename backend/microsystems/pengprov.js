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
