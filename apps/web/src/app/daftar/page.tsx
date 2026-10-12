'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, saveSession } from '@/lib/api';
import { User, Mail, Lock, MapPin, Gamepad2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

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

const AVAILABLE_GAMES = [
  'Mobile Legends',
  'Free Fire',
  'PUBG Mobile',
  'Valorant',
  'CS2',
  'Dota 2',
  'Honor of Kings',
  'E-Football',
];

export default function DaftarPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Padang');
  const [selectedGames, setSelectedGames] = useState<string[]>(['Mobile Legends']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter((g) => g !== game));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };

  // Password validation checks
  const isMin8 = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = isMin8 && hasUpper && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password harus memenuhi syarat keamanan.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await apiRequest<{ user: any; tokens: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        nickname,
        city,
        mainGames: selectedGames,
      }),
    });

    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.error || 'Pendaftaran gagal');
      return;
    }

    saveSession(res.data.user, res.data.tokens);
    router.push('/profil');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-lg">
        {/* Ticket Header */}
        <div className="bg-dark-800 border border-line border-b-0 rounded-t-lg p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-xs uppercase text-brand-400 tracking-wider">
              Registrasi Pemain
            </span>
            <span className="text-[11px] text-accent-text400 uppercase tracking-widest font-mono">
              JOIN // SUMBAR
            </span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-wide uppercase">
            Buat Akun Esport Sumbar
          </h1>
          <p className="text-accent-text400 text-xs mt-1">
            Bergabung dengan komunitas gamers dan atlet esport se-Sumatera Barat.
          </p>
        </div>

        {/* Divider cut with ticket notch */}
        <div className="h-2 bg-dark-800 border-x border-line relative flex items-center justify-between">
          <div className="w-full border-t border-dashed border-line"></div>
        </div>

        {/* Form Body */}
        <div className="bg-dark-800 border border-line border-t-0 rounded-b-lg p-6 pt-4 chamfer-card">
          {error && (
            <div className="mb-5 p-3 rounded bg-red-950/40 border border-brand-500/50 flex items-start gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1.5">
                  Nickname Pemain
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-accent-text400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: RendangSlayer"
                    className="w-full bg-dark-900 border border-line rounded px-3 py-2.5 pl-10 text-sm text-white placeholder-accent-text400/50 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-accent-text400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-dark-900 border border-line rounded px-3 py-2.5 pl-10 text-sm text-white placeholder-accent-text400/50 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-accent-text400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter (huruf besar + angka)"
                  className="w-full bg-dark-900 border border-line rounded px-3 py-2.5 pl-10 text-sm text-white placeholder-accent-text400/50 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Password strength indicators */}
              <div className="flex gap-4 mt-2 text-[11px] text-accent-text400">
                <span className={`flex items-center gap-1 ${isMin8 ? 'text-green-400' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> Min 8 Karakter
                </span>
                <span className={`flex items-center gap-1 ${hasUpper ? 'text-green-400' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> 1 Huruf Besar
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-green-400' : ''}`}>
                  <CheckCircle2 className="w-3 h-3" /> 1 Angka
                </span>
              </div>
            </div>

            {/* Kota / Kabupaten Sumbar */}
            <div>
              <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1.5">
                Kota / Kabupaten (Sumatera Barat)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-accent-text400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-dark-900 border border-line rounded px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
                >
                  {SUMBAR_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-dark-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Game Utama */}
            <div>
              <label className="block text-xs font-semibold text-accent-text400 uppercase mb-1.5 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-brand-500" />
                Game Utama yang Dimainkan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {AVAILABLE_GAMES.map((game) => {
                  const isSelected = selectedGames.includes(game);
                  return (
                    <button
                      key={game}
                      type="button"
                      onClick={() => toggleGame(game)}
                      className={`text-xs py-2 px-2.5 rounded border transition-colors text-center font-medium ${
                        isSelected
                          ? 'bg-brand-500/20 border-brand-500 text-white font-semibold'
                          : 'bg-dark-900 border-line text-accent-text400 hover:border-line-strong'
                      }`}
                    >
                      {game}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full chamfer-btn bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 mt-6 transition-all"
            >
              {loading ? (
                <span>Memproses Akun...</span>
              ) : (
                <>
                  <span>Daftar Akun Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-center text-xs text-accent-text400">
            Sudah memiliki akun?{' '}
            <Link
              href="/masuk"
              className="text-brand-400 hover:text-brand-500 font-semibold transition-colors"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
