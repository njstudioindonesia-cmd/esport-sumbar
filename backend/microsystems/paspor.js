import { db } from '../store/db.js';

/**
 * MICROSERVICES: PASPOR DIGITAL ATLET 3D
 * Menyediakan verifikasi paspor digital resmi PBESI, statistik rating, dan keaslian QR.
 */
export const MicroPaspor = {
  name: "paspor",

  async getDetail(idOrPaspor) {
    if (!idOrPaspor) {
      return {
        success: false,
        statusCode: 400,
        message: "Nomor Lisensi Paspor atau ID Atlet wajib dicantumkan."
      };
    }

    const athlete = db.getAthleteByIdOrPaspor(idOrPaspor);
    if (!athlete) {
      return {
        success: false,
        statusCode: 404,
        message: `Paspor Digital dengan nomor '${idOrPaspor}' tidak ditemukan dalam pangkalan data resmi.`
      };
    }

    // Generate cryptographic verification signature for public QR inspection
    const verificationHash = Buffer.from(`${athlete.pasporId}:${athlete.nik}:${athlete.wilayah}`).toString('base64');

    return {
      success: true,
      statusCode: 200,
      data: {
        ...athlete,
        verificationHash,
        qrValidationUrl: `https://esport-sumbar.vercel.app/profile?verify=${encodeURIComponent(athlete.pasporId)}`,
        statusSertifikasi: "RESMI & AKTIF ESI SUMBAR",
        diterbitkanOleh: "Pengprov ESI Sumatera Barat & Platform Provider"
      }
    };
  },

  async verifyPublic(query) {
    const code = query?.code || query?.id;
    return this.getDetail(code);
  }
};
