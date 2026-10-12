'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Settings,
  HardDrive,
  FileSpreadsheet,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EoDashboardPage() {
  const { toast } = useToast();
  const [organizerId, setOrganizerId] = useState<'user-eo-1' | 'user-eo-2'>(
    'user-eo-1',
  );
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isolationTestResult, setIsolationTestResult] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setIsolationTestResult(null);
      try {
        const res = await fetch(
          `${API_BASE}/eo/dashboard?organizerId=${organizerId}`,
          {
            headers: {
              'x-user-id': organizerId,
              'x-user-role': 'ORGANIZER',
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setDashboard(data);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [organizerId]);

  const runCrossTenantSecurityCheck = async () => {
    const targetEventId =
      organizerId === 'user-eo-1'
        ? 'evt-ff-bukittinggi-clash'
        : 'evt-minangkabau-cup-2026';

    try {
      const res = await fetch(
        `${API_BASE}/eo/events/${targetEventId}?organizerId=${organizerId}`,
        {
          headers: {
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
        },
      );
      const body = await res.json();
      if (res.status === 403) {
        const msg = `[HTTP 403 FORBIDDEN] ${body.message}`;
        setIsolationTestResult(msg);
        toast({
          type: 'success',
          title: 'Tenant Isolation Terverifikasi!',
          message: 'Akses lintas EO ditolak otomatis oleh Event Service.',
        });
      }
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-10 px-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Tenant Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#2A2A31]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand">EO COMMAND CENTER</Badge>
              <Badge variant="outline">TENANT ISOLATED WORKSPACE</Badge>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
              Dashboard <span className="text-[#E10600]">Event Organizer</span>
            </h1>
            <p className="text-sm text-[#9A9AA5] mt-1">
              Kelola turnamen, Form Builder dinamis, verifikasi peserta, export CSV, dan
              Event Storage terisolasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#131316] border border-[#2A2A31] rounded p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOrganizerId('user-eo-1')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                  organizerId === 'user-eo-1'
                    ? 'bg-[#E10600] text-white'
                    : 'text-[#9A9AA5] hover:text-white'
                }`}
              >
                EO 1: Minang Pro (Padang)
              </button>
              <button
                type="button"
                onClick={() => setOrganizerId('user-eo-2')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                  organizerId === 'user-eo-2'
                    ? 'bg-[#E10600] text-white'
                    : 'text-[#9A9AA5] hover:text-white'
                }`}
              >
                EO 2: Bukittinggi Hub
              </button>
            </div>

            <Link href="/eo/event/baru">
              <Button variant="primary" size="md">
                <PlusCircle className="w-4 h-4 mr-2" />
                Buat Turnamen Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* Tenant Isolation Verification Strip */}
        <Card chamfer className="p-4 bg-[#131316] border-[#2A2A31]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="text-white font-bold uppercase tracking-wider">
                  Proteksi Tenant Isolation Aktif (Tenant ID: {organizerId})
                </div>
                <p className="text-[#9A9AA5] mt-0.5">
                  Setiap endpoint EO memverifikasi kepemilikan event & storage bucket. EO
                  tidak dapat melihat peserta atau file milik EO lain.
                </p>
                {isolationTestResult && (
                  <div className="mt-2 p-2 bg-[#0B0B0D] border border-[#E10600]/60 rounded font-mono text-[11px] text-[#FF3B30]">
                    {isolationTestResult}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={runCrossTenantSecurityCheck}
            >
              <ShieldAlert className="w-4 h-4 mr-1.5 text-[#F5A524]" />
              Simulasi Akses Event EO Lain (Uji 403)
            </Button>
          </div>
        </Card>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card chamfer className="p-5 bg-[#1C1C21]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#E10600]" />
                Event Milik EO
              </div>
              <div className="font-display text-3xl font-extrabold text-white tabular-nums mt-1">
                {dashboard?.summary?.totalEvents ?? 0}
              </div>
            </Card>

            <Card chamfer className="p-5 bg-[#1C1C21]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#3B82F6]" />
                Total Pendaftar Masuk
              </div>
              <div className="font-display text-3xl font-extrabold text-white tabular-nums mt-1">
                {dashboard?.summary?.totalApplicants ?? 0}
              </div>
            </Card>

            <Card chamfer className="p-5 bg-[#1C1C21]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                Peserta Disetujui (Approved)
              </div>
              <div className="font-display text-3xl font-extrabold text-[#22C55E] tabular-nums mt-1">
                {dashboard?.summary?.totalApproved ?? 0}
              </div>
            </Card>

            <Card chamfer className="p-5 bg-[#1C1C21]">
              <div className="text-xs uppercase text-[#9A9AA5] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F5A524]" />
                Menunggu Verifikasi
              </div>
              <div className="font-display text-3xl font-extrabold text-[#F5A524] tabular-nums mt-1">
                {dashboard?.summary?.totalPending ?? 0}
              </div>
            </Card>
          </div>
        )}

        {/* Events List & Regional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              Daftar Turnamen Anda
            </h2>

            {(dashboard?.events || []).map((evt: any) => (
              <Card
                key={evt.id}
                chamfer
                ticketNotch
                className="p-6 border-[#2A2A31] hover:border-[#E10600]/60 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand">{evt.gameId}</Badge>
                    <Badge variant="outline">{evt.mode}</Badge>
                    <Badge variant="info">{evt.city || evt.scope}</Badge>
                  </div>
                  <Badge
                    variant={
                      evt.status === 'REGISTRATION_OPEN' ? 'success' : 'warning'
                    }
                  >
                    {evt.status}
                  </Badge>
                </div>

                <h3 className="font-display text-2xl font-extrabold uppercase text-white">
                  {evt.title}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-[#131316] rounded border border-[#2A2A31] text-xs">
                  <div>
                    <div className="text-[#9A9AA5]">Total Pendaftar</div>
                    <div className="text-white font-bold tabular-nums text-base">
                      {evt.stats?.totalApplicants ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#9A9AA5]">Approved / Kuota</div>
                    <div className="text-[#22C55E] font-bold tabular-nums text-base">
                      {evt.stats?.approved ?? 0} / {evt.quota}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#9A9AA5]">Antrean Pending</div>
                    <div className="text-[#F5A524] font-bold tabular-nums text-base">
                      {evt.stats?.pending ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#9A9AA5]">Sudah Check-In</div>
                    <div className="text-white font-bold tabular-nums text-base">
                      {evt.stats?.checkedIn ?? 0} Tim
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Link
                    href={`/event/${evt.slug}`}
                    className="text-xs text-[#9A9AA5] hover:text-white inline-flex items-center gap-1"
                  >
                    Lihat Halaman Publik
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/eo/event/${evt.id}?tab=form`}>
                      <Button variant="secondary" size="sm">
                        <Settings className="w-3.5 h-3.5 mr-1.5 text-[#E10600]" />
                        Form Builder
                      </Button>
                    </Link>
                    <Link href={`/eo/event/${evt.id}?tab=storage`}>
                      <Button variant="secondary" size="sm">
                        <HardDrive className="w-3.5 h-3.5 mr-1.5 text-[#3B82F6]" />
                        Event Storage
                      </Button>
                    </Link>
                    <Link href={`/eo/event/${evt.id}?tab=participants`}>
                      <Button variant="primary" size="sm">
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                        Peserta & Export CSV
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Regional Origin Analytics */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              Analitik Asal Daerah
            </h2>
            <Card chamfer className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#9A9AA5] uppercase tracking-wider font-semibold">
                <BarChart3 className="w-4 h-4 text-[#E10600]" />
                Distribusi Pendaftar per Kota/Kabupaten
              </div>

              {Object.keys(dashboard?.summary?.cityStats || {}).length === 0 ? (
                <p className="text-xs text-[#9A9AA5]">
                  Belum ada data distribusi pendaftar.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(dashboard?.summary?.cityStats || {}).map(
                    ([city, count]: [string, any]) => (
                      <div key={city} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">{city}</span>
                          <span className="text-[#E10600] tabular-nums">
                            {count} Tim
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#131316] rounded overflow-hidden">
                          <div
                            className="h-full bg-[#E10600]"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (Number(count) /
                                    Math.max(
                                      1,
                                      dashboard?.summary?.totalApplicants || 1,
                                    )) *
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
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
