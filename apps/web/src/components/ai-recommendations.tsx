'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Users,
  ArrowRight,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const SUMBAR_CITIES = ['Padang', 'Bukittinggi', 'Payakumbuh', 'Solok', 'Pariaman'];

export function AiRecommendationsSection() {
  const [selectedCity, setSelectedCity] = useState('Padang');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    recommendedEvents: any[];
    recommendedCommunities: any[];
  }>({
    recommendedEvents: [
      {
        id: 'evt-minangkabau-cup-2026',
        title: 'Minangkabau Esport Cup Season 4 — MLBB Championship',
        slug: 'minangkabau-esport-cup-season-4',
        gameId: 'MLBB',
        city: 'Padang',
        prizePool: 25_000_000,
        reason: 'Turnamen terbesar dengan slot pendaftaran masih terbuka untuk perwakilan daerah.',
      },
      {
        id: 'evt-val-campus-padang-2026',
        title: 'Valorant Campus & Highschool Series Sumbar 2026',
        slug: 'valorant-campus-series-sumbar-2026',
        gameId: 'VALORANT',
        city: 'Padang',
        prizePool: 10_000_000,
        reason: 'Turnamen tactical shooter terdekat dengan domisili kampus Anda di Padang.',
      },
    ],
    recommendedCommunities: [
      {
        id: 'comm-mlbb-sumbar',
        name: 'Mobile Legends Bang Bang Sumatera Barat',
        slug: 'mlbb-sumbar',
        gameId: 'MLBB',
        reason: 'Komunitas resmi game terpopuler di Sumatera Barat dengan scrim mingguan.',
      },
      {
        id: 'comm-val-sumbar',
        name: 'Valorant Sumatera Barat',
        slug: 'val-sumbar',
        gameId: 'VALORANT',
        reason: 'Basis komunitas pemain tactical shooter di Ranah Minang.',
      },
    ],
  });

  useEffect(() => {
    const { user } = getSession();
    if (user?.city) {
      setSelectedCity(user.city);
    }
  }, []);

  const fetchRecommendations = async (city: string, game: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/ai/recommendations?city=${encodeURIComponent(city)}&games=${encodeURIComponent(
          game,
        )}`,
      );
      if (res.ok) {
        const json = await res.json();
        setData({
          recommendedEvents: json.recommendedEvents || [],
          recommendedCommunities: json.recommendedCommunities || [],
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    fetchRecommendations(city, 'MLBB');
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="bg-[#121217] border border-[#F5B700]/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5B700]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2A2A38]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 text-[#F5B700] ${loading ? 'animate-spin' : ''}`} />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F5B700] font-bold">
                Smart Feed AI {loading && '(Memuat...)'}
              </span>
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl uppercase tracking-wide text-white">
              Rekomendasi Pintar <span className="text-[#F5B700]">Gamers Ranah Minang</span>
            </h3>
            <p className="text-xs text-[#9A9AA5] max-w-xl">
              Turnamen dan komunitas yang dipersonalisasi berdasarkan domisili kota di Sumatera Barat dan preferensi game kompetitif Anda.
            </p>
          </div>

          {/* Interactive City Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono uppercase text-[#9A9AA5] flex items-center gap-1 font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#F5B700]" /> Wilayah:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SUMBAR_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedCity.toLowerCase() === city.toLowerCase()
                      ? 'bg-[#F5B700] text-black shadow-md shadow-[#F5B700]/25 font-black'
                      : 'bg-[#181822] text-[#9A9AA5] hover:text-white border border-[#2A2A38]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Recommended Events */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-[#9A9AA5]">
              <span className="flex items-center gap-1.5 text-white">
                <Trophy className="w-4 h-4 text-[#E10600]" /> Turnamen Prioritas di {selectedCity}
              </span>
              <Link href="/event" className="hover:text-[#E10600] transition-colors">
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {data.recommendedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#181820] border border-[#26262F] hover:border-[#E10600]/50 rounded-xl p-4 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" className="text-[10px] font-mono">
                        {evt.gameId}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Rp {Number(evt.prizePool).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm uppercase text-white group-hover:text-[#E10600] transition-colors line-clamp-1">
                      {evt.title}
                    </h4>

                    <div className="bg-[#111116] border border-[#1F1F28] rounded p-2 text-[11px] text-[#9A9AA5] flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E10600] shrink-0 mt-0.5" />
                      <span>{evt.reason}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#23232C] flex items-center justify-between text-xs">
                    <span className="text-[#5A5A66] font-mono text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E10600]" /> {evt.city}
                    </span>
                    <Link
                      href={`/event/${evt.slug}`}
                      className="text-[#E10600] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Daftar Slot <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Recommended Communities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-[#9A9AA5]">
              <span className="flex items-center gap-1.5 text-white">
                <Users className="w-4 h-4 text-blue-400" /> Komunitas Aktif & Official Hub
              </span>
              <Link href="/komunitas" className="hover:text-[#E10600] transition-colors">
                Jelajahi &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {data.recommendedCommunities.map((com) => (
                <div
                  key={com.id}
                  className="bg-[#181820] border border-[#26262F] hover:border-blue-500/50 rounded-xl p-4 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" className="text-[10px] font-mono bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {com.gameId}
                      </Badge>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm uppercase text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {com.name}
                    </h4>

                    <div className="bg-[#111116] border border-[#1F1F28] rounded p-2 text-[11px] text-[#9A9AA5] flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{com.reason}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#23232C] flex items-center justify-between text-xs">
                    <span className="text-[#5A5A66] font-mono text-[11px]">
                      Scrim & Turnamen Rutin
                    </span>
                    <Link
                      href={`/komunitas/${com.slug}`}
                      className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Buka Hub <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
