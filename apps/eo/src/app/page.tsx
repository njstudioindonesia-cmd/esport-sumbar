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
  Layers,
} from 'lucide-react';
import {
  DashboardLayout,
  MetricCard,
  CommandPalette,
  CommandAction,
} from '@esport-sumbar/ui-dashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EoStudioDashboard() {
  const { toast } = useToast();
  const [organizerId, setOrganizerId] = useState<'user-eo-1' | 'user-eo-2'>('user-eo-1');
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isolationTestResult, setIsolationTestResult] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setIsolationTestResult(null);
      try {
        const res = await fetch(`${API_BASE}/eo/dashboard?organizerId=${organizerId}`, {
          headers: {
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDashboard(data);
        }
      } catch {
        // Handled gracefully
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [organizerId]);

  const runCrossTenantSecurityCheck = async () => {
    const targetEventId =
      organizerId === 'user-eo-1' ? 'evt-ff-bukittinggi-clash' : 'evt-minangkabau-cup-2026';

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
        const msg = `[HTTP 403 FORBIDDEN] ${body.message || 'Akses lintas EO ditolak otomatis'}`;
        setIsolationTestResult(msg);
        toast({
          type: 'success',
          title: 'Tenant Isolation Terverifikasi!',
          message: 'Akses lintas EO ditolak otomatis oleh Event Service.',
        });
      }
    } catch {
      // Handled gracefully
    }
  };

  const navItems = [
    { label: 'Ringkasan Studio', href: '/', icon: <Layers className="w-4 h-4" /> },
    { label: 'Buat Turnamen Baru', href: '/event/baru', icon: <PlusCircle className="w-4 h-4" /> },
  ];

  const commandActions: CommandAction[] = [
    { id: '1', title: 'Ringkasan Dashboard', category: 'Navigasi', href: '/' },
    { id: '2', title: 'Buat Turnamen Baru', category: 'Turnamen', href: '/event/baru' },
    {
      id: '3',
      title: 'Uji Proteksi Cross-Tenant (Simulasi 403)',
      category: 'Keamanan',
      onSelect: runCrossTenantSecurityCheck,
    },
    {
      id: '4',
      title: 'Buka Portal Publik',
      category: 'Portal',
      href: 'http://localhost:3000',
    },
    {
      id: '5',
      title: 'Buka Admin Console',
      category: 'Portal',
      href: 'http://localhost:3002',
    },
  ];

  const switchPortals = [
    { label: 'Portal Publik (esportsumbar.id)', href: 'http://localhost:3000', type: 'public' as const },
    { label: 'Admin Console (admin.esportsumbar.id)', href: 'http://localhost:3002', type: 'admin' as const },
  ];

  return (
    <DashboardLayout
      portal="eo"
      title="EO Studio · Manajemen Turnamen"
      user={{
        name: organizerId === 'user-eo-1' ? 'Minang Pro Esports (Padang)' : 'Bukittinggi Gaming Hub',
        email: `${organizerId}@esportsumbar.id`,
        role: 'ORGANIZER',
      }}
      navItems={navItems}
      currentPath="/"
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      switchPortals={switchPortals}
      actions={
        <div className="flex items-center gap-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setOrganizerId('user-eo-1')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                organizerId === 'user-eo-1'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              EO 1: Padang
            </button>
            <button
              type="button"
              onClick={() => setOrganizerId('user-eo-2')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                organizerId === 'user-eo-2'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              EO 2: Bukittinggi
            </button>
          </div>
          <Link href="/event/baru">
            <Button variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Buat Turnamen
            </Button>
          </Link>
        </div>
      }
    >
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        actions={commandActions}
      />

      {/* Tenant Isolation Banner */}
      <Card chamfer className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="text-white font-bold uppercase tracking-wider">
                Tenant Isolation Workspace Aktif (Tenant ID: {organizerId})
              </div>
              <p className="text-neutral-400 mt-0.5">
                Setiap data turnamen, form pendaftaran, file KTP, dan storage terisolasi per EO.
              </p>
              {isolationTestResult && (
                <div className="mt-2 p-2 bg-neutral-950 border border-rose-500/40 rounded font-mono text-[11px] text-rose-400">
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
            <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-400" />
            Uji Simulasi Akses EO Lain (403)
          </Button>
        </div>
      </Card>

      {/* KPI Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Turnamen Milik EO"
            value={dashboard?.summary?.totalEvents ?? 0}
            icon={<Trophy className="w-5 h-5" />}
            accent="emerald"
            subtitle="Turnamen aktif di Sumbar"
          />
          <MetricCard
            title="Total Pendaftar Masuk"
            value={dashboard?.summary?.totalApplicants ?? 0}
            icon={<Users className="w-5 h-5" />}
            accent="sky"
            subtitle="Pendaftar terverifikasi"
          />
          <MetricCard
            title="Peserta Disetujui"
            value={dashboard?.summary?.totalApproved ?? 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
            accent="emerald"
            subtitle="Lolos verifikasi form"
          />
          <MetricCard
            title="Menunggu Verifikasi"
            value={dashboard?.summary?.totalPending ?? 0}
            icon={<Clock className="w-5 h-5" />}
            accent="amber"
            subtitle="Perlu tinjauan EO"
          />
        </div>
      )}

      {/* Tournaments List & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-neutral-300">
            Daftar Turnamen Aktif
          </h2>

          {(dashboard?.events || []).map((evt: any) => (
            <Card
              key={evt.id}
              chamfer
              className="p-6 border-neutral-800 bg-neutral-900/80 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{evt.gameId}</Badge>
                  <Badge variant="outline">{evt.mode}</Badge>
                  <Badge variant="info">{evt.city || evt.scope}</Badge>
                </div>
                <Badge
                  variant={evt.status === 'REGISTRATION_OPEN' ? 'success' : 'warning'}
                >
                  {evt.status}
                </Badge>
              </div>

              <h3 className="text-xl font-bold uppercase text-white tracking-wide">
                {evt.title}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
                <div>
                  <div className="text-neutral-400">Total Pendaftar</div>
                  <div className="text-white font-bold tabular-nums text-base">
                    {evt.stats?.totalApplicants ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Approved / Kuota</div>
                  <div className="text-emerald-400 font-bold tabular-nums text-base">
                    {evt.stats?.approved ?? 0} / {evt.quota}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Antrean Pending</div>
                  <div className="text-amber-400 font-bold tabular-nums text-base">
                    {evt.stats?.pending ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400">Sudah Check-In</div>
                  <div className="text-white font-bold tabular-nums text-base">
                    {evt.stats?.checkedIn ?? 0} Tim
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <a
                  href={`http://localhost:3000/event/${evt.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1"
                >
                  Lihat Halaman Publik
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/event/${evt.id}?tab=form`}>
                    <Button variant="secondary" size="sm">
                      <Settings className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      Form Builder
                    </Button>
                  </Link>
                  <Link href={`/event/${evt.id}?tab=storage`}>
                    <Button variant="secondary" size="sm">
                      <HardDrive className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                      Event Storage
                    </Button>
                  </Link>
                  <Link href={`/event/${evt.id}?tab=participants`}>
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
          <h2 className="text-base font-bold uppercase tracking-wider text-neutral-300">
            Analitik Asal Daerah
          </h2>
          <Card chamfer className="p-6 space-y-4 bg-neutral-900 border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wider font-semibold">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Distribusi Pendaftar per Kota/Kabupaten
            </div>

            {Object.keys(dashboard?.summary?.cityStats || {}).length === 0 ? (
              <p className="text-xs text-neutral-400">
                Belum ada data distribusi pendaftar.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(dashboard?.summary?.cityStats || {}).map(
                  ([city, count]: [string, any]) => (
                    <div key={city} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{city}</span>
                        <span className="text-emerald-400 tabular-nums">
                          {count} Tim
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-950 rounded overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (Number(count) /
                                  Math.max(1, dashboard?.summary?.totalApplicants || 1)) *
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
    </DashboardLayout>
  );
}
