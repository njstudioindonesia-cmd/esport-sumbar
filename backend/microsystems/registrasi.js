import { db } from '../store/db.js';

/**
 * MICROSERVICES: REGISTRASI & MODERASI 5 BIDANG
 * Mengelola pendaftaran resmi (Player, Pelatih, Team, Komunitas, Venue)
 * dan antrean verifikasi untuk Super Admin.
 */
export const MicroRegistrasi = {
  name: "registrasi",

  // POST: Daftarkan entitas baru di salah satu dari 5 bidang
  async submit(bidang, payload) {
    const validBidang = ['player', 'pelatih', 'team', 'komunitas', 'venue'];
    const cleanBidang = String(bidang || '').toLowerCase();

    if (!validBidang.includes(cleanBidang)) {
      return {
        success: false,
        statusCode: 400,
        message: `Bidang pendaftaran tidak valid: ${bidang}. Pilihan: player, pelatih, team, komunitas, venue.`
      };
    }

    if (!payload || !payload.nama) {
      return {
        success: false,
        statusCode: 400,
        message: "Data nama lengkap atau nama entitas wajib diisi."
      };
    }

    const newRecord = db.addRegistration(cleanBidang, payload);

    return {
      success: true,
      statusCode: 201,
      message: `Pendaftaran bidang ${cleanBidang.toUpperCase()} berhasil dikirimkan dan masuk ke antrean verifikasi resmi.`,
      data: newRecord
    };
  },

  // GET: Ambil daftar antrean pendaftaran
  async getQueue(query) {
    const bidang = query?.bidang || 'all';
    const queue = db.getQueue(bidang);
    return {
      success: true,
      statusCode: 200,
      total: queue.length,
      bidangFilter: bidang,
      data: queue
    };
  },

  // PUT: Moderasi pendaftaran (Setujui / Tolak oleh Super Admin)
  async updateStatus(id, body) {
    if (!id) {
      return {
        success: false,
        statusCode: 400,
        message: "ID pendaftaran wajib disertakan."
      };
    }

    const { status, notes } = body || {};
    if (!status) {
      return {
        success: false,
        statusCode: 400,
        message: "Status baru wajib diisi (approved / rejected)."
      };
    }

    const updated = db.updateRegistrationStatus(id, status, notes || "");
    if (!updated) {
      return {
        success: false,
        statusCode: 404,
        message: `Pendaftaran dengan ID ${id} tidak ditemukan.`
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: `Pendaftaran ${id} telah berhasil diubah menjadi status: ${status.toUpperCase()}.`,
      data: updated
    };
  }
};
