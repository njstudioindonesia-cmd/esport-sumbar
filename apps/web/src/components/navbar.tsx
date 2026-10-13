'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, clearSession, UserSession } from '@/lib/api';
import { User, LogOut, ChevronRight, Search, Bell } from 'lucide-react';
import { InstagramIcon } from '@/components/icons';

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
          <div className="w-8 h-8 bg-gradient-to-tr from-[#E10600] via-[#FF3B30] to-[#F5B700] flex items-center justify-center font-display text-black font-black text-lg chamfer-badge shadow-md shadow-[#F5B700]/20 group-hover:scale-105 transition-transform">
            ES
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-wider text-white leading-none">
              ESPORT <span className="text-[#F5B700]">SUMBAR</span>
            </span>
            <span className="text-[10px] text-[#9A9AA5] tracking-widest uppercase font-semibold">
              Ranah Minang
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/berita"
            className={
              pathname?.startsWith('/berita')
                ? 'text-[#F5B700] font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Berita
          </Link>
          <Link
            href="/komunitas"
            className={
              pathname?.startsWith('/komunitas')
                ? 'text-[#F5B700] font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Komunitas
          </Link>
          <Link
            href="/event"
            className={
              pathname?.startsWith('/event')
                ? 'text-[#F5B700] font-bold'
                : 'text-accent-text400 hover:text-white transition-colors'
            }
          >
            Event & Turnamen
          </Link>
          <a
            href="http://localhost:3001"
            className="text-accent-text400 hover:text-white transition-colors"
          >
            EO Studio
          </a>
          {session?.role === 'ADMIN' && (
            <a
              href="http://localhost:3002"
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Admin Console
            </a>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {/* Follow Instagram Button */}
          <a
            href="https://www.instagram.com/esportsumbar"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181822] hover:bg-[#22222E] border border-[#2A2A38] text-xs font-bold text-[#F5B700] hover:text-white transition-all shadow-sm"
            title="Follow Instagram Resmi @esportsumbar"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>@esportsumbar</span>
          </a>

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
                className="chamfer-btn bg-[#F5B700] hover:bg-[#D9A100] text-black text-sm font-black uppercase tracking-wider px-4 py-2 flex items-center gap-1 transition-transform hover:scale-[1.02] shadow-md shadow-[#F5B700]/20"
              >
                Daftar
                <ChevronRight className="w-4 h-4 text-black" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
