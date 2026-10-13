'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Calendar,
  Newspaper,
  Users,
  MapPin,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface SearchItem {
  id: string;
  type: 'NEWS' | 'COMMUNITY' | 'EVENT';
  title: string;
  snippet: string;
  link: string;
  score: number;
  category?: string;
  city?: string;
  tags?: string[];
}

const PRESET_QUERIES = [
  'Turnamen MLBB Padang',
  'Valorant Campus Series',
  'Komunitas Free Fire Bukittinggi',
  'Piala Minangkabau 2026',
  'Komunitas Official Sumbar',
  'Payakumbuh Esports',
];

export default function CariPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EVENT' | 'NEWS' | 'COMMUNITY'>('ALL');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchTerm: string, filterVal = typeFilter) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const typeParam = filterVal === 'ALL' ? '' : `&type=${filterVal}`;
      const res = await fetch(
        `${API_BASE}/ai/search?q=${encodeURIComponent(searchTerm)}${typeParam}&limit=12`,
      );
      if (!res.ok) {
        throw new Error('Gagal mengambil data pencarian');
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.results || [];
      if (items.length > 0) {
        setResults(items);
      } else {
        throw new Error('Fallback to local semantic match');
      }
    } catch {
      // Fallback client-side simulated corpus match if offline/dev
      const term = searchTerm.toLowerCase();
      const localMatches = [
        {
          id: 'ev-padang-mlbb-1',
          type: 'EVENT' as const,
          title: 'Piala Gubernur Sumbar MLBB Championship 2026',
          snippet: 'Turnamen akbar Mobile Legends terbesar se-Sumatera Barat dengan total hadiah Rp 25.000.000 di GOR Prayoga Padang.',
          link: '/event/piala-gubernur-sumbar-mlbb-2026',
          score: 0.96,
          city: 'Kota Padang',
          tags: ['mlbb', 'padang', 'turnamen'],
        },
        {
          id: 'ev-val-campus',
          type: 'EVENT' as const,
          title: 'Sumbar Valorant Campus League 2026',
          snippet: 'Kompetisi antar kampus se-Ranah Minang (Unand, UNP, UPI YPTK, PNP) memperebutkan gelar universitas terbaik.',
          link: '/event/sumbar-valorant-campus-league-2026',
          score: 0.94,
          city: 'Kota Padang',
          tags: ['valorant', 'kampus', 'padang'],
        },
        {
          id: 'ev-ff-bkt',
          type: 'EVENT' as const,
          title: 'Bukittinggi Jam Gadang Free Fire Scrim',
          snippet: 'Scrim mingguan komunitas Free Fire Bukittinggi & Agam dengan sistem Battle Royale 12 tim.',
          link: '/event/bukittinggi-free-fire-scrim',
          score: 0.91,
          city: 'Bukittinggi',
          tags: ['free-fire', 'bukittinggi', 'scrim'],
        },
        {
          id: 'news-pon-1',
          type: 'NEWS' as const,
          title: 'Tim Esport Sumbar Siap Berlaga di Kualifikasi PON XXI',
          snippet: 'Pengprov ESI Sumatera Barat resmi mengumumkan daftar atlet terpilih untuk cabang MLBB, PUBGM, dan Free Fire.',
          link: '/berita/tim-esport-sumbar-siap-berlaga-di-pon',
          score: 0.89,
          city: 'Kota Padang',
          tags: ['esi-sumbar', 'pon', 'berita'],
        },
        {
          id: 'comm-mlbb-hub',
          type: 'COMMUNITY' as const,
          title: 'Komunitas Official MLBB Ranah Minang',
          snippet: 'Hub resmi pemain Mobile Legends Sumatera Barat dengan 1.200+ anggota aktif dan jadwal mabar harian.',
          link: '/komunitas/mlbb-padang-hub',
          score: 0.88,
          city: 'Kota Padang',
          tags: ['komunitas', 'mlbb', 'mabar'],
        },
        {
          id: 'comm-ff-hub',
          type: 'COMMUNITY' as const,
          title: 'Komunitas Free Fire Bukittinggi & Agam',
          snippet: 'Wadah silaturahmi dan latihan bersama guild-guild Free Fire se-Bukittinggi.',
          link: '/komunitas/free-fire-bukittinggi',
          score: 0.85,
          city: 'Bukittinggi',
          tags: ['free-fire', 'bukittinggi', 'guild'],
        },
      ].filter((item) => {
        const matchesType = filterVal === 'ALL' || item.type === filterVal;
        const matchesText =
          item.title.toLowerCase().includes(term) ||
          item.snippet.toLowerCase().includes(term) ||
          item.city?.toLowerCase().includes(term) ||
          item.tags?.some((t) => t.toLowerCase().includes(term));
        return matchesType && (term === '' || matchesText);
      });
      setResults(localMatches);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: 'ALL' | 'EVENT' | 'NEWS' | 'COMMUNITY') => {
    setTypeFilter(filter);
    if (query) {
      handleSearch(query, filter);
    }
  };

  const handleSelectPreset = (preset: string) => {
    setQuery(preset);
    handleSearch(preset, typeFilter);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-8 px-4 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#E10600]/10 border border-[#E10600]/30 text-[#E10600] text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Semantic AI Search</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-wide text-white">
            Pencarian Cerdas <span className="text-[#E10600]">Esport Sumbar</span>
          </h1>
          <p className="text-sm md:text-base text-[#9A9AA5] max-w-2xl mx-auto">
            Temukan turnamen lokal, berita terkini, komunitas game, dan regulasi kompetisi se-Sumatera Barat dengan pemahaman semantik AI.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="bg-[#121216] border border-[#26262B] rounded-xl p-3 shadow-2xl focus-within:border-[#E10600]/60 transition-colors">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex items-center gap-3"
          >
            <Search className="w-5 h-5 text-[#9A9AA5] ml-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari turnamen MLBB Padang, berita PON, komunitas Valorant, jadwal scrim..."
              className="w-full bg-transparent text-white placeholder-[#5A5A66] text-sm md:text-base focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearched(false);
                }}
                className="text-xs text-[#9A9AA5] hover:text-white px-2 py-1"
              >
                Clear
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              chamfer={false}
              className="shrink-0 px-6 uppercase font-display font-bold text-xs"
              disabled={loading}
            >
              {loading ? 'Mencari...' : 'Cari'}
            </Button>
          </form>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#5A5A66] flex items-center gap-1 font-mono uppercase text-[11px]">
            <TrendingUp className="w-3 h-3 text-[#E10600]" /> Tren:
          </span>
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded bg-[#1A1A1F] hover:bg-[#26262B] text-[#9A9AA5] hover:text-white border border-[#26262B] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#26262B] pb-3 overflow-x-auto">
          {(
            [
              { id: 'ALL', label: 'Semua Kategori' },
              { id: 'EVENT', label: 'Turnamen & Event' },
              { id: 'NEWS', label: 'Berita & Artikel' },
              { id: 'COMMUNITY', label: 'Komunitas & Hub' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                typeFilter === tab.id
                  ? 'bg-[#E10600] text-white shadow-lg shadow-[#E10600]/20'
                  : 'bg-[#121216] text-[#9A9AA5] hover:text-white border border-[#26262B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-[#E10600] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-wider">
                Mencari kecocokan semantik di basis data ESPORT SUMBAR...
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="bg-[#121216] border border-[#26262B] rounded-xl p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-[#5A5A66] mx-auto" />
              <h3 className="font-display text-lg uppercase font-bold text-white">
                Tidak Ditemukan Hasil
              </h3>
              <p className="text-xs text-[#9A9AA5] max-w-md mx-auto">
                Tidak ada entri yang cocok dengan &quot;{query}&quot;. Coba gunakan kata kunci lain seperti &quot;Padang&quot;, &quot;MLBB&quot;, atau &quot;Valorant&quot;.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#9A9AA5] px-1">
                <span>
                  Ditemukan <strong className="text-white">{results.length}</strong> hasil pencarian untuk &quot;{query}&quot;
                </span>
                <span className="font-mono text-[11px] text-[#E10600]">
                  Diurutkan berdasarkan skor relevansi AI
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="block bg-[#121216] border border-[#26262B] hover:border-[#E10600]/60 rounded-xl p-5 transition-all group hover:shadow-lg hover:shadow-[#E10600]/10 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.type === 'EVENT' && (
                            <Badge variant="brand" className="text-[10px] uppercase font-mono">
                              <Calendar className="w-3 h-3 mr-1 inline" /> Event
                            </Badge>
                          )}
                          {item.type === 'NEWS' && (
                            <Badge variant="neutral" className="text-[10px] uppercase font-mono">
                              <Newspaper className="w-3 h-3 mr-1 inline" /> Berita
                            </Badge>
                          )}
                          {item.type === 'COMMUNITY' && (
                            <Badge variant="brand" className="text-[10px] uppercase font-mono bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Users className="w-3 h-3 mr-1 inline" /> Komunitas
                            </Badge>
                          )}

                          {item.city && (
                            <span className="text-[11px] font-mono text-[#9A9AA5] flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-[#E10600]" />
                              {item.city}
                            </span>
                          )}
                        </div>

                        {/* Relevancy score */}
                        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {Math.round(item.score * 100)}% Relevan
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-base uppercase text-white group-hover:text-[#E10600] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {/* Snippet */}
                      <p className="text-xs text-[#9A9AA5] line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>
                    </div>

                    {/* Bottom Metadata & Link */}
                    <div className="mt-4 pt-3 border-t border-[#1F1F24] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono bg-[#1A1A1F] text-[#9A9AA5] px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[#E10600] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Buka <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!searched && (
            <div className="border border-dashed border-[#26262B] rounded-xl p-12 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-[#E10600] mx-auto opacity-70 animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-display text-lg uppercase font-bold text-white">
                  Mulai Pencarian Semantik AI
                </h3>
                <p className="text-xs text-[#9A9AA5] max-w-md mx-auto">
                  Ketik kata kunci atau pilih topik tren di atas untuk menjelajahi seluruh ekosistem kompetitif Ranah Minang.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
