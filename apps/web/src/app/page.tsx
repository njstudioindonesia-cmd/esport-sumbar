import React from 'react';
import Link from 'next/link';
import {
  MOCK_LIVE_TICKER,
  MOCK_ARTICLES,
  MOCK_EVENTS,
} from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Trophy,
  Crown,
  Medal,
  ChevronRight,
  Radio,
  Flame,
  ExternalLink,
  Calendar,
  MapPin,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons';
import { AiRecommendationsSection } from '@/components/ai-recommendations';

export default function HomePage() {
  const leadArticle = MOCK_ARTICLES[0]!;
  const sideArticles = MOCK_ARTICLES.slice(1, 4);

  const regionalLeaderboard = [
    { rank: 1, city: 'Kota Padang', points: 4850, activeTeams: 142, championCount: 18, eloBadge: 'Tier 1' },
    { rank: 2, city: 'Kota Bukittinggi', points: 3920, activeTeams: 98, championCount: 12, eloBadge: 'Tier 1' },
    { rank: 3, city: 'Kota Payakumbuh', points: 3100, activeTeams: 74, championCount: 8, eloBadge: 'Tier 2' },
    { rank: 4, city: 'Kota Solok', points: 2640, activeTeams: 56, championCount: 5, eloBadge: 'Tier 2' },
    { rank: 5, city: 'Kota Pariaman', points: 2210, activeTeams: 48, championCount: 4, eloBadge: 'Tier 3' },
  ];

  const instagramFeeds = [
    {
      id: 'ig-1',
      title: 'Pendaftaran Kualifikasi Mobile Legends Padang Cup Season 4 Resmi Dibuka!',
      game: 'Mobile Legends',
      likes: '1.420',
      date: '2 Jam Lalu',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      permalink: 'https://www.instagram.com/p/DB123mlbb01/',
      slug: 'pendaftaran-kualifikasi-mobile-legends-padang-cup-season-4',
    },
    {
      id: 'ig-2',
      title: 'Padang Slayers Raih Juara 1 Valorant Minang Pride Cup 2026!',
      game: 'Valorant',
      likes: '984',
      date: '1 Hari Lalu',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
      permalink: 'https://www.instagram.com/p/DB124val02/',
      slug: 'padang-slayers-raih-juara-1-valorant-minang-pride-cup-2026',
    },
    {
      id: 'ig-3',
      title: 'Piala Gubernur Esport Sumatera Barat 2026 Digelar Serentak di Bukittinggi',
      game: 'Free Fire',
      likes: '2.105',
      date: '2 Hari Lalu',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=600&q=80',
      permalink: 'https://www.instagram.com/p/DB125ff03/',
      slug: 'piala-gubernur-esport-sumatera-barat-2026',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#08080A] text-[#F5F5F7] antialiased">
      {/* 1. Marawa Match Ticker Bar */}
      <div className="bg-[#121217] border-b border-[#2A2A38] text-xs py-2.5 px-4 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#F5B700] font-display font-black uppercase tracking-wider shrink-0">
            <Radio className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
            <span>SUMBAR LEAGUE LIVE SCORE</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto text-[11px] no-scrollbar">
            {MOCK_LIVE_TICKER.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 bg-[#181822] px-3 py-1 rounded border border-[#2A2A38] shrink-0"
              >
                <span className="text-[#9A9AA5] uppercase font-mono">{m.game}:</span>
                <span className="font-semibold text-white">{m.teamA}</span>
                <span className="font-mono tabular-nums text-[#F5B700] font-bold px-1.5 py-0.5 rounded bg-[#08080A] border border-[#2A2A38]">
                  {m.scoreA} - {m.scoreB}
                </span>
                <span className="font-semibold text-white">{m.teamB}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                  m.status === 'LIVE' ? 'bg-[#E10600]/20 text-[#FF4D4D]' : 'text-[#9A9AA5]'
                }`}>
                  ({m.round})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Hero Section: Ranah Minang Modern & Cyber Minangkabau */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden border-b border-[#2A2A38] bg-gradient-to-b from-[#140D04] via-[#0B0B0E] to-[#08080A]">
        {/* Minang Marawa (Hitam, Merah, Kuning) Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[320px] bg-[#F5B700]/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-12 left-10 w-[420px] h-[300px] bg-[#E10600]/15 blur-[120px] pointer-events-none rounded-full" />

        {/* Cyber Songket Geometric Pattern Backdrop */}
        <div className="absolute inset-0 bg-cyber-songket pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F5B700]/15 border border-[#F5B700]/40 text-[#F5B700] text-xs font-black uppercase tracking-widest shadow-sm shadow-[#F5B700]/10">
              <Crown className="w-3.5 h-3.5" />
              MARAWA ESPORT SUMATERA BARAT
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.96]">
              BANGKITKAN JAWARA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5B700] via-[#E10600] to-[#FF4D4D]">
                RANAH MINANG
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#9A9AA5] max-w-xl leading-relaxed">
              Wadah ekosistem kompetisi resmi atlet esport di 19 kota & kabupaten Sumatera Barat. Dari Jam Gadang Bukittinggi hingga Pantai Padang, buktikan kehebatan tim Anda di panggung regional dan nasional.
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
                  className="chamfer-btn bg-[#181822] hover:bg-[#22222E] border border-[#2A2A38] text-white font-display font-bold text-sm uppercase tracking-wider px-6 py-3.5 flex items-center gap-2 transition-colors"
                >
                  <Crown className="w-4 h-4 text-[#F5B700]" />
                  Komunitas 19 Wilayah
                </button>
              </Link>
            </div>

            {/* Quick Regional Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2A2A38] max-w-lg">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#9A9AA5] tracking-wider">Wilayah Aktif</div>
                <div className="font-display text-2xl font-black text-white tabular-nums">19 Kota/Kab</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#9A9AA5] tracking-wider">Tim Terdaftar</div>
                <div className="font-display text-2xl font-black text-[#F5B700] tabular-nums">480+ Tim</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#9A9AA5] tracking-wider">Total Hadiah 2026</div>
                <div className="font-display text-2xl font-black text-white tabular-nums">Rp 150 Jt+</div>
              </div>
            </div>
          </div>

          {/* Regional Pride Spotlight: Klasemen Daerah Sumbar */}
          <div className="lg:col-span-5">
            <div className="bg-[#121217] border border-[#F5B700]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden chamfer-card">
              <div className="flex items-center justify-between pb-4 border-b border-[#2A2A38]">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-[#F5B700]" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    KLASEMEN KOTA / KABUPATEN
                  </span>
                </div>
                <Badge variant="marawa">SUMBAR LEAGUE</Badge>
              </div>

              <div className="divide-y divide-[#2A2A38]/70 my-2">
                {regionalLeaderboard.map((r) => (
                  <div key={r.rank} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${
                        r.rank === 1 ? 'bg-[#F5B700] text-black font-black shadow-md shadow-[#F5B700]/20' :
                        r.rank === 2 ? 'bg-[#E10600] text-white font-bold' :
                        'bg-[#181822] text-[#9A9AA5] border border-[#2A2A38]'
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
                      <div className="text-[10px] text-emerald-400 font-semibold">{r.eloBadge}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#2A2A38] text-center">
                <Link href="/komunitas" className="text-xs text-[#F5B700] hover:underline font-bold inline-flex items-center gap-1">
                  Lihat Peringkat Lengkap 19 Kota/Kabupaten
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Agenda Kompetisi & Turnamen Daerah */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full border-b border-[#2A2A38]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-black uppercase text-[#F5B700] tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              AGENDA KOMPETISI KULTURAL
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-white mt-1">
              Turnamen Bergengsi Sumatera Barat
            </h2>
          </div>
          <Link
            href="/event"
            className="text-xs font-display font-bold uppercase tracking-wider text-[#F5B700] hover:text-white flex items-center gap-1 transition-colors"
          >
            Semua Turnamen <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_EVENTS.slice(0, 3).map((evt) => (
            <Card
              key={evt.id}
              chamfer
              ticketNotch
              className="p-6 bg-[#121217] border-[#2A2A38] hover:border-[#F5B700] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="marawa">{evt.gameId}</Badge>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {evt.status === 'REGISTRATION_OPEN' ? 'PENDAFTARAN BUKA' : evt.status}
                  </span>
                </div>

                <h3 className="font-display text-xl font-black uppercase text-white group-hover:text-[#F5B700] transition-colors leading-tight">
                  {evt.title}
                </h3>

                <p className="text-xs text-[#9A9AA5] line-clamp-2">
                  {evt.prizeDescription || 'Turnamen resmi dengan kualifikasi atlet daerah.'}
                </p>

                <div className="flex flex-col gap-1 text-xs text-[#9A9AA5] pt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#F5B700]" />
                    <span>{new Date(evt.startAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>{evt.location || 'Kota Padang, Sumbar'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2A2A38] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#9A9AA5] uppercase font-bold">Total Hadiah</div>
                  <div className="font-display text-base font-black text-[#F5B700] tabular-nums">
                    Rp {evt.prizePool.toLocaleString('id-ID')}
                  </div>
                </div>
                <Link href={`/event/${evt.slug}/daftar`}>
                  <button
                    type="button"
                    className="chamfer-btn bg-[#F5B700] hover:bg-[#D9A100] text-black font-display font-black text-xs uppercase px-4 py-2 transition-transform hover:scale-105"
                  >
                    Daftar Tim
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Section: Trending Dari @esportsumbar (Meta Graph API Official Feed) */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full border-b border-[#2A2A38]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-gradient-to-tr from-[#F5B700] via-[#E10600] to-purple-600 rounded-sm inline-block" />
              <span className="text-xs uppercase tracking-widest font-black text-[#F5B700]">
                META GRAPH API OFFICIAL FEED
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white">
              Trending Dari <span className="text-[#F5B700]">@esportsumbar</span>
            </h2>
          </div>

          <a
            href="https://instagram.com/esportsumbar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#121217] hover:bg-[#181822] border border-[#2A2A38] text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            Follow @esportsumbar di Instagram
            <ExternalLink className="w-3.5 h-3.5 text-[#F5B700]" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {instagramFeeds.map((item) => (
            <Card
              key={item.id}
              chamfer
              className="p-5 bg-[#121217] border-[#2A2A38] hover:border-[#F5B700]/60 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-44 rounded-lg bg-[#181822] overflow-hidden relative border border-[#2A2A38]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="marawa">{item.game}</Badge>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-white font-mono">
                    ❤️ {item.likes}
                  </div>
                </div>

                <div className="text-[11px] text-[#9A9AA5]">{item.date}</div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#F5B700] transition-colors leading-snug">
                  {item.title}
                </h3>
              </div>

              <div className="pt-4 mt-4 border-t border-[#2A2A38] flex items-center justify-between text-xs">
                <span className="text-[#9A9AA5]">Postingan Resmi IG</span>
                <span className="text-[#F5B700] font-bold group-hover:underline inline-flex items-center gap-1">
                  Lihat Detail
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Section: Rekomendasi Cerdas AI */}
      <AiRecommendationsSection />

      {/* 6. Section: Headline Berita & Liputan Khusus Esport Sumbar */}
      <section className="max-w-7xl mx-auto w-full px-4 py-14">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#2A2A38]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#F5B700] chamfer-badge"></div>
            <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
              Liputan Berita Ranah Minang
            </h2>
          </div>
          <Link
            href="/berita"
            className="text-xs font-display font-bold uppercase tracking-wider text-[#F5B700] hover:text-white flex items-center gap-1 transition-colors"
          >
            Semua Berita <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lead Editorial Article */}
          <div className="lg:col-span-7 bg-[#121217] border border-[#2A2A38] rounded-xl p-6 chamfer-card relative group hover:border-[#F5B700]/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="marawa">{leadArticle.category}</Badge>
                <Badge variant="neutral">{leadArticle.gameId}</Badge>
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#F5B700] font-semibold ml-auto">
                  <Flame className="w-3.5 h-3.5 text-[#E10600]" />
                  VIRAL {leadArticle.viralScore}%
                </span>
              </div>

              <Link href={`/berita/${leadArticle.slug}`}>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight group-hover:text-[#F5B700] transition-colors">
                  {leadArticle.title}
                </h3>
              </Link>

              <p className="text-[#9A9AA5] text-sm leading-relaxed">
                {leadArticle.summary}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#2A2A38] flex items-center justify-between text-xs text-[#9A9AA5]">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Sumber: {leadArticle.sourceName}</span>
                <span>•</span>
                <span>2 Jam Lalu</span>
              </div>
              <Link
                href={`/berita/${leadArticle.slug}`}
                className="font-bold text-[#F5B700] hover:underline flex items-center gap-1"
              >
                Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Side Editorial Articles */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {sideArticles.map((art) => (
              <Link
                key={art.id}
                href={`/berita/${art.slug}`}
                className="p-4 rounded-xl bg-[#121217] border border-[#2A2A38] hover:border-[#F5B700]/50 transition-all group flex flex-col justify-between flex-1"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-[#F5B700] font-mono uppercase font-bold">
                      {art.category} • {art.gameId}
                    </span>
                    <span className="text-[#9A9AA5]">3 Jam Lalu</span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#F5B700] transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#9A9AA5]">
                  <span>{art.sourceName}</span>
                  <span className="text-[#F5B700] group-hover:underline flex items-center">
                    Baca <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Section: Dari Instagram @esportsumbar */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full border-t border-[#2A2A38]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                <InstagramIcon className="w-3 h-3" />
              </div>
              <span className="text-xs uppercase font-mono tracking-widest font-extrabold text-[#F5B700]">
                Official Meta Instagram Feed
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wide text-white">
              Dari Instagram @esportsumbar
            </h2>
            <p className="text-xs text-[#9A9AA5] mt-1 max-w-xl">
              Liputan visual turnamen, pengumuman jadwal, dan momen juara langsung dari feed resmi Meta Graph API.
            </p>
          </div>

          <Link
            href="https://www.instagram.com/esportsumbar"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-opacity shadow-lg shadow-rose-600/20 shrink-0"
          >
            <InstagramIcon className="w-4 h-4" />
            Ikuti @esportsumbar
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {instagramFeeds.map((feed) => (
            <Card
              key={feed.id}
              chamfer
              className="p-4 bg-[#121217] border-[#2A2A38] hover:border-[#F5B700]/50 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-48 rounded-lg overflow-hidden bg-neutral-900 border border-[#2A2A38]">
                  <img
                    src={feed.image}
                    alt={feed.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <Badge variant="marawa">{feed.game}</Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    {feed.likes}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#9A9AA5] font-mono">{feed.date}</span>
                  <Link href={`/berita/${feed.slug}`}>
                    <h3 className="font-bold text-sm text-white group-hover:text-[#F5B700] transition-colors leading-snug line-clamp-2 mt-0.5">
                      {feed.title}
                    </h3>
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A2A38] flex items-center justify-between text-xs">
                <Link
                  href={`/berita/${feed.slug}`}
                  className="font-bold text-white hover:text-[#F5B700] flex items-center gap-1 text-[11px]"
                >
                  Baca Warta <ChevronRight className="w-3 h-3" />
                </Link>
                <Link
                  href={feed.permalink}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F5B700] hover:underline"
                >
                  Buka di IG
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
