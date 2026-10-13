'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCode2,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { DataTable, Column } from '@esport-sumbar/ui-dashboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface FullAuditLog {
  id: string;
  actor: string;
  role: 'ADMIN' | 'ORGANIZER' | 'USER' | 'SYSTEM';
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: string;
}

const AUDIT_LOGS_DATA: FullAuditLog[] = [
  {
    id: 'log-101',
    actor: 'admin@esportsumbar.id',
    role: 'ADMIN',
    action: '2FA_VERIFY_SUCCESS',
    entity: 'Session',
    entityId: 'ses-9982',
    ip: '103.14.22.8',
    status: 'SUCCESS',
    timestamp: '2026-10-13 16:30:12',
  },
  {
    id: 'log-102',
    actor: 'admin@esportsumbar.id',
    role: 'ADMIN',
    action: 'PUBLISH_ARTICLE',
    entity: 'Article',
    entityId: 'art-mlbb-sumbar-championship',
    ip: '103.14.22.8',
    status: 'SUCCESS',
    timestamp: '2026-10-13 16:15:00',
  },
  {
    id: 'log-103',
    actor: 'system-rss-cron',
    role: 'SYSTEM',
    action: 'INSTAGRAM_FEED_SYNC',
    entity: 'InstagramConnection',
    entityId: 'ig-esportsumbar',
    ip: '127.0.0.1',
    status: 'SUCCESS',
    timestamp: '2026-10-13 15:30:00',
  },
  {
    id: 'log-104',
    actor: 'admin@esportsumbar.id',
    role: 'ADMIN',
    action: 'APPROVE_ORGANIZER',
    entity: 'OrganizerProfile',
    entityId: 'org-bukittinggi-arena',
    ip: '103.14.22.8',
    status: 'SUCCESS',
    timestamp: '2026-10-13 13:45:21',
  },
  {
    id: 'log-105',
    actor: '182.2.14.99',
    role: 'USER',
    action: 'CROSS_PORTAL_ATTEMPT_BLOCKED',
    entity: 'GatewayRoute',
    entityId: '/api/admin/news',
    ip: '182.2.14.99',
    status: 'WARNING',
    timestamp: '2026-10-13 11:20:05',
  },
  {
    id: 'log-106',
    actor: 'organizer@esportsumbar.id',
    role: 'ORGANIZER',
    action: 'CREATE_TOURNAMENT',
    entity: 'EventItem',
    entityId: 'evt-minangkabau-cup-2026',
    ip: '103.14.22.15',
    status: 'SUCCESS',
    timestamp: '2026-10-13 09:10:00',
  },
];

export default function AdminAuditLogPage() {
  const { toast } = useToast();
  const [data] = useState<FullAuditLog[]>(AUDIT_LOGS_DATA);

  const handleExportCsv = () => {
    const headers = 'ID,Aktor,Peran,Aksi,Entitas,Entitas ID,IP,Status,Waktu\n';
    const rows = data
      .map(
        (r) =>
          `"${r.id}","${r.actor}","${r.role}","${r.action}","${r.entity}","${r.entityId}","${r.ip}","${r.status}","${r.timestamp}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `security-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: 'success',
      title: 'Audit Log Diekspor!',
      message: 'File CSV log keamanan berhasil diunduh.',
    });
  };

  const columns: Column<FullAuditLog>[] = [
    {
      key: 'actor',
      header: 'Aktor & Peran',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-neutral-200">{row.actor}</div>
          <div className="text-[10px] text-neutral-500 font-mono">
            Peran: {row.role} · IP: {row.ip}
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Aksi Keamanan',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-amber-400 font-medium">
          {row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entitas Target',
      render: (row) => (
        <div>
          <div className="text-neutral-300 font-medium">{row.entity}</div>
          <div className="text-[10px] text-neutral-500 font-mono">{row.entityId}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
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
      header: 'Waktu (WIB)',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="text-neutral-400 font-mono text-[11px]">
          {row.timestamp}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            Kembali ke Dashboard Admin
          </Link>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white font-display">
              Security Audit Log
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Rekam jejak seluruh aktivitas otentikasi, perubahan data redaksi, verifikasi EO, dan proteksi portal.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportCsv}>
          <Download className="w-4 h-4 mr-1.5" />
          Ekspor Log (CSV)
        </Button>
      </div>

      {/* Audit Log Table */}
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        searchable={true}
        searchPlaceholder="Cari aktor, aksi, IP, atau target..."
        searchKeys={['actor', 'action', 'entity', 'ip']}
        pageSize={10}
      />
    </div>
  );
}
