'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HomeVariantCCleanCompetitive() {
  const editorialArticles = [
    {
      id: 1,
      category: 'ANALISIS TAKTIKAL',
      title: 'Bedah Strategi Padang Slayers: Bagaimana Komposisi Hero Early-Game Menumbangkan Bukittinggi',
      summary: 'Analisis mendalam drafting fase ban/pick pada semifinal penentuan yang mengubah alur pertandingan game 3.',
      author: 'Rahmat Hidayat · Analis Esport Sumbar',
      time: '4 jam lalu',
      readTime: '4 menit baca',
      badge: 'ARTIKEL UNGGULAN',
    },
    {
      id: 2,
      category: 'TRANSFER & ROSTER',
      title: 'Ranah Minang Elite Umumkan Roster Baru untuk Babak Kualifikasi Terbuka',
      summary: 'Dua pemain veteran asal Solok resmi bergabung untuk memperkuat lini pertahanan menjelang turnamen.',
      author: 'Redaksi Esport Sumbar',
      time: '8 jam lalu',
      readTime: '3 menit baca',
      badge: 'TERBARU',
    },
    {
      id: 3,
      category: 'LIPUTAN KOMUNITAS',
      title: 'Komunitas Free Fire Payakumbuh Catatkan Rekor Pendaftar Scrim Mingguan Terbanyak',
      summary: 'Lebih dari 48 tim mendaftar dalam waktu kurang dari 20 menit setelah link form pendaftaran dibuka.',
      author: 'Kontributor Payakumbuh',
      time: '12 jam lalu',
      readTime: '2 menit baca',
      badge: 'KOMUNITAS',
    },
  ];

  const weeklySchedule = [
    { date: 'RABU, 15 OKT', time: '19:30 WIB', teamA: 'Padang Slayers', teamB: 'Bukittinggi Titans', game: 'MLBB', tournament: 'Minangkabau Cup S1' },
    { date: 'KAMIS, 16 OKT', time: '20:00 WIB', teamA: 'Pariaman Wave', teamB: 'Ranah Minang Elite', game: 'VALORANT', tournament: 'Piala Gubernur S4' },
    { date: 'JUMAT, 17 OKT', time: '18:45 WIB', teamA: 'Solok Cyber', teamB: 'Payakumbuh Hub', game: 'FREE FIRE', tournament: 'Battle of Singgalang' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C10] text-[#E4E4EB] antialiased font-sans selection:bg-[#E10600] selection:text-white">
      {/* Design Lab Floating Switcher */}
      <div className="bg-[#14141A] border-b border-[#2C2C38] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-semibold tracking-wider text-white">
            DESIGN LAB: VARIAN C · "CLEAN COMPETITIVE"
          </span>
          <Badge variant="info">Editorial & Data</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8E8EA0]">Pindah Varian:</span>
          <Link href="/design-lab/home-a" className="text-white hover:text-[#E10600] underline font-semibold">
            Varian A (Broadcast)
          </Link>
          <Link href="/design-lab/home-b" className="text-white hover:text-[#F5B700] underline font-semibold">
            Varian B (Minang)
          </Link>
          <Link href="/design-lab" className="text-xs px-2.5 py-1 rounded bg-[#1C1C24] hover:bg-[#282834] text-white font-medium ml-2">
            Kembali ke Hub
          </Link>
        </div>
      </div>

      {/* Main Editorial Hero */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Lead Story (Large Headline) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E10600] tracking-wider uppercase">
              <span className="w-2 h-2 bg-[#E10600] rounded-full inline-block" />
              LIPUTAN UTAMA · SUMATERA BARAT
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1] hover:text-[#FF4D4D] transition-colors cursor-pointer">
              {editorialArticles[0]?.title}
            </h1>

            <p className="text-base sm:text-lg text-[#9E9EB2] leading-relaxed">
              {editorialArticles[0]?.summary}
            </p>

            <div className="flex items-center justify-between py-3 border-y border-[#1E1E28] text-xs text-[#8E8EA0]">
              <div className="flex items-center gap-4">
                <span className="font-medium text-white">{editorialArticles[0]?.author}</span>
                <span>·</span>
                <span>{editorialArticles[0]?.time}</span>
                <span>·</span>
                <span>{editorialArticles[0]?.readTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="hover:text-white"><Bookmark className="w-4 h-4" /></button>
                <button type="button" className="hover:text-white"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Sub-articles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {editorialArticles.slice(1).map((art) => (
                <div key={art.id} className="p-5 rounded-xl bg-[#13131A] border border-[#20202C] space-y-3 hover:border-[#303042] transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#E10600] font-bold uppercase tracking-wider">{art.category}</span>
                    <span className="text-[#8E8EA0]">{art.time}</span>
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-[#FF4D4D] transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#8E8EA0] line-clamp-2">
                    {art.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Match Schedule & Standing */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-[#13131A] border border-[#20202C] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#20202C]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E10600]" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Jadwal Pertandingan Pekan Ini
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                {weeklySchedule.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#0C0C10] border border-[#1A1A24] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[#8E8EA0]">
                      <span className="font-medium text-[#E10600]">{s.date} · {s.time}</span>
                      <Badge variant="outline">{s.game}</Badge>
                    </div>
                    <div className="flex items-center justify-between font-bold text-white text-sm">
                      <span>{s.teamA}</span>
                      <span className="text-[#8E8EA0] text-xs font-normal">vs</span>
                      <span>{s.teamB}</span>
                    </div>
                    <div className="text-[10px] text-[#8E8EA0]">{s.tournament}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/event">
                  <button type="button" className="w-full py-2.5 px-4 rounded-lg bg-[#1C1C26] hover:bg-[#252534] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5">
                    Lihat Kalender Turnamen Lengkap
                    <ChevronRight className="w-3.5 h-3.5 text-[#E10600]" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Fast Stats Box */}
            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#20202C] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                Metrik Esport Sumbar Terkini
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-[#0C0C10] border border-[#1A1A24]">
                  <div className="text-[#8E8EA0] text-[10px]">Pemain Terdaftar</div>
                  <div className="text-lg font-bold text-white mt-0.5">3.840</div>
                </div>
                <div className="p-3 rounded bg-[#0C0C10] border border-[#1A1A24]">
                  <div className="text-[#8E8EA0] text-[10px]">Turnamen Selesai</div>
                  <div className="text-lg font-bold text-white mt-0.5">28 Event</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
