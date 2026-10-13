'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, clearSession, UserSession } from '@/lib/api';
import { User, LogOut, ChevronRight, Search, Bell } from 'lucide-react';

export function Navbar() {
  const [session, setSession] = useState<UserSession | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const { user } = getSession();
    setSession(user);
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    router.push('/masuk');
  };

  return (
    <header className="border-b border-line bg-dark-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-brand-500 flex items-center justify-center font-display text-white font-bold text-lg chamfer-badge group-hover:bg-brand-400 transition-colors">
            ES
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-wider text-white leading-none">
              ESPORT <span className="text-brand-500">SUMBAR</span>
            </span>
            <span className="text-[10px] text-accent-text400 tracking-widest uppercase">
              Sumatera Barat
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/berita"
            className={
              pathname?.startsWith('/berita')
                ? 'text-brand-500 font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Berita
          </Link>
          <Link
            href="/komunitas"
            className={
              pathname?.startsWith('/komunitas')
                ? 'text-brand-500 font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Komunitas
          </Link>
          <Link
            href="/event"
            className={
              pathname?.startsWith('/event')
                ? 'text-brand-500 font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Event & Turnamen
          </Link>
          <Link
            href="/eo/dashboard"
            className={
              pathname?.startsWith('/eo')
                ? 'text-brand-500 font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Panel EO
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {/* Global Smart Search */}
          <Link
            href="/cari"
            title="Pencarian Cerdas AI"
            className={`p-2 rounded border transition-colors flex items-center justify-center ${
              pathname?.startsWith('/cari')
                ? 'bg-[#E10600]/20 text-[#E10600] border-[#E10600]/40'
                : 'text-accent-text400 hover:text-white hover:bg-dark-800 border-transparent hover:border-line'
            }`}
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* In-App Notifications */}
          <Link
            href="/notifikasi"
            title="Pusat Notifikasi"
            className={`relative p-2 rounded border transition-colors flex items-center justify-center ${
              pathname?.startsWith('/notifikasi')
                ? 'bg-[#E10600]/20 text-[#E10600] border-[#E10600]/40'
                : 'text-accent-text400 hover:text-white hover:bg-dark-800 border-transparent hover:border-line'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
          </Link>

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profil"
                className="flex items-center gap-2 py-1.5 px-3 rounded bg-dark-800 border border-line hover:border-brand-500 transition-colors text-sm"
              >
                <User className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-white">{session.nickname}</span>
                <span className="text-[10px] uppercase font-display px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {session.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 text-accent-text400 hover:text-brand-400 hover:bg-dark-800 rounded border border-transparent hover:border-line transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/masuk"
                className="text-sm font-semibold text-accent-text100 hover:text-brand-400 px-3 py-1.5 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="chamfer-btn bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1 transition-colors"
              >
                Daftar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
