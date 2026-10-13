'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_COMMUNITY_REPORTS } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ContentReport } from '@esport-sumbar/contracts';

export default function AdminModerationQueuePage() {
  const [reports, setReports] = useState<ContentReport[]>(MOCK_COMMUNITY_REPORTS);
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'RESOLVED' | 'DISMISSED'>('PENDING');
  const { toast } = useToast();

  const filteredReports = reports.filter((r) => r.status === activeFilter);

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const dismissedCount = reports.filter((r) => r.status === 'DISMISSED').length;

  const handleResolve = (id: string, nextStatus: 'RESOLVED' | 'DISMISSED') => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)),
    );

    if (nextStatus === 'RESOLVED') {
      toast({
        type: 'success',
        title: 'Konten Dihapus & Ditindak',
        message: 'Postingan/komentar pelanggar telah dihapus dari forum komunitas.',
      });
    } else {
      toast({
        type: 'info',
        title: 'Laporan Diabaikan',
        message: 'Laporan telah ditandai selesai tanpa penghapusan konten.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-900)] text-[var(--text-100)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--line)] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[var(--red-500)] inline-block"></span>
            <span className="text-xs uppercase tracking-widest font-black text-[var(--red-400)]">
              AI Content Safety & Moderator Queue
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            Pusat Moderasi Komunitas
          </h1>
          <p className="text-sm text-[var(--text-400)] mt-1 max-w-2xl">
            Kelola laporan anggota serta tangkapan otomatis <strong>AI Pre-Moderation</strong> untuk
            menjaga ekosistem komunitas Sumatera Barat tetap bersih dari judi online, spam, dan toxic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/komunitas">
            <Button variant="outline" size="sm" className="text-xs">
              ← Kembali ke Komunitas
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div
          onClick={() => setActiveFilter('PENDING')}
          className={`p-4 border cursor-pointer transition-all ${
            activeFilter === 'PENDING'
              ? 'bg-[var(--bg-800)] border-[var(--warning)] ring-1 ring-[var(--warning)]'
              : 'bg-[var(--bg-800)]/60 border-[var(--line)]'
          }`}
        >
          <span className="text-xs uppercase font-bold text-[var(--text-400)] block mb-1">
            Menunggu Tindakan (Pending)
          </span>
          <span className="text-3xl font-black text-[var(--warning)] font-display tabular-nums">
            {pendingCount}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('RESOLVED')}
          className={`p-4 border cursor-pointer transition-all ${
            activeFilter === 'RESOLVED'
              ? 'bg-[var(--bg-800)] border-[var(--success)] ring-1 ring-[var(--success)]'
              : 'bg-[var(--bg-800)]/60 border-[var(--line)]'
          }`}
        >
          <span className="text-xs uppercase font-bold text-[var(--text-400)] block mb-1">
            Ditindak / Konten Dihapus
          </span>
          <span className="text-3xl font-black text-[var(--success)] font-display tabular-nums">
            {resolvedCount}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('DISMISSED')}
          className={`p-4 border cursor-pointer transition-all ${
            activeFilter === 'DISMISSED'
              ? 'bg-[var(--bg-800)] border-[var(--info)] ring-1 ring-[var(--info)]'
              : 'bg-[var(--bg-800)]/60 border-[var(--line)]'
          }`}
        >
          <span className="text-xs uppercase font-bold text-[var(--text-400)] block mb-1">
            Laporan Diabaikan
          </span>
          <span className="text-3xl font-black text-[var(--info)] font-display tabular-nums">
            {dismissedCount}
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-800)] border border-[var(--line)]">
            <p className="text-sm text-[var(--text-400)]">
              Tidak ada laporan pada status {activeFilter}.
            </p>
          </div>
        ) : (
          filteredReports.map((rep) => (
            <Card
              key={rep.id}
              className="bg-[var(--bg-800)] border-[var(--line)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" size="sm">
                    {rep.category}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Target: {rep.targetType}
                  </Badge>
                  {rep.aiFlagged && (
                    <Badge variant="warning" size="sm">
                      🤖 AI AUTO-FLAGGED
                    </Badge>
                  )}
                  <span className="text-xs text-[var(--text-400)]">
                    Pelapor: <strong className="text-white">{rep.reporterNickname}</strong>
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-900)] border border-[var(--line)] text-xs text-white font-mono">
                  &ldquo;{rep.targetPreview}&rdquo;
                </div>

                <p className="text-xs text-[var(--text-400)]">
                  Alasan Laporan: <span className="text-[var(--text-100)]">{rep.reason}</span>
                </p>
              </div>

              {rep.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleResolve(rep.id, 'RESOLVED')}
                    className="text-xs"
                  >
                    🗑️ Hapus Konten & Tindak
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(rep.id, 'DISMISSED')}
                    className="text-xs"
                  >
                    Abaikan
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
