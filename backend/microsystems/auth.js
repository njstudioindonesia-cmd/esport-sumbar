import { db } from '../store/db.js';

/**
 * MICROSERVICES: AUTHENTICATION & SINGLE SIGN-ON (SSO)
 * Mengatur hak akses terisolasi untuk masing-masing bidang di ekosistem ESPORT SUMBAR:
 * - Atlet (Player)
 * - Tim (Klub / Organisasi)
 * - Venue (Gaming Arena / Game Center)
 * - Pelatih (Coach / Trainer)
 * - Pengcab 19 Kab/Kota
 * - Pengprov ESI Sumbar
 * - Super Admin
 */
export const MicroAuth = {
  name: "auth",

  async login(body) {
    const { role, identifier, password, region, portal } = body || {};

    if (!identifier || !password) {
      return {
        success: false,
        statusCode: 400,
        message: "Email/ID dan kata sandi wajib diisi."
      };
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const targetPortal = portal || role || 'public';

    // ==========================================================
    // 1. ISOLASI PORTAL: SUPER ADMIN (/admin-super)
    // ==========================================================
    if (targetPortal === 'super' || cleanId.includes('super') || cleanId === 'admin@esportsumbar.id') {
      const isValidPassword = password === 'SuperAdminSumbar2026!' || 
                              password === 'admin123' || 
                              password === 'SumbarSuper2026!';

      if (isValidPassword) {
        const token = `esi-super-${Date.now().toString(36)}`;
        return {
          success: true,
          statusCode: 200,
          message: "Autentikasi Super Administrator Sah.",
          token,
          user: {
            id: "usr-super",
            role: "super",
            nama: "Super Admin Platform",
            email: "admin@esportsumbar.id",
            permissions: ["*"]
          },
          redirectUrl: "/admin-super"
        };
      }
    }

    // ==========================================================
    // 2. ISOLASI PORTAL: PENGPROV ESI SUMBAR (/admin-pengprov)
    // ==========================================================
    if (targetPortal === 'pengprov' || cleanId.includes('pengprov') || cleanId.includes('sekretariat')) {
      const isValidPassword = password === 'PengprovSumbar2026!' || 
                              password === 'pengprov123' || 
                              password === 'PengprovESI2026!';

      if (isValidPassword) {
        const token = `esi-pengprov-${Date.now().toString(36)}`;
        return {
          success: true,
          statusCode: 200,
          message: "Autentikasi Otoritas Pengprov ESI Sumbar Sah.",
          token,
          user: {
            id: "usr-pengprov",
            role: "pengprov",
            nama: "Sekretariat Pengprov ESI Sumbar",
            email: "pengprov@esi-sumbar.or.id",
            instansi: "Pengurus Provinsi PBESI Sumatera Barat",
            permissions: ["pengprov:*", "license:approve", "roster:manage"]
          },
          redirectUrl: "/admin-pengprov"
        };
      }
    }

    // ==========================================================
    // 3. ISOLASI PORTAL: PENGCAB 19 KAB/KOTA (/admin-pengcab)
    // ==========================================================
    if (targetPortal === 'pengcab' || cleanId.includes('pengcab')) {
      const targetRegion = region || "Kota Padang";
      const cleanSlug = targetRegion.toLowerCase().replace(/kota |kab\. /g, '').replace(/\s+/g, '');
      const capital = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
      
      const isValidPassword = password === `Pengcab${capital}2026!` || 
                              password === 'pengcab123' || 
                              password === 'pbesi123' ||
                              password === 'PengcabPadang2026!';

      if (isValidPassword) {
        const token = `esi-pengcab-${Date.now().toString(36)}`;
        return {
          success: true,
          statusCode: 200,
          message: `Autentikasi Pengcab ESI ${targetRegion} Berhasil.`,
          token,
          user: {
            id: `usr-pengcab-${cleanSlug}`,
            role: "pengcab",
            nama: `Pengcab ESI ${targetRegion}`,
            wilayah: targetRegion,
            email: identifier,
            permissions: [`pengcab:${cleanSlug}:*`, "filter:verify"]
          },
          redirectUrl: `/admin-pengcab?region=${encodeURIComponent(targetRegion)}`
        };
      }
    }

    // ==========================================================
    // 4. PORTAL PUBLIK: ROLE TIM (KLUB / ORGANISASI)
    // ==========================================================
    if (cleanId.includes('tim') || cleanId.includes('minangpride') || cleanId.includes('pride') || cleanId === 'tim@esportsumbar.id') {
      if (password === 'tim123' || password === 'pride123' || password === 'password123') {
        const token = `esi-tim-${Date.now().toString(36)}`;
        return {
          success: true,
          statusCode: 200,
          message: "Autentikasi Akun Tim Resmi Berhasil.",
          token,
          user: {
            id: "tim-1",
            role: "tim",
            nama: "Minang Pride Esports",
            manager: "Doni Prasetya, SE",
            email: "official@minangpride.com",
            wilayah: "Kota Padang",
            game: "Mobile Legends & Valorant",
            akreditasi: "Grade A (Pengprov ESI)",
            logo: "/images/esport-sumbar-logo.png",
            prestasiUtama: "Medali Emas Porprov Sumbar & Juara Kejurda 2025",
            isVerified: true
          },
          redirectUrl: "/profile"
        };
      }
    }

    // ==========================================================
    // 5. PORTAL PUBLIK: ROLE VENUE (GAMING ARENA)
    // ==========================================================
    if (cleanId.includes('venue') || cleanId.includes('cyber') || cleanId.includes('arena') || cleanId === 'venue@esportsumbar.id') {
      if (password === 'venue123' || password === 'cyber123' || password === 'password123') {
        const token = `esi-venue-${Date.now().toString(36)}`;
        return {
          success: true,
          statusCode: 200,
          message: "Autentikasi Akun Venue Resmi Berhasil.",
          token,
          user: {
            id: "ven-1",
            role: "venue",
            nama: "Minang Cyber Lounge Padang",
            pic: "Hendra Wijaya",
            kontak: "0812-6677-8899",
            email: "info@minangcyber.id",
            wilayah: "Kota Padang",
            alamat: "Jl. Khatib Sulaiman No. 42, Padang Barat",
            spek: "30 PC Rig RTX 4070 • 240Hz Monitor • FO 500 Mbps",
            grade: "Grade A Standar Kompetisi Resmi",
            isOpenForBooking: true,
            isVerified: true
          },
          redirectUrl: "/profile"
        };
      }
    }

    // ==========================================================
    // 6. PORTAL PUBLIK: ROLE PELATIH (COACH / TRAINER)
    // ==========================================================
    if (cleanId.includes('pelatih') || cleanId.includes('coach') || cleanId.includes('arief') || cleanId === 'pelatih@esportsumbar.id') {
      if (password === 'pelatih123' || password === 'coach123' || password === 'password123') {
        const token = `esi-pelatih-${Date.now().toString(36)}`;
        return {
          success: true,
          statusCode: 200,
          message: "Autentikasi Akun Pelatih Resmi Berhasil.",
          token,
          user: {
            id: "coa-1",
            role: "pelatih",
            nama: "Coach Arief 'Sensei' Rahman, S.Or",
            email: "coach.arief@esportsumbar.id",
            wilayah: "Kota Padang",
            game: "Mobile Legends & Valorant",
            lisensi: "Lisensi Kepelatihan Daerah (Grade A)",
            noLisensi: "ESSB-COACH-2026-008",
            foto: "/images/athlete-coach.jpg",
            isOpenForCoaching: true,
            isVerified: true
          },
          redirectUrl: "/profile"
        };
      }
    }

    // ==========================================================
    // 7. PORTAL PUBLIK: ROLE ATLET (DEFAULT)
    // ==========================================================
    const user = db.findUser(identifier, password);
    if (user && user.role === 'atlet') {
      const token = `esi-token-${user.id}-${Date.now().toString(36)}`;
      const athleteData = user.pasporId ? db.getAthleteByIdOrPaspor(user.pasporId) : null;
      return {
        success: true,
        statusCode: 200,
        message: "Autentikasi Paspor Digital Atlet Berhasil.",
        token,
        user: {
          id: user.id,
          nama: user.nama,
          role: "atlet",
          email: user.email,
          ign: user.ign || athleteData?.ign || null,
          wilayah: user.wilayah || athleteData?.wilayah || null,
          pasporId: user.pasporId || null,
          game: athleteData?.game || "VALORANT",
          roleTitle: athleteData?.role || "Duelist",
          ovr: athleteData?.ovr || 96,
          lisensiStatus: athleteData?.lisensiStatus || "TERVERIFIKASI RESMI",
          statusPelatda: athleteData?.statusPelatda || "POTENSI DAERAH",
          foto: athleteData?.foto || "/images/athlete-v4nd4l.jpg",
          isVerified: true
        },
        redirectUrl: "/profile"
      };
    }

    // Demo fallback untuk Atlet V4ND4L
    if (cleanId.startsWith("pbesi") || cleanId.startsWith("essb") || cleanId.includes("rayden") || cleanId.includes("v4nd4l") || cleanId === 'atlet@esportsumbar.id' || cleanId === 'player@esportsumbar.id') {
      if (password === 'atlet123' || password === 'rayden123' || password === 'player123' || password === 'password123') {
        return {
          success: true,
          statusCode: 200,
          message: "Paspor Digital Atlet ditemukan.",
          token: `esi-atlet-${Date.now().toString(36)}`,
          user: {
            id: "atl-01",
            role: "atlet",
            nama: "Muhammad Rayden",
            ign: "V4ND4L",
            pasporId: "ESSB-2026-VAL-96",
            game: "VALORANT",
            roleTitle: "Duelist / Entry Fragger",
            wilayah: "Kota Padang",
            ovr: 96,
            statusPelatda: "PELATDA PON • OVR 96",
            lisensiStatus: "TERVERIFIKASI RESMI",
            isVerified: true,
            foto: "/images/athlete-v4nd4l.jpg"
          },
          redirectUrl: "/profile"
        };
      }
    }

    return {
      success: false,
      statusCode: 401,
      message: "Nomor Lisensi Paspor / Email atau kata sandi tidak cocok. Pastikan Anda telah terdaftar di ekosistem Esport Sumbar."
    };
  },

  async forgotPassword(body) {
    const { identifier } = body || {};
    if (!identifier) {
      return {
        success: false,
        statusCode: 400,
        message: "Nomor Paspor atau Email wajib dicantumkan."
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: `Tautan pemulihan dan instruksi verifikasi telah dikirimkan ke kontak terdaftar (${identifier}).`
    };
  }
};
