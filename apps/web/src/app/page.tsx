import Link from 'next/link';
import {
  MOCK_LIVE_TICKER,
  MOCK_ARTICLES,
  MOCK_EVENTS,
  MOCK_COMMUNITIES,
} from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Flame,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Radio,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const leadArticle = MOCK_ARTICLES[0]!;
  const sideArticles = MOCK_ARTICLES.slice(1, 4);

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. Live Match Ticker Bar */}
      <div className="bg-dark-800/90 border-b border-line text-xs py-2 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-6 whitespace-nowrap">
          <div className="flex items-center gap-2 text-brand-400 font-display font-extrabold uppercase shrink-0">
            <Radio className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
            <span>LIVE STANDINGS // SUMBAR</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto text-[11px] no-scrollbar">
            {MOCK_LIVE_TICKER.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-dark-900/60 px-3 py-1 rounded border border-line shrink-0"
              >
                <span className="text-accent-text400 uppercase font-mono">{m.game}:</span>
                <span className="font-semibold text-white">{m.teamA}</span>
                <span className="font-mono tabular-nums text-brand-400 font-bold px-1.5 py-0.5 rounded bg-dark-700">
                  {m.scoreA} - {m.scoreB}
                </span>
                <span className="font-semibold text-white">{m.teamB}</span>
                <span className="text-[10px] text-accent-text400">({m.round})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Editorial News Grid (Hero Section) */}
      <section className="max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-brand-500 chamfer-badge"></div>
            <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
              Headline Berita Esport
            </h2>
          </div>
          <Link
            href="/berita"
            className="text-xs font-display font-bold uppercase tracking-wider text-brand-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Semua Berita <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Massive Lead Editorial Article */}
          <div className="lg:col-span-7 bg-dark-800 border border-line rounded-lg p-6 chamfer-card relative group hover:border-brand-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{leadArticle.category}</Badge>
                <Badge variant="neutral">{leadArticle.gameId}</Badge>
                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold ml-auto">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  VIRAL {leadArticle.viralScore}%
                </span>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight group-hover:text-brand-400 transition-colors">
                {leadArticle.title}
              </h3>

              <p className="text-accent-text400 text-sm leading-relaxed">
                {leadArticle.summary}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-line flex items-center justify-between text-xs text-accent-text400">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Sumber: {leadArticle.sourceName}</span>
                <span>•</span>
                <span>2 Jam Lalu</span>
              </div>
              <Link
                href={`/berita/${leadArticle.slug}`}
                className="text-brand-400 font-bold uppercase tracking-wider hover:underline flex items-center gap-1 font-display"
              >
                Baca Lengkap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Side Editorial Articles */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {sideArticles.map((art) => (
              <div
                key={art.id}
                className="bg-dark-800 border border-line rounded-lg p-4 chamfer-card hover:border-brand-500/40 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge size="sm" variant="outline">
                      {art.category}
                    </Badge>
                    <span className="text-[10px] text-accent-text400 ml-auto font-mono">
                      {art.sourceName}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base uppercase text-white leading-snug group-hover:text-brand-400 transition-colors line-clamp-2">
                    {art.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-accent-text400">
                  <span>Viral Score: {art.viralScore}%</span>
                  <Link
                    href={`/berita/${art.slug}`}
                    className="text-brand-400 font-bold font-display uppercase hover:underline"
                  >
                    Detail →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Upcoming Tournaments & Event Organizer Section */}
      <section className="bg-dark-900/60 border-y border-line py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 pb-2 border-b border-line">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-brand-500 chamfer-badge"></div>
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                  Turnamen & Event Terdekat
                </h2>
                <p className="text-xs text-accent-text400">
                  Daftarkan tim atau kontingen komunitas ke kompetisi se-Sumatera Barat
                </p>
              </div>
            </div>
            <Link
              href="/event"
              className="text-xs font-display font-bold uppercase tracking-wider text-brand-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Lihat Kalender Event <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_EVENTS.map((event) => (
              <Card key={event.id} className="flex flex-col justify-between hover:border-brand-500/60 transition-colors group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={event.scope === 'SUMBAR' ? 'brand' : 'info'}>
                      {event.scope}
                    </Badge>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      PENDAFTARAN BUKA
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-brand-400 transition-colors">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-[11px] text-accent-text400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>{event.location}</span>
                  </CardDescription>
                </CardHeader>

                <div className="px-5 py-3 bg-dark-900/70 border-y border-line space-y-1">
                  <span className="text-[10px] text-accent-text400 uppercase tracking-widest font-mono">
                    Total Prize Pool
                  </span>
                  <div className="text-xl font-display font-extrabold text-white tracking-wide">
                    Rp {event.prizePool.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[10px] text-accent-text400 line-clamp-1">
                    {event.prizeDescription}
                  </p>
                </div>

                <CardFooter className="pt-4">
                  <div className="flex items-center gap-1 text-[11px] text-accent-text400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(event.startAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <Link href={`/event/${event.slug}/daftar`}>
                    <Button size="sm" variant="primary">
                      Daftar Tim
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Official Communities per Game in Sumbar */}
      <section className="max-w-7xl mx-auto w-full px-4 py-12">
        <div className="flex items-center justify-between mb-8 pb-2 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-brand-500 chamfer-badge"></div>
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                Komunitas Esport Daerah
              </h2>
              <p className="text-xs text-accent-text400">
                Wadah scrim, diskusi, dan koordinasi kontingen atlet 19 Kota/Kabupaten
              </p>
            </div>
          </div>
          <Link
            href="/komunitas"
            className="text-xs font-display font-bold uppercase tracking-wider text-brand-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Jelajahi Komunitas <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_COMMUNITIES.map((com) => (
            <div
              key={com.id}
              className="bg-dark-800 border border-line rounded-lg p-5 chamfer-card hover:border-brand-500/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-dark-700 text-accent-text400 border border-line">
                    {com.region}
                  </span>
                  <Badge size="sm" variant={com.type === 'OFFICIAL' ? 'brand' : 'neutral'}>
                    {com.type}
                  </Badge>
                </div>
                <h4 className="font-display font-bold text-base uppercase text-white leading-tight mb-2">
                  {com.name}
                </h4>
                <p className="text-xs text-accent-text400 line-clamp-2 leading-relaxed">
                  {com.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-line flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-accent-text400 font-mono">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  {com.memberCount.toLocaleString('id-ID')} Member
                </span>
                <Link href={`/komunitas/${com.slug}`}>
                  <Button size="sm" variant="secondary" chamfer={false}>
                    Join
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. EO Hub Banner & Styleguide Shortcut */}
      <section className="max-w-7xl mx-auto w-full px-4 pb-16">
        <div className="bg-dark-800 border border-line rounded-xl p-8 chamfer-card relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" />
              <span className="text-xs font-display font-bold uppercase tracking-widest text-brand-400">
                Portal Event Organizer (EO)
              </span>
            </div>
            <h3 className="font-display font-black text-2xl uppercase tracking-wide text-white">
              Punya Komunitas atau Ingin Gelar Turnamen di Sumbar?
            </h3>
            <p className="text-xs text-accent-text400 leading-relaxed">
              Dapatkan tools pendaftaran peserta, penyimpanan berkas event privat, dan builder bracket Single/Double Elimination custom dengan update skor real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/profil">
              <Button variant="primary">Ajukan Akun EO</Button>
            </Link>
            <Link href="/styleguide">
              <Button variant="outline" leftIcon={<Layers className="w-4 h-4" />}>
                Review Styleguide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
