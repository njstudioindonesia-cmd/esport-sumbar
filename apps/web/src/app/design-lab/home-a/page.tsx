'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Radio,
  Users,
  ChevronRight,
  Play,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function HomeVariantABroadcast() {

  const matches = [
    { id: 1, teamA: 'Padang Slayers', scoreA: 2, scoreB: 1, teamB: 'Bukittinggi Titans', game: 'MLBB', status: 'LIVE', minute: 'Game 3 · Menit 14:20' },
    { id: 2, teamA: 'Ranah Minang Elite', scoreA: 13, scoreB: 11, teamB: 'Solok Pride', game: 'VALORANT', status: 'FINAL', minute: 'Selesai' },
    { id: 3, teamA: 'Pariaman Wave', scoreA: 0, scoreB: 0, teamB: 'Payakumbuh Cyber', game: 'MLBB', status: 'UPCOMING', minute: 'Mulai 19:30 WIB' },
  ];

  const instagramFeeds = [
    {
      id: 'ig-1',
      title: 'Pendaftaran GOR Prayoga Cup Resmi Dibuka!',
      game: 'Mobile Legends',
      likes: '1.2K',
      date: '2 jam lalu',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'ig-2',
      title: 'Roster Resmi Tim PON Esports Sumatera Barat 2026',
      game: 'Valorant',
      likes: '2.8K',
      date: '5 jam lalu',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'ig-3',
      title: 'Highlight Pertandingan Sengit Semifinal Jam Gadang Clash',
      game: 'Free Fire',
      likes: '940',
      date: '1 hari lalu',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] antialiased selection:bg-[#E10600] selection:text-white">
      {/* Design Lab Floating Switcher */}
      <div className="bg-[#121217] border-b border-[#E10600]/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
          <span className="font-display uppercase font-bold tracking-wider text-white">
            DESIGN LAB: VARIAN A · "ARENA BROADCAST"
          </span>
          <Badge variant="brand">Rekomendasi</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#9A9AA5]">Pindah Varian:</span>
          <Link href="/design-lab/home-b" className="text-white hover:text-[#F5B700] underline font-semibold">
            Varian B (Minang)
          </Link>
          <Link href="/design-lab/home-c" className="text-white hover:text-sky-400 underline font-semibold">
            Varian C (Clean)
          </Link>
          <Link href="/design-lab" className="text-xs px-2.5 py-1 rounded bg-[#E10600] text-white font-bold uppercase tracking-wider ml-2">
            Kembali ke Hub
          </Link>
        </div>
      </div>

      {/* Broadcast Scoreboard Ticker */}
      <div className="bg-[#0B0B0E] border-b border-[#202028] py-2 px-4 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5 text-[#E10600] font-black uppercase tracking-wider shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#E10600]" />
            MATCH TICKER
          </div>
          <div className="flex items-center gap-6 divide-x divide-[#202028]">
            {matches.map((m) => (
              <div key={m.id} className="pl-6 first:pl-0 flex items-center gap-3">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${m.status === 'LIVE' ? 'bg-[#E10600] text-white animate-pulse' : 'bg-[#1C1C22] text-[#9A9AA5]'}`}>
                  {m.status}
                </span>
                <span className="font-semibold text-white">{m.teamA}</span>
                <span className="font-mono font-black text-[#E10600] px-1 bg-[#15151B] rounded border border-[#202028]">
                  {m.scoreA} - {m.scoreB}
                </span>
                <span className="font-semibold text-white">{m.teamB}</span>
                <span className="text-[10px] text-[#9A9AA5]">({m.minute})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section: Live Broadcast Stage */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden border-b border-[#202028] bg-gradient-to-b from-[#130707] via-[#09090C] to-[#070709]">
        {/* Glow & Stadium scanline overlay */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-[#E10600]/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#E10600_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#E10600]/15 border border-[#E10600]/40 text-[#FF4D4D] text-xs font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-[#E10600]" />
              GRAND FINAL MINANGKABAU CUP 2026
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
              RANAH MINANG <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E10600] via-[#FF3B30] to-[#F5A524]">
                ESPORT ARENA
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#9A9AA5] max-w-xl leading-relaxed">
              Pusat ekosistem esport resmi Sumatera Barat. Ikuti turnamen berhadiah ratusan juta, berita kurasi AI tercepat, dan integrasi resmi dengan <strong className="text-white">@esportsumbar</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/event">
                <button
                  type="button"
                  className="chamfer-btn bg-[#E10600] hover:bg-[#B80500] text-white font-display font-black text-sm uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 shadow-xl shadow-[#E10600]/30 transition-transform hover:scale-[1.02]"
                >
                  <Trophy className="w-4 h-4" />
                  Daftar Turnamen Sekarang
                </button>
              </Link>
              <Link href="/embed/bracket/evt-minangkabau-cup-2026">
                <button
                  type="button"
                  className="chamfer-btn bg-[#181820] hover:bg-[#22222C] border border-[#2F2F3D] text-white font-display font-bold text-sm uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4 text-[#E10600]" />
                  Live Bracket & Stream
                </button>
              </Link>
            </div>

            {/* Live Stats Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#202028] max-w-lg">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#9A9AA5] tracking-wider">Total Hadiah</div>
                <div className="font-display text-2xl font-black text-white tabular-nums">Rp 120 Juta+</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#9A9AA5] tracking-wider">Tim Terdaftar</div>
                <div className="font-display text-2xl font-black text-[#E10600] tabular-nums">480+ Tim</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#9A9AA5] tracking-wider">Kota/Kabupaten</div>
                <div className="font-display text-2xl font-black text-white tabular-nums">19 Wilayah</div>
              </div>
            </div>
          </div>

          {/* Broadcast Card: Active Match Center */}
          <div className="lg:col-span-5">
            <div className="bg-[#111116] border border-[#E10600]/40 rounded-xl p-6 shadow-2xl relative overflow-hidden chamfer-card">
              <div className="absolute top-0 right-0 bg-[#E10600] text-white font-display font-black text-[10px] px-3 py-1 uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-ping" />
                LIVE ON STAGE
              </div>

              <div className="flex items-center gap-2 text-xs text-[#9A9AA5] mb-4">
                <Badge variant="brand">BO5 SERIES</Badge>
                <span>GOR Haji Agus Salim, Padang</span>
              </div>

              {/* Versus Arena Graphic */}
              <div className="bg-[#09090D] border border-[#202028] rounded-lg p-5 my-4">
                <div className="flex items-center justify-between">
                  <div className="text-center space-y-1">
                    <div className="w-14 h-14 mx-auto rounded-lg bg-[#181822] border border-[#2F2F3D] flex items-center justify-center font-display font-black text-lg text-white">
                      PS
                    </div>
                    <div className="font-bold text-xs text-white">Padang Slayers</div>
                    <div className="text-[10px] text-[#9A9AA5]">Kota Padang</div>
                  </div>

                  <div className="text-center px-4">
                    <div className="font-display text-3xl font-black text-white tabular-nums tracking-wider">
                      2 <span className="text-[#E10600]">:</span> 1
                    </div>
                    <div className="text-[10px] font-bold uppercase text-[#E10600] bg-[#E10600]/10 px-2 py-0.5 rounded mt-1">
                      MATCH POINT
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-14 h-14 mx-auto rounded-lg bg-[#181822] border border-[#2F2F3D] flex items-center justify-center font-display font-black text-lg text-white">
                      BT
                    </div>
                    <div className="font-bold text-xs text-white">Bukittinggi Titans</div>
                    <div className="text-[10px] text-[#9A9AA5]">Bukittinggi</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#9A9AA5]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#E10600]" />
                  2.418 Penonton Online
                </span>
                <Link
                  href="/embed/bracket/evt-minangkabau-cup-2026"
                  className="text-white hover:text-[#E10600] font-bold inline-flex items-center gap-1"
                >
                  Buka Bracket Interaktif
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Trending Dari Instagram @esportsumbar */}
      <section className="py-14 px-4 max-w-7xl mx-auto border-b border-[#202028]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-sm inline-block" />
              <span className="text-xs uppercase tracking-widest font-black text-[#FF4D4D]">
                META GRAPH API OFFICIAL FEED
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white">
              Trending Dari <span className="text-[#E10600]">@esportsumbar</span>
            </h2>
          </div>

          <a
            href="https://instagram.com/esportsumbar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#131318] hover:bg-[#1A1A22] border border-[#2A2A38] text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            Follow @esportsumbar di Instagram
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {instagramFeeds.map((item) => (
            <Card
              key={item.id}
              chamfer
              className="p-5 bg-[#101015] border-[#22222E] hover:border-[#E10600]/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-44 rounded-lg bg-[#181822] overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="brand">{item.game}</Badge>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white font-mono">
                    ❤️ {item.likes}
                  </div>
                </div>

                <div className="text-[11px] text-[#9A9AA5]">{item.date}</div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#FF4D4D] transition-colors leading-snug">
                  {item.title}
                </h3>
              </div>

              <div className="pt-4 mt-4 border-t border-[#202028] flex items-center justify-between text-xs">
                <span className="text-[#9A9AA5]">Postingan Resmi IG</span>
                <span className="text-[#E10600] font-bold group-hover:underline inline-flex items-center gap-1">
                  Baca Liputan
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Section: Turnamen Mendatang (Ticket Style) */}
      <section className="py-14 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-black uppercase text-[#E10600] tracking-widest">
              JADWAL KOMPETISI SUMBAR
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-white mt-1">
              Event Esport Terdekat
            </h2>
          </div>
          <Link href="/event" className="text-xs font-bold text-white hover:text-[#E10600] flex items-center gap-1 uppercase tracking-wider">
            Semua Event <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card chamfer ticketNotch className="p-6 bg-[#111116] border-[#22222E] hover:border-[#E10600] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="brand">MOBILE LEGENDS</Badge>
              <span className="text-xs text-[#22C55E] font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                PENDAFTARAN DIBUKA
              </span>
            </div>

            <h3 className="font-display text-2xl font-black uppercase text-white">
              Padang Regional Championship S4
            </h3>
            <p className="text-xs text-[#9A9AA5] mt-1">
              GOR Prayoga, Kota Padang · Kuota 32 Tim · Prize Pool Rp 25.000.000
            </p>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#202028]">
              <div>
                <div className="text-[10px] text-[#9A9AA5] uppercase font-bold">Biaya Registrasi</div>
                <div className="text-sm font-extrabold text-white">Rp 50.000 / Tim</div>
              </div>
              <Link href="/event/padang-regional-championship-s4/daftar">
                <button type="button" className="chamfer-btn bg-[#E10600] hover:bg-[#B80500] text-white font-display font-bold text-xs uppercase px-5 py-2.5">
                  Daftarkan Tim
                </button>
              </Link>
            </div>
          </Card>

          <Card chamfer ticketNotch className="p-6 bg-[#111116] border-[#22222E] hover:border-[#E10600] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="info">VALORANT</Badge>
              <span className="text-xs text-[#F5A524] font-bold bg-[#F5A524]/10 px-2 py-0.5 rounded border border-[#F5A524]/20">
                SISA 4 SLOT
              </span>
            </div>

            <h3 className="font-display text-2xl font-black uppercase text-white">
              Bukittinggi Cyber Invitational
            </h3>
            <p className="text-xs text-[#9A9AA5] mt-1">
              Online Elimination · Kuota 16 Tim · Prize Pool Rp 10.000.000
            </p>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#202028]">
              <div>
                <div className="text-[10px] text-[#9A9AA5] uppercase font-bold">Biaya Registrasi</div>
                <div className="text-sm font-extrabold text-white">Gratis (Sponsored)</div>
              </div>
              <Link href="/event/bukittinggi-cyber-invitational/daftar">
                <button type="button" className="chamfer-btn bg-[#E10600] hover:bg-[#B80500] text-white font-display font-bold text-xs uppercase px-5 py-2.5">
                  Daftarkan Tim
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
