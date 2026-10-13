'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Search,
  Bell,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

interface EventItem {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  slug: string;
  description: string;
  gameId: string;
  scope: 'SUMBAR' | 'NASIONAL' | 'GLOBAL';
  mode: 'ONLINE' | 'OFFLINE';
  location?: string | null;
  city?: string | null;
  startAt: string;
  endAt: string;
  prizePool: number;
  prizeDescription?: string;
  status: 'DRAFT' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  isExternal: boolean;
  externalUrl?: string | null;
  participantType: 'INDIVIDUAL' | 'TEAM' | 'BOTH';
  registeredCount: number;
  quota: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EventCatalogPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<string>('ALL');
  const [gameId, setGameId] = useState<string>('ALL');
  const [mode, setMode] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (scope !== 'ALL') params.set('scope', scope);
        if (gameId !== 'ALL') params.set('gameId', gameId);
        if (mode !== 'ALL') params.set('mode', mode);
        if (status !== 'ALL') params.set('status', status);
        if (search.trim()) params.set('search', search.trim());

        const res = await fetch(`${API_BASE}/events?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch {
        // Fallback handled gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [scope, gameId, mode, status, search]);

  const toggleReminder = (evt: EventItem) => {
    if (remindedIds.includes(evt.id)) {
      setRemindedIds((prev) => prev.filter((id) => id !== evt.id));
      toast({
        type: 'info',
        title: 'Pengingat Dibatalkan',
        message: `Notifikasi pengingat untuk "${evt.title}" dinonaktifkan.`,
      });
    } else {
      setRemindedIds((prev) => [...prev, evt.id]);
      toast({
        type: 'success',
        title: 'Pengingat Kalender Aktif',
        message: `Kami akan mengirimkan pengingat H-1 sebelum "${evt.title}" dimulai.`,
      });
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F7] pb-20">
      {/* Broadcast Top Header */}
      <section className="relative border-b border-[#2A2A38] bg-gradient-to-b from-[#140D04] via-[#0B0B0E] to-[#08080A] py-12 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-songket opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="marawa">KALENDER KOMPETISI RESMI</Badge>
                <Badge variant="outline">19 KOTA/KABUPATEN · NASIONAL · GLOBAL</Badge>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
                Turnamen & <span className="text-[#F5B700]">Event Ranah Minang</span>
              </h1>
              <p className="text-[#9A9AA5] mt-2 max-w-2xl text-sm md:text-base">
                Temukan turnamen lokal di 19 kota & kabupaten Sumatera Barat hingga kualifikasi tingkat nasional. Daftar
                sebagai individu, skuad, atau kontingen komunitas daerah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href="http://localhost:3001" className="inline-flex">
                <Button variant="secondary" size="md">
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-[#F5B700]" />
                  EO Studio
                </Button>
              </a>
              <a href="http://localhost:3001/event/baru" className="inline-flex">
                <Button variant="marawa" size="md">
                  <PlusCircle className="w-4 h-4 mr-2 text-black" />
                  Buat Event / Turnamen
                </Button>
              </a>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-8 p-4 bg-[#131316] border border-[#2A2A31] rounded grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-[#9A9AA5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari turnamen, kota (Padang, Bukittinggi), atau venue..."
                className="w-full bg-[#0B0B0D] border border-[#2A2A31] focus:border-[#E10600] rounded pl-9 pr-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="bg-[#0B0B0D] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
            >
              <option value="ALL">Semua Cakupan Lokasi</option>
              <option value="SUMBAR">Sumatera Barat (Lokal)</option>
              <option value="NASIONAL">Nasional (Indonesia)</option>
              <option value="GLOBAL">Global (Internasional)</option>
            </select>

            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="bg-[#0B0B0D] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
            >
              <option value="ALL">Semua Game</option>
              <option value="MLBB">Mobile Legends (MLBB)</option>
              <option value="VALORANT">Valorant</option>
              <option value="FREE_FIRE">Free Fire</option>
              <option value="PUBG_MOBILE">PUBG Mobile</option>
              <option value="EFOOTBALL">eFootball</option>
            </select>

            <div className="flex gap-2">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="flex-1 bg-[#0B0B0D] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
              >
                <option value="ALL">Semua Mode</option>
                <option value="OFFLINE">Offline (LAN)</option>
                <option value="ONLINE">Online</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 bg-[#0B0B0D] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="REGISTRATION_OPEN">Buka Daftar</option>
                <option value="ONGOING">Berlangsung</option>
                <option value="COMPLETED">Selesai</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Match Ticket Event Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#9A9AA5] font-semibold">
            <Filter className="w-4 h-4 text-[#E10600]" />
            Menampilkan <span className="text-white tabular-nums">{events.length}</span> Event
            Kompetitif
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-64 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card chamfer className="p-12 text-center border-[#2A2A31]">
            <Trophy className="w-12 h-12 text-[#9A9AA5] mx-auto mb-3 opacity-50" />
            <h3 className="font-display text-2xl font-bold uppercase text-white">
              Tidak Ada Turnamen yang Cocok
            </h3>
            <p className="text-sm text-[#9A9AA5] mt-1">
              Coba ubah filter cakupan daerah, game, atau kata kunci pencarian Anda.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((evt) => {
              const isReminded = remindedIds.includes(evt.id);
              const fillPercent = Math.min(
                100,
                Math.round((evt.registeredCount / Math.max(1, evt.quota)) * 100),
              );

              return (
                <Card
                  key={evt.id}
                  chamfer
                  ticketNotch
                  className="p-0 overflow-hidden border-[#2A2A31] hover:border-[#E10600]/70 transition-colors flex flex-col justify-between"
                >
                  {/* Ticket Top Strip */}
                  <div className="px-6 py-3 bg-[#131316] border-b border-[#2A2A31] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="brand">{evt.gameId}</Badge>
                      <Badge
                        variant={
                          evt.scope === 'SUMBAR'
                            ? 'warning'
                            : evt.scope === 'NASIONAL'
                              ? 'info'
                              : 'neutral'
                        }
                      >
                        {evt.scope}
                      </Badge>
                      <Badge variant="outline">{evt.mode}</Badge>
                    </div>

                    <Badge
                      variant={
                        evt.status === 'REGISTRATION_OPEN'
                          ? 'success'
                          : evt.status === 'ONGOING'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {evt.status === 'REGISTRATION_OPEN'
                        ? 'PENDAFTARAN DIBUKA'
                        : evt.status === 'ONGOING'
                          ? 'LIVE / BERLANGSUNG'
                          : evt.status}
                    </Badge>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#9A9AA5] mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E10600]" />
                        <span>{evt.organizerName}</span>
                        {evt.isExternal && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-[#2A2A31] text-[#F5F5F7]">
                            SUMBER EKSTERNAL TERKURASI
                          </span>
                        )}
                      </div>

                      <Link href={`/event/${evt.slug}`}>
                        <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-white hover:text-[#E10600] transition-colors">
                          {evt.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-[#9A9AA5] mt-2 line-clamp-2">
                        {evt.description}
                      </p>

                      {/* Meta Grid */}
                      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#2A2A31]/70 text-xs">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[#9A9AA5]">Jadwal Kick-off</div>
                            <div className="text-white font-semibold tabular-nums">
                              {new Date(evt.startAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[#9A9AA5]">Lokasi / Server</div>
                            <div className="text-white font-semibold truncate max-w-[180px]">
                              {evt.location || evt.city || 'Online Server'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prize Pool & Quota Progress */}
                    <div className="mt-6 pt-4 border-t border-dashed border-[#2A2A31]">
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-[#9A9AA5] flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-[#F5A524]" />
                            Total Prize Pool
                          </div>
                          <div className="font-display text-2xl font-extrabold text-white tabular-nums">
                            {formatRupiah(evt.prizePool)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-wider text-[#9A9AA5] flex items-center justify-end gap-1">
                            <Users className="w-3.5 h-3.5 text-[#E10600]" />
                            Slot Terisi
                          </div>
                          <div className="font-display text-lg font-bold text-white tabular-nums">
                            {evt.registeredCount}{' '}
                            <span className="text-[#9A9AA5]">/ {evt.quota} Tim</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-[#0B0B0D] rounded overflow-hidden mb-5">
                        <div
                          className="h-full bg-[#E10600] transition-all"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleReminder(evt)}
                          className={`px-3 py-2 rounded border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isReminded
                              ? 'bg-[#E10600]/15 border-[#E10600] text-[#FF3B30]'
                              : 'bg-[#131316] border-[#2A2A31] text-[#9A9AA5] hover:text-white'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          {isReminded ? 'Pengingat Aktif' : 'Ingatkan Saya'}
                        </button>

                        <div className="flex items-center gap-2">
                          <Link href={`/event/${evt.slug}`}>
                            <Button variant="secondary" size="sm">
                              Detail Event
                            </Button>
                          </Link>

                          {evt.isExternal && evt.externalUrl ? (
                            <a
                              href={evt.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="primary" size="sm">
                                Situs Resmi
                                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                              </Button>
                            </a>
                          ) : evt.status === 'REGISTRATION_OPEN' ? (
                            <Link href={`/event/${evt.slug}/daftar`}>
                              <Button variant="primary" size="sm">
                                Daftar Sekarang
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
