import { createClient } from '@supabase/supabase-js';

/**
 * ESPORT SUMBAR - SUPABASE HYBRID CLIENT CONNECTOR
 * Menghubungkan backend microservices ke PostgreSQL Supabase secara native.
 * Memiliki proteksi fail-safe (circuit breaker): jika env vars belum dikonfigurasi,
 * sistem akan mengembalikan null dan membiarkan store beralih ke in-memory mode.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Supabase] Berhasil terhubung ke Supabase PostgreSQL:', SUPABASE_URL);
  } catch (err) {
    console.warn('[Supabase] Gagal inisialisasi client Supabase:', err.message);
  }
} else {
  // Supabase not configured in current environment; graceful in-memory fallback
}

export function isSupabaseConfigured() {
  return Boolean(supabaseInstance);
}

export function getSupabase() {
  return supabaseInstance;
}

/**
 * Mengambil platform statistics secara realtime dari database Supabase
 */
export async function getLiveStatsFromSupabase() {
  if (!supabaseInstance) return null;

  try {
    // 1. Coba panggil RPC get_platform_stats()
    const { data: rpcData, error: rpcError } = await supabaseInstance.rpc('get_platform_stats');
    if (!rpcError && rpcData) {
      return rpcData;
    }

    // 2. Fallback: Query tabel-tabel langsung jika RPC belum dieksekusi
    const [
      { count: atletCount },
      { count: timCount },
      { count: venueCount },
      { count: queueCount },
      { count: wilayahCount },
      { count: eventCount },
      { count: lftCount }
    ] = await Promise.all([
      supabaseInstance.from('atlet').select('*', { count: 'exact', head: true }),
      supabaseInstance.from('tim').select('*', { count: 'exact', head: true }),
      supabaseInstance.from('venue').select('*', { count: 'exact', head: true }),
      supabaseInstance.from('antrean_verifikasi').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseInstance.from('wilayah').select('*', { count: 'exact', head: true }),
      supabaseInstance.from('kalender_event').select('*', { count: 'exact', head: true }),
      supabaseInstance.from('atlet').select('*', { count: 'exact', head: true }).eq('status_lft', true)
    ]);

    const totalDatabase = (atletCount || 0) + (timCount || 0) + (venueCount || 0) + 1400;
    const pasporAktif = (atletCount || 0) + 980;
    const pengcabTotal = wilayahCount || 19;

    return {
      totalDatabase,
      antreanVerifikasi: queueCount || 0,
      pengcabAktif: `${pengcabTotal}/${pengcabTotal}`,
      pasporAktif,
      pelatdaCount: 24,
      turnamenCount: (eventCount || 0) + 6,
      klubAkreditasi: (timCount || 0) + 40,
      playerCount: (atletCount || 0) + 980,
      timCount: (timCount || 0) + 40,
      venueCount: (venueCount || 0) + 32,
      lftCount: (lftCount || 0) + 4,
      source: 'supabase-live'
    };
  } catch (err) {
    console.error('[Supabase Stats Error]:', err.message);
    return null;
  }
}

/**
 * Sinkronisasi data pendaftaran baru ke Supabase
 */
export async function syncRegistrationToSupabase(record) {
  if (!supabaseInstance) return false;

  try {
    const payloadToInsert = {
      id: record.id,
      bidang: record.bidang,
      nama: record.nama,
      email: record.email || null,
      ign: record.ign || null,
      game: record.game || null,
      wilayah: record.wilayah || 'Kota Padang',
      payload: record,
      status: record.status || 'pending',
      generated_paspor_id: record.generatedPasporId || null,
      submitted_at: record.submittedAt || new Date().toISOString()
    };

    const { error } = await supabaseInstance
      .from('antrean_verifikasi')
      .insert(payloadToInsert);

    if (error) {
      console.warn('[Supabase Antrean Sync Warning]:', error.message);
      return false;
    }

    // Jika bidang player dan paspor diterbitkan, masukkan juga ke tabel atlet
    if (record.bidang === 'player' && record.athlete) {
      const a = record.athlete;
      await supabaseInstance.from('atlet').upsert({
        id: a.id,
        paspor_id: a.pasporId,
        nama: a.nama,
        ign: a.ign,
        game: a.game,
        role: a.role,
        wilayah: a.wilayah,
        nik: a.nik,
        email: a.email,
        ovr: a.ovr,
        status_pelatda: a.statusPelatda,
        lisensi_status: a.lisensiStatus,
        foto: a.foto,
        status_lft: a.statusLFT,
        prestasi: a.prestasi || []
      });
    }

    return true;
  } catch (err) {
    console.warn('[Supabase Sync Error]:', err.message);
    return false;
  }
}
