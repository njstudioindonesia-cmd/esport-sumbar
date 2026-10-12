'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  FileText,
  Megaphone,
  CheckCircle2,
  ArrowLeft,
  Shield,
  BarChart3,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EventDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'minangkabau-esport-cup-season-4';

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'participants' | 'announcements' | 'analytics'
  >('overview');

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/events/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!detail?.event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Turnamen Tidak Ditemukan
        </h1>
        <Link href="/event" className="inline-block mt-4">
          <Button variant="primary">Kembali ke Katalog Event</Button>
        </Link>
      </div>
    );
  }

  const { event, form, participants = [], announcements = [], analytics } = detail;
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] pb-20">
      {/* Broadcast Hero */}
      <section className="border-b border-[#2A2A31] bg-gradient-to-b from-[#1A0D10] via-[#131316] to-[#0B0B0D] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            href="/event"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9AA5] hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 text-[#E10600]" />
            Kembali ke Kalender Event
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{event.gameId}</Badge>
                <Badge variant="warning">{event.scope}</Badge>
                <Badge variant="outline">{event.mode}</Badge>
                <Badge
                  variant={
                    event.status === 'REGISTRATION_OPEN' ? 'success' : 'info'
                  }
                >
                  {event.status}
                </Badge>
              </div>

              <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-xs md:text-sm text-[#9A9AA5]">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#E10600]" />
                  EO: <strong className="text-white">{event.organizerName}</strong>
                </span>
                <span className="flex items-center gap-1.5 tabular-nums">
                  <Calendar className="w-4 h-4 text-[#E10600]" />
                  {new Date(event.startAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E10600]" />
                  {event.location || event.city}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href={`/event/${event.slug}/bracket`}>
                <Button variant="secondary" size="md">
                  Live Bracket & Klasemen
                </Button>
              </Link>
              <Link href={`/eo/event/${event.id}`}>
                <Button variant="secondary" size="md">
                  Kelola di Panel EO
                </Button>
              </Link>
              {event.status === 'REGISTRATION_OPEN' && !event.isExternal && (
                <Link href={`/event/${event.slug}/daftar`}>
                  <Button variant="primary" size="lg">
                    Daftar Turnamen Sekarang
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Key Broadcast Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card chamfer className="p-4 bg-[#131316]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#F5A524]" />
                Prize Pool
              </div>
              <div className="font-display text-2xl font-extrabold text-white tabular-nums mt-1">
                {formatRupiah(event.prizePool)}
              </div>
            </Card>

            <Card chamfer className="p-4 bg-[#131316]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#E10600]" />
                Slot Peserta Approved
              </div>
              <div className="font-display text-2xl font-extrabold text-white tabular-nums mt-1">
                {event.registeredCount} / {event.quota}{' '}
                <span className="text-xs font-normal text-[#9A9AA5]">Tim</span>
              </div>
            </Card>

            <Card chamfer className="p-4 bg-[#131316]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#3B82F6]" />
                Biaya Komitmen / Daftar
              </div>
              <div className="font-display text-2xl font-extrabold text-white tabular-nums mt-1">
                {form?.fee > 0 ? formatRupiah(form.fee) : 'GRATIS'}
              </div>
            </Card>

            <Card chamfer className="p-4 bg-[#131316]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-[#22C55E]" />
                Pengumuman Resmi
              </div>
              <div className="font-display text-2xl font-extrabold text-white tabular-nums mt-1">
                {announcements.length} Bulletin
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Broadcast Navigation Tabs */}
      <div className="border-b border-[#2A2A31] bg-[#131316] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Info, Hadiah & Rulebook' },
            {
              id: 'participants',
              label: `Tim Terdaftar (${participants.length}/${event.quota})`,
            },
            {
              id: 'announcements',
              label: `Pengumuman (${announcements.length})`,
            },
            { id: 'analytics', label: 'Analitik Sebaran Daerah' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-xs md:text-sm font-display font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#E10600] text-white'
                  : 'border-transparent text-[#9A9AA5] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card chamfer className="p-6">
                <h2 className="font-display text-2xl font-bold uppercase text-white mb-3">
                  Deskripsi & Format Kompetisi
                </h2>
                <p className="text-sm md:text-base text-[#F5F5F7]/90 leading-relaxed">
                  {event.description}
                </p>

                {event.prizeDescription && (
                  <div className="mt-6 p-4 bg-[#131316] border border-[#2A2A31] rounded">
                    <div className="text-xs uppercase tracking-wider text-[#F5A524] font-bold mb-1">
                      Distribusi Hadiah & Penghargaan
                    </div>
                    <p className="text-sm text-white">{event.prizeDescription}</p>
                  </div>
                )}
              </Card>

              <Card chamfer className="p-6">
                <h3 className="font-display text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#E10600]" />
                  Data Wajib Pendaftaran (Schema Form Builder EO)
                </h3>
                <div className="space-y-2">
                  {(form?.fields || []).map((field: any) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 bg-[#131316] border border-[#2A2A31] rounded text-sm"
                    >
                      <div>
                        <span className="font-semibold text-white">{field.label}</span>
                        <span className="ml-2 text-xs text-[#9A9AA5]">
                          ({field.type})
                        </span>
                      </div>
                      <Badge variant={field.required ? 'brand' : 'neutral'}>
                        {field.required ? 'WAJIB' : 'OPSIONAL'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card chamfer className="p-6 border-[#E10600]/40">
                <h3 className="font-display text-xl font-bold uppercase text-white mb-3">
                  Dokumen & Rulebook Resmi
                </h3>
                <p className="text-xs text-[#9A9AA5] mb-4">
                  Seluruh kapten dan pemain wajib membaca buku peraturan resmi turnamen
                  sebelum melakukan check-in.
                </p>
                <div className="p-3 bg-[#131316] border border-[#2A2A31] rounded flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-[#E10600]" />
                    <span className="text-white font-medium truncate max-w-[180px]">
                      Rulebook_{event.slug}.pdf
                    </span>
                  </div>
                  <Badge variant="outline">PDF</Badge>
                </div>

                {form?.paymentInstructions && (
                  <div className="p-3 bg-[#131316] border border-[#2A2A31] rounded text-xs text-[#9A9AA5] mb-4">
                    <div className="text-white font-semibold mb-1">
                      Instruksi Pendaftaran:
                    </div>
                    {form.paymentInstructions}
                  </div>
                )}

                {event.status === 'REGISTRATION_OPEN' && !event.isExternal && (
                  <Link href={`/event/${event.slug}/daftar`} className="block">
                    <Button variant="primary" className="w-full">
                      Isi Formulir Pendaftaran
                    </Button>
                  </Link>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participants.length === 0 ? (
              <Card chamfer className="p-8 text-center md:col-span-2">
                <p className="text-sm text-[#9A9AA5]">
                  Belum ada peserta yang disetujui (APPROVED) oleh EO.
                </p>
              </Card>
            ) : (
              participants.map((reg: any, idx: number) => (
                <Card key={reg.id} chamfer className="p-5 bg-[#1C1C21]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-[#9A9AA5] tabular-nums">
                        SEED #{idx + 1} · KOTA ASAL:{' '}
                        <span className="text-white font-semibold">
                          {reg.city || 'Sumbar'}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold uppercase text-white mt-0.5">
                        {reg.teamName || reg.userNickname}
                      </h3>
                      <div className="text-xs text-[#9A9AA5]">
                        Kapten: <span className="text-white">{reg.userNickname}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="success">APPROVED</Badge>
                      {reg.checkedIn && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SUDAH CHECK-IN
                        </span>
                      )}
                    </div>
                  </div>

                  {reg.teamMembers && reg.teamMembers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#2A2A31] grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {reg.teamMembers.map((m: any, mIdx: number) => (
                        <div
                          key={mIdx}
                          className="p-2 bg-[#131316] rounded border border-[#2A2A31]/70 text-xs"
                        >
                          <div className="font-semibold text-white truncate">
                            {m.nickname}
                          </div>
                          <div className="text-[10px] text-[#9A9AA5] tabular-nums">
                            {m.role || 'Player'} · {m.gameId}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4 max-w-4xl">
            {announcements.map((ann: any) => (
              <Card
                key={ann.id}
                chamfer
                className={`p-5 ${
                  ann.important ? 'border-[#E10600]' : 'border-[#2A2A31]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {ann.important && <Badge variant="brand">PENTING / WAJIB</Badge>}
                    <h3 className="font-display text-xl font-bold uppercase text-white">
                      {ann.title}
                    </h3>
                  </div>
                  <span className="text-xs text-[#9A9AA5] tabular-nums">
                    {new Date(ann.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-sm text-[#F5F5F7]/90">{ann.content}</p>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <Card chamfer className="p-6 max-w-3xl">
            <h3 className="font-display text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#E10600]" />
              Sebaran Kota / Kabupaten Pendaftar Sumatera Barat
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics?.cityDistribution || {}).map(
                ([city, count]: [string, any]) => (
                  <div key={city} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white">{city}</span>
                      <span className="text-[#E10600] tabular-nums">{count} Tim</span>
                    </div>
                    <div className="w-full h-2 bg-[#131316] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#E10600]"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (Number(count) /
                                Math.max(1, analytics?.totalApplicants || 1)) *
                                100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
