'use client';

import React from 'react';
import Link from 'next/link';
import {
  Palette,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DesignLabHub() {
  const variants = [
    {
      id: 'home-a',
      title: 'Varian A — "Arena Broadcast"',
      badge: 'Rekomendasi Utama',
      badgeColor: 'brand' as const,
      tagline: 'Esports Pro Broadcast · Layar Turnamen · Ticker Live & Skor',
      desc: 'Energi panggung siaran resmi (broadcast stage). Dominan gelap murni dengan aksen merah turnamen (#E10600), ticker pertandingan berjalan, badge LIVE berdenyut, dan tipografi condensed Rajdhani dengan kontras skala ekstrem.',
      features: [
        'Live Broadcast Scoreboard Ticker di posisi teratas',
        'Hero section bergaya stream overlay pro-stage',
        'Event terdekat bergaya kartu tiket pertandingan',
        'Bagian "Trending dari Instagram @esportsumbar" interaktif',
        'Tipografi Condensed (Rajdhani) + Tabular Numbers',
      ],
      colors: ['#0B0B0D', '#E10600', '#F5A524', '#22C55E'],
      href: '/design-lab/home-a',
    },
    {
      id: 'home-b',
      title: 'Varian B — "Ranah Minang Modern"',
      badge: 'Identitas Lokal Terkuat',
      badgeColor: 'warning' as const,
      tagline: 'Cyber Minangkabau · Songket Cyber · Aksen Emas Juara',
      desc: 'Sentuhan kebanggaan Ranah Minang yang futuristik. Menggabungkan siluet Rumah Gadang bergaya cyberpunk, motif ukiran songket digital halus sebagai tekstur, dan aksen emas (#F5B700) melambangkan kejayaan juara esport Ranah Minang.',
      features: [
        'Aksen ornamen ukiran Minangkabau digital geometris',
        'Siluet Rumah Gadang cyberpunk pada latar belakang hero',
        'Peringkat gamer & tim per 19 Kota/Kabupaten Sumatera Barat',
        'Palet warna Merah Minang + Emas Marawa (#F5B700)',
        'Ilustrasi visual bergaya poster game kultural',
      ],
      colors: ['#09090B', '#E10600', '#F5B700', '#10B981'],
      href: '/design-lab/home-b',
    },
    {
      id: 'home-c',
      title: 'Varian C — "Clean Competitive"',
      badge: 'Editorial & Keterbacaan',
      badgeColor: 'info' as const,
      tagline: 'Media Olahraga Modern · Whitespace Lega · Data Terstruktur',
      desc: 'Terinspirasi media jurnalisme olahraga global modern (HLTV / The Athletic / ESPN Esports). Layout lebih lapang, hirarki informasi sangat jernih, tipografi sans-serif modern (Inter), dengan merah digunakan secara presisi sebagai aksen data & highlight.',
      features: [
        'Tata letak editorial majalah olahraga premium',
        'Prioritas tinggi pada keterbacaan berita panjang & analisis match',
        'Jadwal dan statistik klasemen dalam tabel padat & bersih',
        'Whitespace lega dan kontras visual yang ramah di mata',
        'Sangat optimal untuk performa Lighthouse 95+',
      ],
      colors: ['#0D0D11', '#1A1A22', '#E10600', '#3B82F6'],
      href: '/design-lab/home-c',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            DESIGN LAB · REDESIGN BERANDA UPDATE V2
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase font-display tracking-tight text-white">
            Pilih Arah Visual <span className="text-brand-500">ESPORT SUMBAR</span>
          </h1>
          <p className="text-sm md:text-base text-accent-text400 leading-relaxed">
            Sesuai spesifikasi Bagian 4 di <code className="text-brand-400 font-mono">UPDATE_v2.md</code>, kami telah membangun 3 prototipe Beranda fungsional dengan data realistis. Silakan uji setiap varian di bawah ini sebelum menetapkan pilihan akhir untuk implementasi design tokens seluruh portal.
          </p>
        </div>

        {/* Variant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {variants.map((v) => (
            <Card
              key={v.id}
              chamfer
              className="p-6 bg-[#131316] border-[#2A2A31] hover:border-brand-500/50 flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={v.badgeColor}>{v.badge}</Badge>
                  <div className="flex items-center gap-1.5">
                    {v.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold font-display uppercase tracking-wide text-white group-hover:text-brand-400 transition-colors">
                    {v.title}
                  </h2>
                  <div className="text-xs font-semibold text-brand-500 mt-0.5">
                    {v.tagline}
                  </div>
                </div>

                <p className="text-xs text-accent-text400 leading-relaxed">
                  {v.desc}
                </p>

                <div className="pt-3 border-t border-[#2A2A31] space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent-text400">
                    Fitur Kunci:
                  </div>
                  <ul className="space-y-1.5">
                    {v.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#F5F5F7]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Link href={v.href}>
                  <button
                    type="button"
                    className="w-full chamfer-btn bg-brand-500 hover:bg-brand-600 text-white font-display font-bold uppercase tracking-wider py-2.5 px-4 text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-500/20"
                  >
                    Buka Prototipe {v.id.toUpperCase()}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Back Link */}
        <div className="text-center pt-6">
          <Link
            href="/"
            className="text-xs text-accent-text400 hover:text-white inline-flex items-center gap-1"
          >
            ← Kembali ke Beranda Saat Ini
          </Link>
        </div>
      </div>
    </div>
  );
}
