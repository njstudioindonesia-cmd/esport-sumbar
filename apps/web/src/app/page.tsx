import Link from 'next/link';
import { ArrowRight, Trophy, Users, Newspaper } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background ambient red glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-dark-800 border border-line text-xs font-semibold uppercase text-brand-400 mb-6 font-display tracking-widest">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Portal Resmi Esport Sumatera Barat
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-wide uppercase leading-tight mb-6">
            Pusat Turnamen, Komunitas & Berita Esport <span className="text-brand-500">Sumbar</span>
          </h1>

          <p className="max-w-2xl mx-auto text-accent-text400 text-sm sm:text-base leading-relaxed mb-8">
            Platform all-in-one skena esport Ranah Minang: berita terkurasi AI otomatis, ruang diskusi komunitas per game, serta tools lengkap Event Organizer dengan bracket real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/daftar"
              className="chamfer-btn bg-brand-500 hover:bg-brand-600 text-white font-display font-bold uppercase tracking-wider px-6 py-3.5 text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
            >
              <span>Gabung Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/masuk"
              className="chamfer-btn bg-dark-800 hover:bg-dark-700 text-white font-display font-bold uppercase tracking-wider px-6 py-3.5 text-sm border border-line hover:border-brand-500 transition-all"
            >
              Masuk Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 border-t border-line bg-dark-900/40 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-800 border border-line rounded-lg p-6 chamfer-card hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 rounded flex items-center justify-center text-brand-400 mb-4">
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-white uppercase mb-2">
              Berita AI Curated
            </h3>
            <p className="text-xs text-accent-text400 leading-relaxed">
              Ringkasan otomatis berita Mobile Legends, Free Fire, PUBG Mobile, dan dunia esport terverifikasi sumber asli.
            </p>
          </div>

          <div className="bg-dark-800 border border-line rounded-lg p-6 chamfer-card hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 rounded flex items-center justify-center text-brand-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-white uppercase mb-2">
              Komunitas 19 Kota/Kab
            </h3>
            <p className="text-xs text-accent-text400 leading-relaxed">
              Terhubung dengan komunitas gamers Padang, Bukittinggi, Payakumbuh, dan seluruh daerah di Sumatera Barat.
            </p>
          </div>

          <div className="bg-dark-800 border border-line rounded-lg p-6 chamfer-card hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 rounded flex items-center justify-center text-brand-400 mb-4">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-white uppercase mb-2">
              Tools Event Organizer
            </h3>
            <p className="text-xs text-accent-text400 leading-relaxed">
              Form pendaftaran custom, bracket Single/Double Elimination otomatis, leaderboard poin, dan live standings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
