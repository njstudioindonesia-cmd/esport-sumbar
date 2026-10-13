'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Newspaper,
  MessageSquareWarning,
  Building2,
  FileCode2,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons';
import {
  DashboardLayout,
  MetricCard,
  DataTable,
  CommandPalette,
  CommandAction,
  Column,
} from '@esport-sumbar/ui-dashboard';
import { Card } from '@/components/ui/card';

interface AuditItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

const MOCK_AUDIT_LOGS: AuditItem[] = [
  {
    id: 'log-101',
    actor: 'admin@esportsumbar.id',
    action: '2FA_VERIFY_SUCCESS',
    target: 'Session Login',
    ip: '103.14.22.8',
    timestamp: 'Baru saja',
    status: 'SUCCESS',
  },
  {
    id: 'log-102',
    actor: 'admin@esportsumbar.id',
    action: 'PUBLISH_ARTICLE',
    target: 'art-mlbb-sumbar-championship',
    ip: '103.14.22.8',
    timestamp: '15 menit lalu',
    status: 'SUCCESS',
  },
  {
    id: 'log-103',
    actor: 'system-rss-cron',
    action: 'INSTAGRAM_FEED_SYNC',
    target: '@esportsumbar (14 media)',
    ip: '127.0.0.1',
    timestamp: '1 jam lalu',
    status: 'SUCCESS',
  },
  {
    id: 'log-104',
    actor: 'admin@esportsumbar.id',
    action: 'APPROVE_ORGANIZER',
    target: 'org-bukittinggi-arena',
    ip: '103.14.22.8',
    timestamp: '3 jam lalu',
    status: 'SUCCESS',
  },
  {
    id: 'log-105',
    actor: '182.2.14.99',
    action: 'CROSS_PORTAL_ATTEMPT_BLOCKED',
    target: '/api/admin/news',
    ip: '182.2.14.99',
    timestamp: '5 jam lalu',
    status: 'WARNING',
  },
];

export default function AdminConsoleDashboard() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const navItems = [
    { label: 'Ringkasan Platform', href: '/', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Review Berita AI', href: '/berita', icon: <Newspaper className="w-4 h-4" />, badge: 3, badgeVariant: 'warning' as const },
    { label: 'Moderasi Komunitas', href: '/moderasi', icon: <MessageSquareWarning className="w-4 h-4" />, badge: 2, badgeVariant: 'danger' as const },
    { label: 'Verifikasi EO', href: '/eo', icon: <Building2 className="w-4 h-4" />, badge: 1, badgeVariant: 'warning' as const },
    { label: 'Instagram Graph API', href: '/instagram', icon: <InstagramIcon className="w-4 h-4" /> },
    { label: 'Security Audit Log', href: '/audit', icon: <FileCode2 className="w-4 h-4" /> },
  ];

  const commandActions: CommandAction[] = [
    { id: '1', title: 'Ringkasan Dashboard', category: 'Navigasi', href: '/' },
    { id: '2', title: 'Buka Antrean Review Berita', category: 'Redaksi', href: '/berita' },
    { id: '3', title: 'Buka Antrean Moderasi Komunitas', category: 'Moderasi', href: '/moderasi' },
    { id: '4', title: 'Verifikasi Penyelenggara EO Baru', category: 'Organisasi', href: '/eo' },
    { id: '5', title: 'Kelola Koneksi Instagram Graph API', category: 'Integrasi', href: '/instagram' },
    { id: '6', title: 'Buka Catatan Audit Log Keamanan', category: 'Keamanan', href: '/audit' },
    { id: '7', title: 'Buka Portal Publik', category: 'Portal', href: 'http://localhost:3000' },
    { id: '8', title: 'Buka EO Studio', category: 'Portal', href: 'http://localhost:3001' },
  ];

  const switchPortals = [
    { label: 'Portal Publik (esportsumbar.id)', href: 'http://localhost:3000', type: 'public' as const },
    { label: 'EO Studio (eo.esportsumbar.id)', href: 'http://localhost:3001', type: 'eo' as const },
  ];

  const auditColumns: Column<AuditItem>[] = [
    {
      key: 'actor',
      header: 'Aktor & IP',
      render: (row) => (
        <div>
          <div className="font-semibold text-neutral-200">{row.actor}</div>
          <div className="text-[10px] text-neutral-500 font-mono">{row.ip}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Aksi / Event',
      render: (row) => (
        <span className="font-mono text-[11px] text-amber-400 font-medium">
          {row.action}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Entitas Target',
      render: (row) => <span className="text-neutral-300">{row.target}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (row.status === 'WARNING')
          badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'timestamp',
      header: 'Waktu',
      align: 'right',
      render: (row) => <span className="text-neutral-500">{row.timestamp}</span>,
    },
  ];

  return (
    <DashboardLayout
      portal="admin"
      title="Admin Console · Pengawasan & Keamanan"
      user={{
        name: 'Super Admin Sumbar',
        email: 'admin@esportsumbar.id',
        role: 'ADMIN (2FA AKTIF)',
      }}
      navItems={navItems}
      currentPath="/"
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      switchPortals={switchPortals}
      actions={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-3.5 h-3.5" />
            2FA TOTP Verified
          </span>
        </div>
      }
    >
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        actions={commandActions}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Review Berita AI"
          value={3}
          icon={<Newspaper className="w-5 h-5" />}
          accent="amber"
          subtitle="Artikel butuh kurasi"
          trend={{ value: '+3 hari ini', direction: 'up', isPositive: false }}
        />
        <MetricCard
          title="Moderasi Komunitas"
          value={2}
          icon={<MessageSquareWarning className="w-5 h-5" />}
          accent="rose"
          subtitle="Laporan konten sensitif"
          trend={{ value: 'Prioritas tinggi', direction: 'neutral' }}
        />
        <MetricCard
          title="Verifikasi EO"
          value={1}
          icon={<Building2 className="w-5 h-5" />}
          accent="sky"
          subtitle="Menunggu review berkas"
        />
        <MetricCard
          title="Instagram @esportsumbar"
          value="52 Hari"
          icon={<InstagramIcon className="w-5 h-5" />}
          accent="emerald"
          subtitle="Token Graph API aktif"
          trend={{ value: 'Sinkronisasi Otomatis', direction: 'neutral' }}
        />
      </div>

      {/* Fast Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/berita">
          <Card chamfer className="p-5 border-neutral-800 bg-neutral-900/60 hover:border-amber-500/40 hover:bg-neutral-900 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Newspaper className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3 font-bold text-white text-sm">
              Antrean Redaksi Berita AI
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Kurasi 3 artikel viral dari RSS Ingestor sebelum publikasi ke beranda.
            </p>
          </Card>
        </Link>

        <Link href="/moderasi">
          <Card chamfer className="p-5 border-neutral-800 bg-neutral-900/60 hover:border-rose-500/40 hover:bg-neutral-900 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3 font-bold text-white text-sm">
              Moderasi Konten Komunitas
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Tinjau postingan atau komentar forum yang dilaporkan anggota.
            </p>
          </Card>
        </Link>

        <Link href="/instagram">
          <Card chamfer className="p-5 border-neutral-800 bg-neutral-900/60 hover:border-purple-500/40 hover:bg-neutral-900 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3 font-bold text-white text-sm">
              Meta Graph API @esportsumbar
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Kelola sinkronisasi media, token kadaluarsa, dan ekstraksi draft event.
            </p>
          </Card>
        </Link>
      </div>

      {/* Security Audit Trail Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-amber-400" />
            Aktivitas Audit Keamanan Terbaru
          </h2>
          <Link
            href="/audit"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
          >
            Lihat Semua Log
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={auditColumns}
          data={MOCK_AUDIT_LOGS}
          keyExtractor={(r) => r.id}
          searchable={false}
          pageSize={5}
        />
      </div>
    </DashboardLayout>
  );
}
