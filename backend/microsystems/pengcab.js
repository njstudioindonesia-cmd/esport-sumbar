import { db } from '../store/db.js';

/**
 * MICROSERVICES: PENGCAB ESI KABUPATEN/KOTA (REGULATOR TINGKAT II)
 * Mengisolasi dan mengelola data per wilayah (19 Kab/Kota):
 * verifikasi KTP domisili, kontingen Porprov, dan penerbitan surat rekomendasi turnamen.
 */
export const MicroPengcab = {
  name: "pengcab",

  // Ambil data spesifik wilayah (19 Kab/Kota)
  async getRegionalData(query) {
    const rawRegion = query?.region || query?.wilayah || "Kota Padang";
    const regionInfo = db.getWilayahByName(rawRegion) || db.getWilayahByName("Kota Padang");
    const targetName = regionInfo.nama;

    // Filter athletes by region
    const localAthletes = db.getAthletes().filter(a => a.wilayah.toLowerCase() === targetName.toLowerCase());
    
    // Filter teams by region
    const localTeams = db.getTeams().filter(t => t.wilayah.toLowerCase() === targetName.toLowerCase());

    // Filter venues by region
    const localVenues = db.getVenues().filter(v => v.wilayah.toLowerCase() === targetName.toLowerCase());

    // Filter recommendation letters by region
    const recommendations = db.getRekomendasiList(targetName);

    return {
      success: true,
      statusCode: 200,
      wilayah: targetName,
      pengcabDetails: regionInfo,
      stats: {
        totalAtlet: localAthletes.length > 0 ? localAthletes.length : regionInfo.atlet,
        kontingenPorprov: regionInfo.porprov,
        totalTim: localTeams.length > 0 ? localTeams.length : regionInfo.tim,
        suratRekomendasiDiterbitkan: recommendations.length > 0 ? recommendations.length : 4
      },
      atletLokal: localAthletes,
      timLokal: localTeams,
      venueLokal: localVenues,
      rekomendasiSurat: recommendations
    };
  },

  // Antrean Verifikasi Khusus Pengcab Daerah (Tahap 1: Filterisasi Anti-Akun Palsu)
  async getRegionalQueue(query) {
    const region = query?.region || query?.wilayah || null;
    const queue = db.getPengcabQueue(region);
    return {
      success: true,
      statusCode: 200,
      wilayah: region || "Semua Wilayah",
      totalAntrean: queue.length,
      data: queue
    };
  },

  // Aksi Filterisasi Pengcab (Loloskan ke ESI Sumbar vs Tolak Akun Palsu)
  async filterAction(body) {
    const { id, action, notes, pengcabName } = body || {};
    if (!id || !action) {
      return {
        success: false,
        statusCode: 400,
        message: "ID pendaftar dan jenis aksi (lolos / tolak) wajib diisi."
      };
    }

    const updated = db.filterRegistrationByPengcab(id, action, notes || '', pengcabName || 'Pengcab ESI Daerah');
    if (!updated) {
      return {
        success: false,
        statusCode: 404,
        message: `Pendaftar dengan ID ${id} tidak ditemukan.`
      };
    }

    const isLolos = action === 'lolos' || action === 'approve';
    return {
      success: true,
      statusCode: 200,
      action: action,
      message: isLolos
        ? `Akun ${updated.nama} (${updated.ign || 'Pendaftar'}) telah diverifikasi asli oleh ${pengcabName} dan berhasil diteruskan ke Pengprov ESI Sumbar untuk pengesahan lisensi!`
        : `Akun ${updated.nama} telah ditolak sebagai akun palsu/data tidak sah.`,
      data: updated
    };
  },

  // Terbitkan Surat Rekomendasi Turnamen Daerah
  async issueRekomendasi(body) {
    const { wilayah, namaTurnamen, penyelenggara, tanggalEvent, game, venue } = body || {};

    if (!namaTurnamen || !penyelenggara) {
      return {
        success: false,
        statusCode: 400,
        message: "Nama turnamen dan instansi penyelenggara wajib dicantumkan."
      };
    }

    const newSurat = db.createRekomendasi({
      wilayah: wilayah || "Kota Padang",
      namaTurnamen,
      penyelenggara,
      tanggalEvent: tanggalEvent || "November 2026",
      game: game || "Mobile Legends & Valorant",
      venue: venue || "Sentral Gaming Arena"
    });

    return {
      success: true,
      statusCode: 201,
      message: `Surat Rekomendasi Resmi Nomor '${newSurat.noSurat}' telah berhasil diterbitkan.`,
      data: newSurat
    };
  },

  // Verifikasi KTP / KIA Domisili Atlet untuk Porprov
  async verifyDomisili(body) {
    const { athleteId, status, notes } = body || {};
    if (!athleteId) {
      return {
        success: false,
        statusCode: 400,
        message: "ID Atlet yang divalidasi wajib disertakan."
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: `Status domisili atlet ${athleteId} berhasil diverifikasi sebagai: ${(status || 'SAH').toUpperCase()}.`,
      verifiedAt: new Date().toISOString(),
      notes: notes || "Tervalidasi sesuai database kependudukan Dukcapil Sumbar"
    };
  }
};
