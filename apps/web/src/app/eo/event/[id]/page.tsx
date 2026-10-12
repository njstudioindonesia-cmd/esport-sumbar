'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Users,
  HardDrive,
  Megaphone,
  Plus,
  Trash2,
  Save,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  Upload,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EoEventWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = (params?.id as string) || 'evt-minangkabau-cup-2026';
  const initialTab =
    (searchParams?.get('tab') as
      | 'form'
      | 'participants'
      | 'storage'
      | 'announcements') || 'participants';

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'form' | 'participants' | 'storage' | 'announcements'
  >(initialTab);
  const [data, setData] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form Builder state
  const [fields, setFields] = useState<any[]>([]);
  const [quota, setQuota] = useState<number>(32);
  const [fee, setFee] = useState<number>(0);
  const [paymentInstructions, setPaymentInstructions] = useState<string>('');
  const [requirePaymentProof, setRequirePaymentProof] = useState<boolean>(false);

  // Storage Signed URL preview state
  const [signedPreview, setSignedPreview] = useState<{
    fileId: string;
    fileName: string;
    signedUrl: string;
    expiresAt: string;
  } | null>(null);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annImportant, setAnnImportant] = useState(true);

  const organizerId =
    eventId === 'evt-ff-bukittinggi-clash' ? 'user-eo-2' : 'user-eo-1';

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const [eoRes, storageRes] = await Promise.all([
        fetch(`${API_BASE}/eo/events/${eventId}?organizerId=${organizerId}`, {
          headers: {
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
        }),
        fetch(`${API_BASE}/media/events/${eventId}/storage?organizerId=${organizerId}`, {
          headers: {
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
        }),
      ]);

      if (eoRes.ok) {
        const eoJson = await eoRes.json();
        setData(eoJson);
        setFields(eoJson.form?.fields || []);
        setQuota(eoJson.form?.quota || eoJson.event?.quota || 32);
        setFee(eoJson.form?.fee || 0);
        setPaymentInstructions(eoJson.form?.paymentInstructions || '');
        setRequirePaymentProof(Boolean(eoJson.form?.requirePaymentProof));
      }

      if (storageRes.ok) {
        const storageJson = await storageRes.json();
        setStorage(storageJson);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [eventId]);

  const handleSaveFormBuilder = async () => {
    try {
      const res = await fetch(`${API_BASE}/eo/events/${eventId}/form`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': organizerId,
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({
          organizerId,
          fields,
          quota: Number(quota),
          fee: Number(fee),
          paymentInstructions,
          requirePaymentProof,
        }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan schema Form Builder');
      toast({
        type: 'success',
        title: 'Form Builder Tersimpan',
        message:
          'Perubahan schema field, kuota, dan aturan pembayaran langsung aktif di halaman pendaftaran.',
      });
      loadWorkspace();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menyimpan Form',
        message: err?.message,
      });
    }
  };

  const handleParticipantStatus = async (
    regId: string,
    status: 'APPROVED' | 'REJECTED' | 'WAITLIST',
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/eo/events/${eventId}/participants/${regId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
          body: JSON.stringify({
            organizerId,
            status,
          }),
        },
      );
      if (!res.ok) throw new Error('Gagal memperbarui status peserta');
      toast({
        type: 'success',
        title: `Status Diubah ke ${status}`,
        message: `Status pendaftaran peserta #${regId} berhasil diperbarui.`,
      });
      loadWorkspace();
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', message: err?.message });
    }
  };

  const handleToggleCheckIn = async (regId: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/eo/events/${eventId}/participants/${regId}/check-in`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
          body: JSON.stringify({ organizerId }),
        },
      );
      if (!res.ok) throw new Error('Gagal mengubah status check-in');
      const updated = await res.json();
      toast({
        type: 'info',
        title: updated.checkedIn ? 'Check-In Berhasil' : 'Check-In Dibatalkan',
        message: `${updated.teamName || updated.userNickname}: ${
          updated.checkedIn ? 'SUDAH HADIR' : 'BELUM HADIR'
        }`,
      });
      loadWorkspace();
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', message: err?.message });
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/eo/events/${eventId}/participants/export-csv?organizerId=${organizerId}`,
        {
          headers: {
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
        },
      );
      if (!res.ok) throw new Error('Gagal mengekspor CSV peserta');
      const csvData = await res.json();

      // Trigger browser download
      const blob = new Blob([csvData.csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = csvData.fileName || `peserta-${eventId}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      // Also save export snapshot into Event Storage
      await fetch(`${API_BASE}/media/events/${eventId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': organizerId,
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({
          ownerId: organizerId,
          organizerId,
          fileName: csvData.fileName,
          sizeBytes: Math.max(1024, csvData.csvContent.length * 2),
          mimeType: 'text/csv',
          category: 'CSV_EXPORT',
          visibility: 'PRIVATE',
        }),
      });

      toast({
        type: 'success',
        title: 'Export CSV Berhasil!',
        message: `${csvData.totalRows} baris data peserta diunduh & diarsipkan ke Event Storage.`,
      });
      loadWorkspace();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Export CSV',
        message: err?.message,
      });
    }
  };

  const handleUploadStorageAsset = async (
    category: 'POSTER' | 'RULEBOOK' | 'PARTICIPANT_DOC',
  ) => {
    const sampleMap = {
      POSTER: {
        name: `poster-turnamen-${Date.now().toString().slice(-4)}.webp`,
        mime: 'image/webp',
        size: 1_240_000,
      },
      RULEBOOK: {
        name: `Rulebook_Revisi_${Date.now().toString().slice(-4)}.pdf`,
        mime: 'application/pdf',
        size: 2_540_000,
      },
      PARTICIPANT_DOC: {
        name: `Form_Verifikasi_ID_${Date.now().toString().slice(-4)}.pdf`,
        mime: 'application/pdf',
        size: 890_000,
      },
    }[category];

    try {
      const res = await fetch(`${API_BASE}/media/events/${eventId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': organizerId,
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({
          ownerId: organizerId,
          organizerId,
          fileName: sampleMap.name,
          sizeBytes: sampleMap.size,
          mimeType: sampleMap.mime,
          category,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || 'Upload ditolak');
      }
      toast({
        type: 'success',
        title: 'File Tersimpan di Event Storage',
        message: `${sampleMap.name} berhasil masuk ke bucket terisolasi event.`,
      });
      loadWorkspace();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Upload',
        message: err?.message,
      });
    }
  };

  const handleGenerateSignedUrl = async (fileId: string) => {
    try {
      const res = await fetch(`${API_BASE}/media/files/${fileId}/signed-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': organizerId,
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({
          requesterId: organizerId,
          expiresInSeconds: 900,
        }),
      });
      if (!res.ok) throw new Error('Gagal membuat Signed URL');
      const signed = await res.json();
      setSignedPreview(signed);
      toast({
        type: 'success',
        title: 'HMAC Signed URL Dibuat (Berlaku 15 Menit)',
        message: `Token akses sementara untuk "${signed.fileName}" siap digunakan.`,
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Akses Ditolak', message: err?.message });
    }
  };

  const handleDeleteStorageFile = async (fileId: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/media/files/${fileId}?organizerId=${organizerId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-id': organizerId,
            'x-user-role': 'ORGANIZER',
          },
        },
      );
      if (!res.ok) throw new Error('Gagal menghapus file');
      toast({
        type: 'info',
        title: 'File Dihapus',
        message: 'Kuota penyimpanan event telah diperbarui.',
      });
      loadWorkspace();
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', message: err?.message });
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/eo/events/${eventId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': organizerId,
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({
          organizerId,
          title: annTitle,
          content: annContent,
          important: annImportant,
        }),
      });
      if (!res.ok) throw new Error('Gagal mengirim pengumuman');
      setAnnTitle('');
      setAnnContent('');
      toast({
        type: 'success',
        title: 'Pengumuman Dipublikasikan!',
        message: 'Bulletin tampil di halaman event & dikirim ke peserta.',
      });
      loadWorkspace();
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', message: err?.message });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Workspace Event Tidak Ditemukan
        </h1>
        <Link href="/eo/dashboard" className="inline-block mt-4">
          <Button variant="primary">Kembali ke Dashboard EO</Button>
        </Link>
      </div>
    );
  }

  const { event, registrations = [], announcements = [], analytics } = data;
  const filteredRegs =
    statusFilter === 'ALL'
      ? registrations
      : registrations.filter((r: any) => r.status === statusFilter);

  const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] pb-20">
      {/* Top EO Workspace Header */}
      <section className="border-b border-[#2A2A31] bg-[#131316] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Link
              href="/eo/dashboard"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9AA5] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 text-[#E10600]" />
              Kembali ke Dashboard EO
            </Link>

            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span className="text-[#9A9AA5]">Tenant Owner:</span>
              <Badge variant="outline">{event.organizerId}</Badge>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand">{event.gameId}</Badge>
                <Badge variant="info">{event.mode}</Badge>
                <Badge variant="success">{event.status}</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white">
                {event.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/event/${event.slug}/bracket`}>
                <Button variant="secondary" size="sm">
                  Bracket & Klasemen Live
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href={`/event/${event.slug}`}>
                <Button variant="secondary" size="sm">
                  Halaman Publik
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href={`/event/${event.slug}/daftar`}>
                <Button variant="secondary" size="sm">
                  Uji Form Pendaftaran
                </Button>
              </Link>
              <Button variant="primary" size="sm" onClick={handleExportCsv}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export CSV Peserta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Navigation Tabs */}
      <div className="border-b border-[#2A2A31] bg-[#0B0B0D] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto">
          {[
            {
              id: 'participants',
              label: `Manajemen Peserta & CSV (${registrations.length})`,
              icon: Users,
            },
            {
              id: 'form',
              label: `Form Builder Pendaftaran (${fields.length} Field)`,
              icon: Settings,
            },
            {
              id: 'storage',
              label: `Event Storage & Signed URL (${storage?.files?.length ?? 0} File)`,
              icon: HardDrive,
            },
            {
              id: 'announcements',
              label: `Pengumuman (${announcements.length})`,
              icon: Megaphone,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-xs md:text-sm font-display font-bold uppercase tracking-wider border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#E10600] text-white'
                    : 'border-transparent text-[#9A9AA5] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-[#E10600]" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* TAB 1: PARTICIPANTS MANAGEMENT & CSV EXPORT */}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(['ALL', 'PENDING', 'APPROVED', 'WAITLIST', 'REJECTED'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded text-xs font-bold uppercase border transition-colors ${
                        statusFilter === st
                          ? 'bg-[#E10600] border-[#E10600] text-white'
                          : 'bg-[#131316] border-[#2A2A31] text-[#9A9AA5]'
                      }`}
                    >
                      {st === 'ALL' ? `Semua (${registrations.length})` : st}
                    </button>
                  ),
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#9A9AA5]">
                <span>
                  Approved:{' '}
                  <strong className="text-[#22C55E] tabular-nums">
                    {analytics?.approved ?? 0}/{quota}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Check-In:{' '}
                  <strong className="text-white tabular-nums">
                    {analytics?.checkedIn ?? 0} Tim
                  </strong>
                </span>
                <Button variant="secondary" size="sm" onClick={handleExportCsv}>
                  <Download className="w-3.5 h-3.5 mr-1.5 text-[#E10600]" />
                  Unduh CSV
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRegs.map((reg: any) => (
                <Card key={reg.id} chamfer className="p-5 bg-[#1C1C21]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            reg.status === 'APPROVED'
                              ? 'success'
                              : reg.status === 'PENDING'
                                ? 'warning'
                                : reg.status === 'WAITLIST'
                                  ? 'info'
                                  : 'brand'
                          }
                        >
                          {reg.status}
                        </Badge>
                        <Badge variant="outline">{reg.participantType}</Badge>
                        <span className="text-xs text-[#9A9AA5] tabular-nums">
                          ID: {reg.id} · Kota: <strong className="text-white">{reg.city}</strong>
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-extrabold uppercase text-white">
                        {reg.teamName || reg.userNickname}
                      </h3>
                      <div className="text-xs text-[#9A9AA5]">
                        Kapten: <strong className="text-white">{reg.userNickname}</strong>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {reg.proofFileId && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleGenerateSignedUrl(reg.proofFileId)}
                        >
                          <KeyRound className="w-3.5 h-3.5 mr-1.5 text-[#F5A524]" />
                          Lihat Bukti Bayar (Signed URL)
                        </Button>
                      )}

                      <Button
                        variant={reg.checkedIn ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleCheckIn(reg.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {reg.checkedIn ? 'Sudah Check-In' : 'Tandai Check-In'}
                      </Button>

                      {reg.status !== 'APPROVED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleParticipantStatus(reg.id, 'APPROVED')}
                        >
                          Approve
                        </Button>
                      )}

                      {reg.status !== 'WAITLIST' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleParticipantStatus(reg.id, 'WAITLIST')}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Waitlist
                        </Button>
                      )}

                      {reg.status !== 'REJECTED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleParticipantStatus(reg.id, 'REJECTED')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1 text-[#FF3B30]" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Custom Form Answers & Roster */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#2A2A31] text-xs">
                    <div className="bg-[#131316] p-3 rounded border border-[#2A2A31]">
                      <div className="text-[#9A9AA5] uppercase font-bold mb-2">
                        Jawaban Custom Form Builder:
                      </div>
                      <div className="space-y-1">
                        {Object.entries(reg.answers || {}).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[#9A9AA5]">{k}:</span>
                            <span className="text-white font-semibold tabular-nums">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#131316] p-3 rounded border border-[#2A2A31]">
                      <div className="text-[#9A9AA5] uppercase font-bold mb-2">
                        Roster Anggota Tim ({reg.teamMembers?.length || 0}):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(reg.teamMembers || []).map((m: any, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded bg-[#0B0B0D] border border-[#2A2A31] text-white tabular-nums"
                          >
                            {m.nickname} ({m.gameId})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FORM BUILDER */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Card chamfer className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase text-white">
                      Schema Field Pendaftaran (JSON Form Builder)
                    </h2>
                    <p className="text-xs text-[#9A9AA5]">
                      Tambahkan pertanyaan custom untuk kapten/peserta. Semua field
                      divalidasi otomatis saat pendaftaran.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFields((prev) => [
                        ...prev,
                        {
                          id: `customField_${prev.length + 1}`,
                          label: 'Pertanyaan Baru EO',
                          type: 'TEXT',
                          required: true,
                          placeholder: 'Jawaban peserta...',
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Field
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#131316] border border-[#2A2A31] rounded space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-5">
                          <label className="block text-[10px] uppercase text-[#9A9AA5] mb-1">
                            Label Pertanyaan
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const next = [...fields];
                              if (next[idx]) next[idx].label = e.target.value;
                              setFields(next);
                            }}
                            className="w-full bg-[#0B0B0D] border border-[#2A2A31] rounded px-3 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] uppercase text-[#9A9AA5] mb-1">
                            Tipe Input
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const next = [...fields];
                              if (next[idx]) next[idx].type = e.target.value;
                              setFields(next);
                            }}
                            className="w-full bg-[#0B0B0D] border border-[#2A2A31] rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="TEXT">Teks Bebas (TEXT)</option>
                            <option value="GAME_ID">ID Game (GAME_ID)</option>
                            <option value="PHONE">No. WhatsApp (PHONE)</option>
                            <option value="SELECT">Pilihan Dropdown (SELECT)</option>
                            <option value="FILE">Upload Dokumen (FILE)</option>
                          </select>
                        </div>

                        <div className="md:col-span-3 flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            checked={Boolean(field.required)}
                            onChange={(e) => {
                              const next = [...fields];
                              if (next[idx]) next[idx].required = e.target.checked;
                              setFields(next);
                            }}
                          />
                          <span className="text-xs text-white">Wajib Diisi</span>
                        </div>

                        <div className="md:col-span-1 flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              setFields((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-[#9A9AA5] hover:text-[#FF3B30]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card chamfer className="p-6 space-y-4">
                <h3 className="font-display text-xl font-bold uppercase text-white">
                  Aturan Kuota & Pembayaran
                </h3>

                <div>
                  <label className="block text-xs uppercase text-[#9A9AA5] mb-1">
                    Batas Kuota Tim (Otomatis Waitlist bila penuh)
                  </label>
                  <input
                    type="number"
                    value={quota}
                    onChange={(e) => setQuota(Number(e.target.value))}
                    className="w-full bg-[#131316] border border-[#2A2A31] rounded px-3 py-2 text-sm text-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#9A9AA5] mb-1">
                    Biaya Pendaftaran (Rp)
                  </label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full bg-[#131316] border border-[#2A2A31] rounded px-3 py-2 text-sm text-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#9A9AA5] mb-1">
                    Instruksi Rekening / QRIS
                  </label>
                  <textarea
                    rows={3}
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    className="w-full bg-[#131316] border border-[#2A2A31] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    checked={requirePaymentProof}
                    onChange={(e) => setRequirePaymentProof(e.target.checked)}
                  />
                  Wajibkan Upload Bukti Pembayaran
                </label>

                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={handleSaveFormBuilder}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Simpan Konfigurasi Form Builder
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: ISOLATED EVENT STORAGE & SIGNED URLS */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <Card chamfer className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="brand">PRIVATE S3/MINIO BUCKET PER EVENT</Badge>
                    <Badge variant="outline">HMAC-SHA256 SIGNED URL</Badge>
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase text-white">
                    Event Storage Terisolasi ({event.id})
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUploadStorageAsset('POSTER')}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-[#E10600]" />
                    Upload Poster (.webp)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUploadStorageAsset('RULEBOOK')}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-[#3B82F6]" />
                    Upload Rulebook (.pdf)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUploadStorageAsset('PARTICIPANT_DOC')}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload Dokumen Panitia
                  </Button>
                </div>
              </div>

              {/* Quota Progress Bar */}
              <div className="p-4 bg-[#131316] border border-[#2A2A31] rounded mb-6">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#9A9AA5]">
                    Penggunaan Kuota Penyimpanan Event:
                  </span>
                  <span className="text-white tabular-nums">
                    {formatMB(storage?.usedBytes || 0)} /{' '}
                    {formatMB(storage?.quotaBytes || 52_428_800)} (
                    {storage?.usagePercent || 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#0B0B0D] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#E10600]"
                    style={{ width: `${storage?.usagePercent || 5}%` }}
                  />
                </div>
              </div>

              {/* Active Signed URL Inspector */}
              {signedPreview && (
                <div className="p-4 mb-6 bg-[#1A0D10] border border-[#E10600] rounded space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#F5A524]" />
                      Signed URL Aktif untuk: {signedPreview.fileName}
                    </span>
                    <span className="text-[#9A9AA5] tabular-nums">
                      Kedaluwarsa:{' '}
                      {new Date(signedPreview.expiresAt).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <div className="p-2 bg-[#0B0B0D] rounded font-mono text-[11px] text-[#22C55E] break-all">
                    {signedPreview.signedUrl}
                  </div>
                </div>
              )}

              {/* Files Table */}
              <div className="space-y-2">
                {(storage?.files || []).map((file: any) => (
                  <div
                    key={file.id}
                    className="p-3.5 bg-[#131316] border border-[#2A2A31] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            file.visibility === 'PRIVATE' ? 'warning' : 'success'
                          }
                        >
                          {file.visibility}
                        </Badge>
                        <Badge variant="outline">{file.category}</Badge>
                        <span className="font-semibold text-white">
                          {file.fileName}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#9A9AA5] font-mono">
                        Key: {file.key} · Ukuran: {formatMB(file.sizeBytes)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGenerateSignedUrl(file.id)}
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1.5 text-[#F5A524]" />
                        Buat Signed URL
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStorageFile(file.id)}
                        className="p-2 text-[#9A9AA5] hover:text-[#FF3B30]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card chamfer className="p-6 space-y-4">
              <h3 className="font-display text-xl font-bold uppercase text-white">
                Broadcast Pengumuman Peserta
              </h3>
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-[#9A9AA5] mb-1">
                    Judul Bulletin *
                  </label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Contoh: Link Lobby Room Kualifikasi Grup A"
                    className="w-full bg-[#131316] border border-[#2A2A31] rounded px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#9A9AA5] mb-1">
                    Isi Pengumuman *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Tuliskan instruksi lengkap untuk seluruh peserta..."
                    className="w-full bg-[#131316] border border-[#2A2A31] rounded px-3 py-2 text-sm text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    checked={annImportant}
                    onChange={(e) => setAnnImportant(e.target.checked)}
                  />
                  Tandai Sebagai Pengumuman PENTING (Highlight Merah)
                </label>

                <Button type="submit" variant="primary" className="w-full">
                  <Megaphone className="w-4 h-4 mr-1.5" />
                  Kirim Pengumuman Sekarang
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {announcements.map((ann: any) => (
                <Card
                  key={ann.id}
                  chamfer
                  className={`p-5 ${
                    ann.important ? 'border-[#E10600]' : 'border-[#2A2A31]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {ann.important && <Badge variant="brand">PENTING</Badge>}
                      <h4 className="font-display text-lg font-bold uppercase text-white">
                        {ann.title}
                      </h4>
                    </div>
                    <span className="text-xs text-[#9A9AA5] tabular-nums">
                      {new Date(ann.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-[#F5F5F7]/90">{ann.content}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
