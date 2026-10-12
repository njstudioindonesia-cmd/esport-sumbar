'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  ShieldCheck,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EventRegistrationPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'minangkabau-esport-cup-season-4';
  const { toast } = useToast();

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submittedReg, setSubmittedReg] = useState<any>(null);

  const [userNickname, setUserNickname] = useState('KaptenMinang99');
  const [city, setCity] = useState('Padang');
  const [participantType, setParticipantType] = useState<'TEAM' | 'INDIVIDUAL'>('TEAM');
  const [teamName, setTeamName] = useState('');
  const [communityId, setCommunityId] = useState('comm-mlbb-sumbar');
  const [teamMembers, setTeamMembers] = useState([
    { nickname: 'KaptenMinang99', gameId: '88123456 (2104)', role: 'Jungler / IGL' },
    { nickname: 'PlayerDua', gameId: '88123457 (2104)', role: 'Gold Lane' },
    { nickname: 'PlayerTiga', gameId: '88123458 (2104)', role: 'Mid Lane' },
    { nickname: 'PlayerEmpat', gameId: '88123459 (2104)', role: 'Roamer' },
    { nickname: 'PlayerLima', gameId: '88123460 (2104)', role: 'EXP Lane' },
  ]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [proofFile, setProofFile] = useState<{
    id: string;
    fileName: string;
  } | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/events/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data);

          const initialAnswers: Record<string, string> = {};
          for (const f of data?.form?.fields || []) {
            if (f.type === 'SELECT' && f.options?.length > 0) {
              initialAnswers[f.id] = f.options[0];
            } else {
              initialAnswers[f.id] = '';
            }
          }
          setAnswers(initialAnswers);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [slug]);

  const handleUploadProof = async () => {
    if (!detail?.event) return;
    setUploadingProof(true);
    try {
      const sampleFileName = `bukti-bayar-${(teamName || userNickname)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')}.png`;

      const res = await fetch(`${API_BASE}/media/events/${detail.event.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: `user-${userNickname.toLowerCase()}`,
          organizerId: detail.event.organizerId,
          fileName: sampleFileName,
          sizeBytes: 485_120,
          mimeType: 'image/png',
          category: 'PAYMENT_PROOF',
          visibility: 'PRIVATE',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || 'Gagal mengunggah bukti pembayaran');
      }

      const uploaded = await res.json();
      setProofFile({ id: uploaded.id, fileName: uploaded.fileName });
      toast({
        type: 'success',
        title: 'Bukti Pembayaran Terunggah',
        message: `File "${uploaded.fileName}" tersimpan aman di Event Storage privat.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Upload Gagal',
        message: err?.message || 'Terjadi kesalahan saat upload bukti bayar.',
      });
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail?.event) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `user-${userNickname.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
          userNickname,
          city,
          participantType,
          teamName: participantType === 'TEAM' ? teamName : undefined,
          teamMembers: participantType === 'TEAM' ? teamMembers : [],
          communityId: communityId || undefined,
          answers,
          proofFileId: proofFile?.id || null,
          proofFileUrl: proofFile
            ? `/api/media/files/${proofFile.id}/signed-url`
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || 'Validasi pendaftaran gagal',
        );
      }

      setSubmittedReg(data);
      toast({
        type: 'success',
        title: 'Pendaftaran Berhasil Dikirim!',
        message: `Status pendaftaran Anda: ${data.status}`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mendaftar',
        message: err?.message || 'Periksa kembali data wajib pada formulir.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!detail?.event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Event Tidak Ditemukan
        </h1>
        <Link href="/event" className="inline-block mt-4">
          <Button variant="primary">Kembali ke Katalog Event</Button>
        </Link>
      </div>
    );
  }

  const { event, form } = detail;

  if (submittedReg) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card chamfer ticketNotch className="p-8 border-[#22C55E]">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
              <div>
                <Badge variant="success">TIKET PENDAFTARAN TERCATAT</Badge>
                <h1 className="font-display text-3xl font-extrabold uppercase text-white mt-1">
                  Pendaftaran Diterima!
                </h1>
              </div>
            </div>

            <p className="text-sm text-[#9A9AA5] mb-6">
              Data tim dan jawaban formulir Anda telah divalidasi oleh sistem Form
              Builder EO dan masuk ke antrean verifikasi panitia{' '}
              <strong className="text-white">{event.organizerName}</strong>.
            </p>

            <div className="p-4 bg-[#131316] border border-[#2A2A31] rounded space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-[#9A9AA5]">ID Pendaftaran:</span>
                <span className="text-white font-mono font-bold">
                  {submittedReg.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9A9AA5]">Turnamen:</span>
                <span className="text-white font-semibold">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9A9AA5]">Nama Tim / Peserta:</span>
                <span className="text-white font-semibold">
                  {submittedReg.teamName || submittedReg.userNickname}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9A9AA5]">Status Saat Ini:</span>
                <Badge
                  variant={
                    submittedReg.status === 'WAITLIST' ? 'warning' : 'info'
                  }
                >
                  {submittedReg.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link href={`/event/${event.slug}`}>
                <Button variant="secondary">Kembali ke Halaman Event</Button>
              </Link>
              <Link href={`/eo/event/${event.id}`}>
                <Button variant="primary">Lihat di Manajemen Peserta EO</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-10 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/event/${event.slug}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9AA5] hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 text-[#E10600]" />
          Kembali ke Detail Event
        </Link>

        {/* Header */}
        <Card chamfer className="p-6 mb-8 bg-gradient-to-r from-[#1A0D10] to-[#131316]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand">FORMULIR PENDAFTARAN DINAMIS</Badge>
                <Badge variant="outline">{event.gameId}</Badge>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold uppercase text-white">
                {event.title}
              </h1>
              <p className="text-xs text-[#9A9AA5] mt-1">
                Kuota Tersedia:{' '}
                <strong className="text-white tabular-nums">
                  {event.registeredCount} / {form?.quota || event.quota} Tim
                </strong>{' '}
                · Biaya:{' '}
                <strong className="text-[#F5A524] tabular-nums">
                  {form?.fee > 0
                    ? `Rp ${Number(form.fee).toLocaleString('id-ID')}`
                    : 'GRATIS'}
                </strong>
              </p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identitas Tim / Peserta & Kontingen Komunitas */}
          <Card chamfer className="p-6 space-y-5">
            <h2 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E10600]" />
              1. Identitas Pendaftar & Afiliasi Komunitas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Kategori Pendaftaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['TEAM', 'INDIVIDUAL'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setParticipantType(type)}
                      className={`py-2.5 px-3 rounded border text-xs font-bold uppercase transition-colors ${
                        participantType === type
                          ? 'bg-[#E10600] border-[#E10600] text-white'
                          : 'bg-[#131316] border-[#2A2A31] text-[#9A9AA5]'
                      }`}
                    >
                      {type === 'TEAM' ? 'Tim / Skuad' : 'Individu / Solo'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Nickname Kapten / Pendaftar *
                </label>
                <input
                  type="text"
                  required
                  value={userNickname}
                  onChange={(e) => setUserNickname(e.target.value)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              {participantType === 'TEAM' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                    Nama Skuad / Tim Esport *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Contoh: Minang Kabau Pride"
                    className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Wakili Kontingen Komunitas (Opsional)
                </label>
                <select
                  value={communityId}
                  onChange={(e) => setCommunityId(e.target.value)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="">Independen (Tanpa Afiliasi Komunitas)</option>
                  <option value="comm-mlbb-sumbar">
                    Mobile Legends Sumbar Official
                  </option>
                  <option value="comm-val-sumbar">Valorant Sumatera Barat</option>
                  <option value="comm-ff-sumbar">Free Fire Minang</option>
                  <option value="comm-mlbb-padang">Sub-Komunitas MLBB Padang</option>
                </select>
              </div>
            </div>

            {/* Team Roster Builder */}
            {participantType === 'TEAM' && (
              <div className="pt-4 border-t border-[#2A2A31]">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold">
                    Daftar Roster Pemain ({teamMembers.length} Anggota)
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setTeamMembers((prev) => [
                        ...prev,
                        { nickname: '', gameId: '', role: 'Player' },
                      ])
                    }
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Pemain
                  </Button>
                </div>

                <div className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#131316] p-2.5 rounded border border-[#2A2A31]"
                    >
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Nickname In-Game"
                          value={member.nickname}
                          onChange={(e) => {
                            const next = [...teamMembers];
                            if (next[index]) next[index].nickname = e.target.value;
                            setTeamMembers(next);
                          }}
                          className="w-full bg-[#0B0B0D] border border-[#2A2A31] rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="ID Game / Tagline"
                          value={member.gameId}
                          onChange={(e) => {
                            const next = [...teamMembers];
                            if (next[index]) next[index].gameId = e.target.value;
                            setTeamMembers(next);
                          }}
                          className="w-full bg-[#0B0B0D] border border-[#2A2A31] rounded px-2.5 py-1.5 text-xs text-white tabular-nums"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Role (Jungler/Roam)"
                          value={member.role}
                          onChange={(e) => {
                            const next = [...teamMembers];
                            if (next[index]) next[index].role = e.target.value;
                            setTeamMembers(next);
                          }}
                          className="w-full bg-[#0B0B0D] border border-[#2A2A31] rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setTeamMembers((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className="p-1.5 text-[#9A9AA5] hover:text-[#FF3B30]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Section 2: Dynamic Custom Fields from EO Form Builder */}
          <Card chamfer className="p-6 space-y-5">
            <h2 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E10600]" />
              2. Pertanyaan Khusus Penyelenggara (Dynamic Schema EO)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(form?.fields || []).map((field: any) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold">
                    {field.label}{' '}
                    {field.required && <span className="text-[#E10600]">*</span>}
                  </label>

                  {field.type === 'SELECT' && field.options?.length > 0 ? (
                    <select
                      required={field.required}
                      value={answers[field.id] || ''}
                      onChange={(e) => {
                        setAnswers((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }));
                        if (field.id === 'originCity') {
                          setCity(e.target.value);
                        }
                      }}
                      className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                    >
                      {field.options.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder || `Isi ${field.label}`}
                      value={answers[field.id] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Section 3: Payment Proof Upload (Isolated Event Storage) */}
          {(form?.requirePaymentProof || form?.fee > 0) && (
            <Card chamfer className="p-6 space-y-4 border-[#F5A524]/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#F5A524]" />
                    3. Bukti Pembayaran (Isolated Event Storage)
                  </h2>
                  <p className="text-xs text-[#9A9AA5] mt-1">
                    {form.paymentInstructions}
                  </p>
                </div>
                <Badge variant="warning">
                  Rp {Number(form.fee).toLocaleString('id-ID')}
                </Badge>
              </div>

              <div className="p-4 bg-[#131316] border border-[#2A2A31] rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#9A9AA5] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F5A524] shrink-0" />
                  {proofFile ? (
                    <span>
                      File terunggah ke bucket privat:{' '}
                      <strong className="text-[#22C55E]">
                        {proofFile.fileName}
                      </strong>{' '}
                      (ID: {proofFile.id})
                    </span>
                  ) : (
                    <span>
                      Format didukung: PNG, JPG, WebP, PDF (Maks. 10 MB, tersimpan
                      privat dengan Signed URL).
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant={proofFile ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={uploadingProof}
                  onClick={handleUploadProof}
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  {uploadingProof
                    ? 'Mengunggah...'
                    : proofFile
                      ? 'Ganti Bukti Bayar'
                      : 'Upload Bukti Bayar'}
                </Button>
              </div>
            </Card>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#9A9AA5]">
              Dengan mendaftar, Anda menyetujui Rulebook turnamen dan kebijakan
              privasi data peserta (UU PDP).
            </p>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
            >
              {submitting ? 'Memvalidasi Formulir...' : 'Kirim Pendaftaran'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
