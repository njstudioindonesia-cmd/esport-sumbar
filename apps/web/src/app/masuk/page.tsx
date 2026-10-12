'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest, saveSession } from '@/lib/api';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await apiRequest<{ user: any; tokens: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.error || 'Email atau password salah');
      return;
    }

    saveSession(res.data.user, res.data.tokens);
    router.push('/profil');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        {/* Ticket Header Aesthetic */}
        <div className="bg-dark-800 border border-line border-b-0 rounded-t-lg p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-xs uppercase text-brand-400 tracking-wider">
              Autentikasi Pemain
            </span>
            <span className="text-[11px] text-accent-text400 uppercase tracking-widest font-mono">
              AUTH // ID
            </span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-wide uppercase">
            Masuk ke Platform
          </h1>
          <p className="text-accent-text400 text-xs mt-1">
            Akses profil esport, kelola tim, komunitas, dan ikuti turnamen.
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
                  placeholder="nama@esport.id"
                  className="w-full bg-dark-900 border border-line rounded px-3 py-2.5 pl-10 text-sm text-white placeholder-accent-text400/50 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-accent-text400 uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-accent-text400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-line rounded px-3 py-2.5 pl-10 pr-10 text-sm text-white placeholder-accent-text400/50 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-accent-text400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full chamfer-btn bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 mt-6 transition-all"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-center text-xs text-accent-text400">
            Belum punya akun?{' '}
            <Link
              href="/daftar"
              className="text-brand-400 hover:text-brand-500 font-semibold transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
