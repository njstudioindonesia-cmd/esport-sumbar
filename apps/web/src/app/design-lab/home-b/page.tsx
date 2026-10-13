'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  ChevronRight,
  Medal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function HomeVariantBMinangModern() {
  const regionalLeaderboard = [
    { rank: 1, city: 'Kota Padang', points: 4850, activeTeams: 142, championCount: 18 },
    { rank: 2, city: 'Kota Bukittinggi', points: 3920, activeTeams: 98, championCount: 12 },
    { rank: 3, city: 'Kota Payakumbuh', points: 3100, activeTeams: 74, championCount: 8 },
    { rank: 4, city: 'Kota Solok', points: 2640, activeTeams: 56, championCount: 5 },
    { rank: 5, city: 'Kota Pariaman', points: 2210, activeTeams: 48, championCount: 4 },
  ];

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F7] antialiased selection:bg-[#F5B700] selection:text-black">
      {/* Design Lab Floating Switcher */}
      <div className="bg-[#121216] border-b border-[#F5B700]/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F5B700] animate-ping" />
          <span className="font-display uppercase font-bold tracking-wider text-white">
            DESIGN LAB: VARIAN B · "RANAH MINANG MODERN"
          </span>
          <Badge variant="warning">Identitas Lokal</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#9A9AA5]">Pindah Varian:</span>
          <Link href="/design-lab/home-a" className="text-white hover:text-[#E10600] underline font-semibold">
            Varian A (Broadcast)
          </Link>
          <Link href="/design-lab/home-c" className="text-white hover:text-sky-400 underline font-semibold">
            Varian C (Clean)
          </Link>
          <Link href="/design-lab" className="text-xs px-2.5 py-1 rounded bg-[#F5B700] text-black font-bold uppercase tracking-wider ml-2">
            Kembali ke Hub
          </Link>
        </div>
      </div>

      {/* Hero Section: Cyber Minangkabau & Gonjong Silhouettes */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden border-b border-[#242430] bg-gradient-to-b from-[#140D04] via-[#0B0B0E] to-[#08080A]">
        {/* Minang Marawa (Hitam, Merah, Kuning) Accent Glows */}
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#F5B700]/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-10 left-10 w-[400px] h-[300px] bg-[#E10600]/15 blur-[120px] pointer-events-none rounded-full" />

        {/* Cyber Songket Geometric Backdrop Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F5B700]/15 border border-[#F5B700]/40 text-[#F5B700] text-xs font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" />
              MARAWA ESPORT SUMATERA BARAT
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.98]">
              BANGKITKAN JAWARA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B700] via-[#E10600] to-[#FF4D4D]">
                RANAH MINANG
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#9A9AA5] max-w-xl leading-relaxed">
              Wadah kompetisi resmi atlet esport di 19 kota & kabupaten Sumatera Barat. Dari Jam Gadang hingga Danau Singkarak, buktikan kehebatan tim Anda di panggung nasional.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/event">
                <button
                  type="button"
                  className="chamfer-btn bg-[#F5B700] hover:bg-[#D9A100] text-black font-display font-black text-sm uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 shadow-xl shadow-[#F5B700]/25 transition-transform hover:scale-[1.02]"
                >
                  <Trophy className="w-4 h-4 text-black" />
                  Ikuti Turnamen Daerah
                </button>
              </Link>
              <Link href="/komunitas">
                <button
                  type="button"
                  className="chamfer-btn bg-[#181822] hover:bg-[#22222E] border border-[#323242] text-white font-display font-bold text-sm uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 transition-colors"
                >
                  <Crown className="w-4 h-4 text-[#F5B700]" />
                  Komunitas Se-Sumbar
                </button>
              </Link>
            </div>
          </div>

          {/* Regional Pride Spotlight Graphic */}
          <div className="lg:col-span-5">
            <div className="bg-[#121217] border border-[#F5B700]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden chamfer-card">
              <div className="flex items-center justify-between pb-4 border-b border-[#242430]">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-[#F5B700]" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    KLASEMEN KOTA / KABUPATEN
                  </span>
                </div>
                <Badge variant="warning">SUMBAR LEAGUE</Badge>
              </div>

              <div className="divide-y divide-[#242430]/60 my-2">
                {regionalLeaderboard.map((r) => (
                  <div key={r.rank} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                        r.rank === 1 ? 'bg-[#F5B700] text-black font-black' :
                        r.rank === 2 ? 'bg-[#E10600] text-white' :
                        'bg-[#1C1C24] text-[#9A9AA5]'
                      }`}>
                        #{r.rank}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm">{r.city}</div>
                        <div className="text-[10px] text-[#9A9AA5]">{r.activeTeams} Tim Aktif · {r.championCount} Juara</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-[#F5B700] tabular-nums text-sm">
                        {r.points.toLocaleString('id-ID')} Poin
                      </div>
                      <div className="text-[10px] text-[#22C55E]">Skor ELO Daerah</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#242430] text-center">
                <Link href="/komunitas" className="text-xs text-[#F5B700] hover:underline font-bold inline-flex items-center gap-1">
                  Lihat Peringkat Lengkap 19 Kota/Kabupaten
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Festival Esport Ranah Minang */}
      <section className="py-14 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-black uppercase text-[#F5B700] tracking-widest">
              AGENDA KOMPETISI KULTURAL
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-white mt-1">
              Turnamen Bergengsi Sumatera Barat
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card chamfer className="p-6 bg-[#111116] border-[#2A2A38] hover:border-[#F5B700] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="warning">PIALA GUBERNUR SUMBAR 2026</Badge>
              <span className="text-xs text-[#F5B700] font-bold">19 KOTA/KABUPATEN</span>
            </div>
            <h3 className="font-display text-2xl font-black uppercase text-white">
              Minangkabau Youth Esports Championship
            </h3>
            <p className="text-xs text-[#9A9AA5] mt-1">
              Perebutan gelar juara umum Sumbar dan tiket seleksi atlet PON Esports cabang Mobile Legends & Free Fire.
            </p>
            <div className="mt-6 pt-4 border-t border-[#242430] flex items-center justify-between">
              <span className="font-display text-lg font-bold text-[#F5B700]">Total Hadiah Rp 75.000.000</span>
              <button type="button" className="chamfer-btn bg-[#F5B700] text-black font-display font-bold text-xs uppercase px-4 py-2 hover:bg-[#D9A100]">
                Detail Turnamen
              </button>
            </div>
          </Card>

          <Card chamfer className="p-6 bg-[#111116] border-[#2A2A38] hover:border-[#F5B700] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="brand">BUKITTINGGI CLASH</Badge>
              <span className="text-xs text-white/70">JAM GADANG ARENA</span>
            </div>
            <h3 className="font-display text-2xl font-black uppercase text-white">
              Battle of Singgalang & Marapi S2
            </h3>
            <p className="text-xs text-[#9A9AA5] mt-1">
              Turnamen Valorant & PUBGM dengan babak final offline outdoor di pelataran Jam Gadang Bukittinggi.
            </p>
            <div className="mt-6 pt-4 border-t border-[#242430] flex items-center justify-between">
              <span className="font-display text-lg font-bold text-[#F5B700]">Total Hadiah Rp 30.000.000</span>
              <button type="button" className="chamfer-btn bg-[#E10600] text-white font-display font-bold text-xs uppercase px-4 py-2 hover:bg-[#B80500]">
                Detail Turnamen
              </button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
