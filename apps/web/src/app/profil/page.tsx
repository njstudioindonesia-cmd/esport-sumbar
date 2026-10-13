'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, apiRequest, saveSession, UserSession } from '@/lib/api';
import {
  User,
  Shield,
  MapPin,
  Gamepad2,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  FileText,
  Phone,
  Building,
  Sparkles,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const SUMBAR_CITIES = [
  'Padang',
  'Bukittinggi',
  'Payakumbuh',
  'Solok',
  'Sawahlunto',
  'Padang Panjang',
  'Pariaman',
  'Agam',
  'Dharmasraya',
  'Kepulauan Mentawai',
  'Lima Puluh Kota',
  'Padang Pariaman',
  'Pasaman',
  'Pasaman Barat',
  'Pesisir Selatan',
  'Sijunjung',
  'Solok Selatan',
  'Tanah Datar',
];

export default function ProfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [nickname, setNickname] = useState('');
  const [city, setCity] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // EO Application State
  const [eoStatus, setEoStatus] = useState<any>(null);
  const [orgName, setOrgName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [eoSubmitting, setEoSubmitting] = useState(false);
  const [eoMessage, setEoMessage] = useState<string | null>(null);
  const [eoError, setEoError] = useState<string | null>(null);

  // AI Personalization State
  const [aiRecs, setAiRecs] = useState<any>(null);

  useEffect(() => {
    const { user, token } = getSession();
    if (!token || !user) {
      router.push('/masuk');
      return;
    }
    setSession(user);
    setNickname(user.nickname);
    setCity(user.city || 'Padang');

    // Fetch fresh profile & organizer status from Gateway
    Promise.all([
      apiRequest<any>('/users/me'),
      apiRequest<any>('/organizer/status'),
      apiRequest<any>(`/ai/recommendations?city=${user.city || 'Padang'}`),
    ]).then(([profileRes, eoRes, aiRes]) => {
      if (profileRes.success && profileRes.data) {
        setSession(profileRes.data);
        setNickname(profileRes.data.nickname);
        setCity(profileRes.data.city || 'Padang');
      }
      if (eoRes.success && eoRes.data) {
        setEoStatus(eoRes.data);
      }
      if (aiRes.success && aiRes.data) {
        setAiRecs(aiRes.data);
      }
      setLoading(false);
    });
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    const res = await apiRequest<any>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ nickname, city }),
    });

    setProfileSaving(false);

    if (res.success && res.data) {
      setSession(res.data);
      const { token } = getSession();
      if (token) saveSession(res.data, { accessToken: token, refreshToken: '' });
      setProfileMessage('Profil berhasil diperbarui!');
    } else {
      setProfileMessage(res.error || 'Gagal memperbarui profil');
    }
  };

  const handleApplyOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEoSubmitting(true);
    setEoMessage(null);
    setEoError(null);

    const res = await apiRequest<any>('/organizer/apply', {
      method: 'POST',
      body: JSON.stringify({
        orgName,
        contactPhone,
        docs: [docUrl || 'https://esport-sumbar.id/docs/placeholder-id.pdf'],
      }),
    });

    setEoSubmitting(false);

    if (res.success && res.data) {
      setEoStatus(res.data);
      setEoMessage('Pengajuan verifikasi EO berhasil dikirim! Menunggu tinjauan Admin.');
    } else {
      setEoError(res.error || 'Gagal mengirim pengajuan EO');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-sm text-accent-text400">Memuat profil...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
      {/* Top Banner Profile Header */}
      <div className="bg-dark-800 border border-line rounded-lg p-6 mb-8 chamfer-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-dark-700 border border-line flex items-center justify-center rounded-lg text-white font-display text-2xl font-bold chamfer-badge">
              {session.nickname.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-extrabold text-white uppercase">
                  {session.nickname}
                </h1>
                <span className="text-xs uppercase font-display font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {session.role}
                </span>
              </div>
              <p className="text-accent-text400 text-xs mt-0.5">{session.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3 text-xs text-accent-text400 bg-dark-900/60 border border-line px-3 py-2 rounded">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>{session.city || 'Sumatera Barat'}</span>
            </div>
            {(session.role === 'ORGANIZER' || session.role === 'ADMIN') && (
              <a
                href="http://localhost:3001"
                className="chamfer-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 flex items-center gap-1.5 transition-colors"
              >
                Buka EO Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
            {session.role === 'ADMIN' && (
              <a
                href="http://localhost:3002"
                className="chamfer-btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 flex items-center gap-1.5 transition-colors"
              >
                Buka Admin Console
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Edit Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-dark-800 border border-line rounded-lg p-6">
            <h2 className="text-lg font-display font-bold uppercase text-white tracking-wide mb-4 pb-2 border-b border-line flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              Kelola Informasi Profil
            </h2>

            {profileMessage && (
              <div className="mb-4 p-3 rounded bg-dark-700 border border-line text-xs text-white">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1">
                    Nickname Pemain
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-dark-900 border border-line rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1">
                    Kota / Kabupaten
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-dark-900 border border-line rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {SUMBAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1.5 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-brand-500" />
                  Game Utama Terdaftar
                </label>
                <div className="flex flex-wrap gap-2">
                  {session.mainGames && session.mainGames.length > 0 ? (
                    session.mainGames.map((game) => (
                      <span
                        key={game}
                        className="text-xs px-2.5 py-1 rounded bg-dark-900 border border-line text-white"
                      >
                        {game}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-accent-text400">Belum memilih game</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="chamfer-btn bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-wider px-5 py-2 text-xs transition-colors"
                >
                  {profileSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>

          {/* AI Gamer Personalization */}
          <div className="bg-[#121217] border border-[#E10600]/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E10600]" />
                <h3 className="text-sm font-display font-bold uppercase text-white tracking-wide">
                  Rekomendasi AI Khusus Gamer {city}
                </h3>
              </div>
              <Link
                href="/cari"
                className="text-xs text-[#E10600] font-semibold flex items-center gap-1 hover:underline"
              >
                Cari Semantik AI <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-dark-900 border border-line rounded p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px]">
                  <Trophy className="w-3.5 h-3.5" /> Turnamen Terdekat di {city}
                </div>
                <div className="text-white font-semibold">
                  {aiRecs?.recommendedEvents?.[0]?.title || 'Minangkabau Esport Cup Season 4'}
                </div>
                <p className="text-accent-text400 text-[11px]">
                  {aiRecs?.recommendedEvents?.[0]?.reason ||
                    `Slot pendaftaran kualifikasi daerah terbuka untuk cabang game favorit Anda di ${city}.`}
                </p>
                <Link
                  href="/event"
                  className="text-[#E10600] text-[11px] font-semibold inline-flex items-center gap-1 mt-1"
                >
                  Daftar Sekarang &rarr;
                </Link>
              </div>

              <div className="bg-dark-900 border border-line rounded p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> Hub Komunitas Minang
                </div>
                <div className="text-white font-semibold">
                  {aiRecs?.recommendedCommunities?.[0]?.name || 'Mobile Legends Sumatera Barat'}
                </div>
                <p className="text-accent-text400 text-[11px]">
                  {aiRecs?.recommendedCommunities?.[0]?.reason ||
                    'Pusat mabar, scrim kompetitif, dan info turnamen se-Sumatera Barat.'}
                </p>
                <Link
                  href="/komunitas"
                  className="text-blue-400 text-[11px] font-semibold inline-flex items-center gap-1 mt-1"
                >
                  Buka Komunitas &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: EO Application */}
        <div className="space-y-6">
          <div className="bg-dark-800 border border-line rounded-lg p-6">
            <h2 className="text-lg font-display font-bold uppercase text-white tracking-wide mb-4 pb-2 border-b border-line flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-500" />
              Status Event Organizer
            </h2>

            {session.role === 'ORGANIZER' || session.role === 'ADMIN' ? (
              <div className="p-4 rounded bg-green-950/30 border border-green-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-green-400 font-bold uppercase font-display">
                  <CheckCircle className="w-4 h-4" />
                  Akun Terverifikasi Sebagai {session.role}
                </div>
                <p className="text-accent-text400">
                  Anda memiliki akses penuh ke Dashboard EO untuk membuat event, pendaftaran custom, dan mengelola bracket pertandingan.
                </p>
              </div>
            ) : eoStatus?.status === 'PENDING' ? (
              <div className="p-4 rounded bg-amber-950/30 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase font-display">
                  <Clock className="w-4 h-4" />
                  Pengajuan Sedang Ditinjau Admin
                </div>
                <p className="text-accent-text400">
                  Organisasi: <span className="text-white font-semibold">{eoStatus.orgName}</span>
                </p>
                <p className="text-accent-text400">
                  Tim admin ESPORT SUMBAR sedang meninjau dokumen identitas & legalitas EO Anda.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-accent-text400 mb-4 leading-relaxed">
                  Ingin menyelenggarakan turnamen di Sumatera Barat? Ajukan upgrade akun ke <strong>ORGANIZER (EO)</strong> untuk membuka tools pembuatan turnamen, form pendaftaran custom, dan bracket real-time.
                </p>

                {eoMessage && (
                  <div className="mb-4 p-3 rounded bg-green-950/40 border border-green-500/50 text-xs text-green-200">
                    {eoMessage}
                  </div>
                )}

                {eoError && (
                  <div className="mb-4 p-3 rounded bg-red-950/40 border border-brand-500/50 text-xs text-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{eoError}</span>
                  </div>
                )}

                <form onSubmit={handleApplyOrganizer} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-accent-text400 uppercase mb-1">
                      Nama Organisasi / Komunitas EO
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-accent-text400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Contoh: Padang Esport Syndicate"
                        className="w-full bg-dark-900 border border-line rounded px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-accent-text400 uppercase mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-accent-text400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full bg-dark-900 border border-line rounded px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-accent-text400 uppercase mb-1">
                      Tautan Dokumen Legalitas / Portofolio (URL)
                    </label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-accent-text400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        required
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://drive.google.com/... atau tautan dokumen"
                        className="w-full bg-dark-900 border border-line rounded px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={eoSubmitting}
                    className="w-full chamfer-btn bg-dark-700 hover:bg-brand-500 text-white font-display font-bold uppercase tracking-wider py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors border border-line hover:border-brand-500"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{eoSubmitting ? 'Mengirim...' : 'Kirim Pengajuan EO'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
