'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  Phone,
  Calendar,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface PendingOrganizer {
  id: string;
  userId: string;
  orgName: string;
  contactPhone: string;
  city: string;
  docs: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const INITIAL_ORGANIZERS: PendingOrganizer[] = [
  {
    id: 'org-1',
    userId: 'usr-org-1',
    orgName: 'Ranah Minang Esports Hub',
    contactPhone: '+6281234567890',
    city: 'Padang',
    docs: ['Surat_Izin_Event_Padang.pdf', 'KTP_Ketua_Pelaksana.pdf'],
    status: 'PENDING',
    createdAt: '2026-10-12T08:30:00Z',
  },
  {
    id: 'org-2',
    userId: 'usr-org-2',
    orgName: 'Bukittinggi Gamer Syndicate',
    contactPhone: '+6281987654321',
    city: 'Bukittinggi',
    docs: ['Legalitas_Komunitas_Bukittinggi.pdf'],
    status: 'PENDING',
    createdAt: '2026-10-11T14:20:00Z',
  },
  {
    id: 'org-3',
    userId: 'usr-org-3',
    orgName: 'Payakumbuh Cyber Arena',
    contactPhone: '+6281355557777',
    city: 'Payakumbuh',
    docs: ['Akta_Notaris_Payakumbuh_Cyber.pdf'],
    status: 'APPROVED',
    createdAt: '2026-10-09T10:00:00Z',
  },
];

export default function AdminEoVerificationPage() {
  const [organizers, setOrganizers] = useState<PendingOrganizer[]>(INITIAL_ORGANIZERS);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const filtered = organizers.filter((org) => {
    const matchFilter = org.status === filter;
    const matchSearch =
      org.orgName.toLowerCase().includes(search.toLowerCase()) ||
      org.city.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleApprove = (id: string, name: string) => {
    setOrganizers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'APPROVED' } : o)),
    );
    toast({
      type: 'success',
      title: 'EO Berhasil Diverifikasi',
      message: `Penyelenggara "${name}" kini memiliki hak akses penuh ke EO Studio.`,
    });
  };

  const handleReject = (id: string, name: string) => {
    setOrganizers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'REJECTED' } : o)),
    );
    toast({
      type: 'info',
      title: 'Permohonan EO Ditolak',
      message: `Penyelenggara "${name}" ditolak dengan catatan verifikasi.`,
    });
  };

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
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white font-display">
            Verifikasi Penyelenggara Event (EO)
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Validasi berkas identitas dan izin operasional komunitas sebelum akun diberikan akses ke EO Studio.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'PENDING'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Menunggu ({organizers.filter((o) => o.status === 'PENDING').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'APPROVED'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Disetujui ({organizers.filter((o) => o.status === 'APPROVED').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === 'REJECTED'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Ditolak ({organizers.filter((o) => o.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama organisasi atau kota/kabupaten..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Organizers List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 bg-neutral-900/40 rounded-xl border border-neutral-800">
            Tidak ada permohonan penyelenggara dengan status "{filter}".
          </div>
        ) : (
          filtered.map((org) => (
            <Card
              key={org.id}
              chamfer
              className="p-6 bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                      {org.orgName}
                    </h3>
                    <Badge variant="info">{org.city}</Badge>
                    <Badge
                      variant={
                        org.status === 'APPROVED'
                          ? 'success'
                          : org.status === 'REJECTED'
                          ? 'brand'
                          : 'warning'
                      }
                    >
                      {org.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      {org.contactPhone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      {new Date(org.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Documents */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Dokumen Verifikasi:
                    </span>
                    {org.docs.map((doc) => (
                      <span
                        key={doc}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {org.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(org.id, org.orgName)}
                    >
                      <XCircle className="w-4 h-4 mr-1 text-rose-400" />
                      Tolak
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(org.id, org.orgName)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Setujui Akses EO
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
