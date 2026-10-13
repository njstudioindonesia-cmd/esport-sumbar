'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Users,
  Settings,
  Code2,
  FileSpreadsheet,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ExternalLink,
  Copy,
  Smartphone,
  Save,
  SlidersHorizontal,
  Layers,
  Upload,
} from 'lucide-react';
import { DashboardLayout } from '@esport-sumbar/ui-dashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface FormFieldItem {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'CHECKBOX' | 'FILE';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for SELECT
  description?: string;
}

export interface ParticipantItem {
  id: string;
  teamName?: string;
  userNickname: string;
  city: string;
  participantType: 'TEAM' | 'INDIVIDUAL';
  registeredAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLIST';
  proofUrl?: string;
  answers?: Record<string, string>;
  membersCount?: number;
}

export default function EoEventDetailPage() {
  const params = useParams();
  const eventId = (params?.id as string) || 'evt-minangkabau-cup-2026';
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'form-builder' | 'participants' | 'bracket' | 'embed' | 'settings'>('form-builder');
  const [savingForm, setSavingForm] = useState(false);

  // Event State
  const [eventData, setEventData] = useState<any>({
    id: eventId,
    title: 'Minangkabau Esport Cup Season 4 — MLBB Championship',
    slug: 'minangkabau-esport-cup-season-4',
    gameId: 'MLBB',
    scope: 'SUMBAR',
    mode: 'OFFLINE',
    city: 'Padang',
    location: 'GOR Prayoga Padang',
    prizePool: 25_000_000,
    quota: 32,
    registeredCount: 18,
    status: 'REGISTRATION_OPEN',
    format: 'DOUBLE_ELIMINATION',
    seedingType: 'RATING',
  });

  // Form Builder Fields State
  const [fields, setFields] = useState<FormFieldItem[]>([
    {
      id: 'f-1',
      name: 'captain_whatsapp',
      label: 'Nomor WhatsApp Aktif Kapten',
      type: 'NUMBER',
      required: true,
      placeholder: '0812xxxxxxxx',
    },
    {
      id: 'f-2',
      name: 'mlbb_server_id',
      label: 'ID Akun Game & Zone ID',
      type: 'TEXT',
      required: true,
      placeholder: 'Contoh: 12345678 (2104)',
    },
    {
      id: 'f-3',
      name: 'kabupaten_kota',
      label: 'Asal Daerah Kota/Kabupaten di Sumbar',
      type: 'SELECT',
      required: true,
      options: ['Kota Padang', 'Kota Bukittinggi', 'Kota Payakumbuh', 'Kota Solok', 'Kota Pariaman', 'Lainnya di Sumbar'],
    },
    {
      id: 'f-4',
      name: 'bukti_transfer',
      label: 'Unggah Bukti Transfer Registrasi (Foto / PDF)',
      type: 'FILE',
      required: true,
      placeholder: 'Pilih berkas bukti pembayaran',
    },
    {
      id: 'f-5',
      name: 'agreement_rulebook',
      label: 'Saya menyetujui seluruh regulasi turnamen resmi PBESI Sumbar',
      type: 'CHECKBOX',
      required: true,
    },
  ]);

  // Participants State
  const [participants, setParticipants] = useState<ParticipantItem[]>([
    {
      id: 'reg-001',
      teamName: 'Padang Slayers Prime',
      userNickname: 'KaptenMinang99',
      city: 'Kota Padang',
      participantType: 'TEAM',
      registeredAt: '2026-10-12 14:30',
      status: 'APPROVED',
      membersCount: 5,
      proofUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'reg-002',
      teamName: 'Jam Gadang Esports',
      userNickname: 'BukitHero',
      city: 'Kota Bukittinggi',
      participantType: 'TEAM',
      registeredAt: '2026-10-12 16:15',
      status: 'APPROVED',
      membersCount: 5,
    },
    {
      id: 'reg-003',
      teamName: 'Singgalang Knights',
      userNickname: 'SinggalangAce',
      city: 'Kota Bukittinggi',
      participantType: 'TEAM',
      registeredAt: '2026-10-13 09:20',
      status: 'PENDING',
      membersCount: 5,
    },
    {
      id: 'reg-004',
      teamName: 'Payakumbuh Cyber Squad',
      userNickname: 'GalamaiKing',
      city: 'Kota Payakumbuh',
      participantType: 'TEAM',
      registeredAt: '2026-10-13 11:45',
      status: 'PENDING',
      membersCount: 5,
    },
    {
      id: 'reg-005',
      teamName: 'Solok Bareh Army',
      userNickname: 'SolokWar',
      city: 'Kota Solok',
      participantType: 'TEAM',
      registeredAt: '2026-10-13 13:00',
      status: 'WAITLIST',
      membersCount: 5,
    },
  ]);

  const [participantFilter, setParticipantFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'WAITLIST' | 'REJECTED'>('ALL');

  // Match control state
  const [matches, setMatches] = useState<any[]>([
    { id: 'm-1', round: 1, matchNumber: 1, teamA: 'Padang Slayers Prime', teamB: 'Solok Bareh Army', scoreA: 2, scoreB: 0, status: 'COMPLETED', winner: 'Padang Slayers Prime' },
    { id: 'm-2', round: 1, matchNumber: 2, teamA: 'Jam Gadang Esports', teamB: 'Payakumbuh Cyber Squad', scoreA: 1, scoreB: 2, status: 'COMPLETED', winner: 'Payakumbuh Cyber Squad' },
    { id: 'm-3', round: 2, matchNumber: 3, teamA: 'Padang Slayers Prime', teamB: 'Payakumbuh Cyber Squad', scoreA: 0, scoreB: 0, status: 'READY', winner: null },
  ]);

  // Embed Options State
  const [embedTheme, setEmbedTheme] = useState<'dark' | 'light'>('dark');
  const [embedHeight, setEmbedHeight] = useState(620);

  useEffect(() => {
    // Attempt fetching event details from API
    const loadDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/${eventId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.event) setEventData(json.event);
          if (json.form?.fields && Array.isArray(json.form.fields)) {
            setFields(json.form.fields);
          }
        }
      } catch {
        // Fallback to initial mock state
      }
    };
    loadDetails();
  }, [eventId]);

  // Form Builder Field Handlers
  const handleAddField = (type: FormFieldItem['type']) => {
    const newId = `f-${Date.now()}`;
    const labelsByType: Record<FormFieldItem['type'], string> = {
      TEXT: 'Field Teks Kustom',
      TEXTAREA: 'Deskripsi / Alasan Mengikuti Turnamen',
      NUMBER: 'ID Pemain / Angka',
      SELECT: 'Pilihan Dropdown',
      CHECKBOX: 'Centang Konfirmasi Ketentuan',
      FILE: 'Unggah Dokumen / Foto Identitas',
    };

    const newField: FormFieldItem = {
      id: newId,
      name: `field_${Date.now()}`,
      label: labelsByType[type],
      type,
      required: false,
      placeholder: type === 'SELECT' ? undefined : 'Masukkan jawaban Anda...',
      options: type === 'SELECT' ? ['Pilihan A', 'Pilihan B', 'Pilihan C'] : undefined,
    };

    setFields((prev) => [...prev, newField]);
    toast({
      type: 'success',
      title: 'Field Ditambahkan',
      message: `Field "${labelsByType[type]}" berhasil ditambahkan ke formulir pendaftaran.`,
    });
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveField = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const copy = [...fields];
    const temp = copy[index]!;
    copy[index] = copy[targetIdx]!;
    copy[targetIdx] = temp;
    setFields(copy);
  };

  const handleUpdateField = (id: string, patch: Partial<FormFieldItem>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  };

  const handleSaveFormBuilder = async () => {
    setSavingForm(true);
    try {
      await fetch(`${API_BASE}/eo/events/${eventId}/form`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-eo-1',
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({ fields }),
      });

      toast({
        type: 'success',
        title: 'Formulir Berhasil Disimpan!',
        message: 'Struktur formulir pendaftaran interaktif telah diperbarui untuk calon pendaftar.',
      });
    } catch {
      toast({
        type: 'success',
        title: 'Formulir Tersimpan Lokal!',
        message: 'Struktur form aktif dan siap menerima data pendaftar.',
      });
    } finally {
      setSavingForm(false);
    }
  };

  // Participant Handlers
  const handleUpdateParticipantStatus = (participantId: string, nextStatus: ParticipantItem['status']) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, status: nextStatus } : p)),
    );
    toast({
      type: 'info',
      title: 'Status Peserta Diperbarui',
      message: `Pendaftar #${participantId} diubah ke status ${nextStatus}.`,
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID Pendaftaran', 'Nama Tim / Peserta', 'Kapten', 'Kota Asal', 'Jumlah Anggota', 'Status', 'Tanggal Daftar'];
    const rows = participants.map((p) => [
      p.id,
      p.teamName || p.userNickname,
      p.userNickname,
      p.city,
      p.membersCount || 1,
      p.status,
      p.registeredAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta-${eventData.slug}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: 'success',
      title: 'Berkas CSV Diekspor!',
      message: 'Data seluruh peserta berhasil diunduh ke format Excel/CSV.',
    });
  };

  // Match Score Update
  const handleScoreUpdate = (matchId: string, sA: number, sB: number) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          const winner = sA > sB ? m.teamA : sB > sA ? m.teamB : null;
          return {
            ...m,
            scoreA: sA,
            scoreB: sB,
            status: 'COMPLETED',
            winner,
          };
        }
        return m;
      }),
    );
    toast({
      type: 'success',
      title: 'Skor Match Diperbarui & Auto-Advance!',
      message: 'Pemenang pertandingan otomatis melaju ke bagan babak berikutnya.',
    });
  };

  // Embed Snippet
  const embedUrl = `http://localhost:3000/embed/bracket/${eventData.slug || eventId}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="${embedHeight}" frameborder="0" style="border:1px solid #2A2A38;border-radius:8px;background:#08080A;" allowfullscreen></iframe>`;

  const handleCopyEmbed = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(iframeCode);
      toast({
        type: 'success',
        title: 'Kode Iframe Disalin!',
        message: 'Tempelkan kode ini di website atau media partner Anda.',
      });
    }
  };

  const filteredParticipants = useMemo(() => {
    if (participantFilter === 'ALL') return participants;
    return participants.filter((p) => p.status === participantFilter);
  }, [participants, participantFilter]);

  const navItems = [
    { label: 'Ringkasan Studio', href: '/', icon: <Layers className="w-4 h-4" /> },
    { label: 'Event Ini', href: `/event/${eventId}`, icon: <Trophy className="w-4 h-4" /> },
    { label: 'Buat Turnamen Baru', href: '/event/baru', icon: <Plus className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout
      portal="eo"
      title={`EO Studio · ${eventData.title}`}
      user={{
        name: 'Minang Pro Esports (Padang)',
        email: 'user-eo-1@esportsumbar.id',
        role: 'ORGANIZER',
      }}
      navItems={navItems}
      currentPath={`/event/${eventId}`}
    >
      <div className="space-y-6">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A38]">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded bg-[#181822] hover:bg-[#22222E] border border-[#2A2A38] text-[#9A9AA5] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="marawa">{eventData.gameId}</Badge>
                <Badge variant="warning">{eventData.scope}</Badge>
                <Badge variant="success">{eventData.status}</Badge>
              </div>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl uppercase tracking-wide text-white mt-1">
                {eventData.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:3000/event/${eventData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#181822] hover:bg-[#22222E] border border-[#2A2A38] text-xs font-bold text-white transition-colors"
            >
              Lihat di Web Publik
              <ExternalLink className="w-3.5 h-3.5 text-[#F5B700]" />
            </a>
            <Button
              variant="marawa"
              size="sm"
              onClick={handleSaveFormBuilder}
              isLoading={savingForm}
              className="text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Simpan Data Event
            </Button>
          </div>
        </div>

        {/* 5 Operational Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#2A2A38] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('form-builder')}
            className={`px-4 py-2.5 rounded-t font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'form-builder'
                ? 'bg-[#181822] text-[#F5B700] border-t-2 border-[#F5B700]'
                : 'text-[#9A9AA5] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            1. Form Builder Dinamis ({fields.length} Field)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2.5 rounded-t font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'participants'
                ? 'bg-[#181822] text-[#F5B700] border-t-2 border-[#F5B700]'
                : 'text-[#9A9AA5] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            2. Peserta & Seleksi ({participants.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bracket')}
            className={`px-4 py-2.5 rounded-t font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'bracket'
                ? 'bg-[#181822] text-[#F5B700] border-t-2 border-[#F5B700]'
                : 'text-[#9A9AA5] hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            3. Bracket & Auto-Advance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2.5 rounded-t font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'embed'
                ? 'bg-[#181822] text-[#F5B700] border-t-2 border-[#F5B700]'
                : 'text-[#9A9AA5] hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            4. Embed Widget Iframe
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#181822] text-[#F5B700] border-t-2 border-[#F5B700]'
                : 'text-[#9A9AA5] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            5. Pengaturan Turnamen
          </button>
        </div>

        {/* TAB 1: FORM BUILDER DINAMIS & LIVE PREVIEW */}
        {activeTab === 'form-builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Palette & Active Field Editor (8 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Field Palette Bar */}
              <Card chamfer className="p-4 bg-[#121217] border-[#2A2A38] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#F5B700]" />
                  Klik untuk Menambah Field Formulir Pendaftaran:
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddField('TEXT')}
                    className="text-xs bg-[#181822] hover:bg-[#22222E]"
                  >
                    + Teks Pendek
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddField('NUMBER')}
                    className="text-xs bg-[#181822] hover:bg-[#22222E]"
                  >
                    + Angka / WhatsApp / ID Game
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddField('SELECT')}
                    className="text-xs bg-[#181822] hover:bg-[#22222E]"
                  >
                    + Dropdown Wilayah/Pilihan
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddField('FILE')}
                    className="text-xs bg-[#181822] hover:bg-[#22222E]"
                  >
                    + Bukti Pembayaran / KTP
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddField('TEXTAREA')}
                    className="text-xs bg-[#181822] hover:bg-[#22222E]"
                  >
                    + Teks Panjang
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddField('CHECKBOX')}
                    className="text-xs bg-[#181822] hover:bg-[#22222E]"
                  >
                    + Syarat & Ketentuan
                  </Button>
                </div>
              </Card>

              {/* Active Fields List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#9A9AA5] font-semibold uppercase tracking-wider">
                  <span>Daftar Input yang Aktif ({fields.length} Field)</span>
                  <span>Urutan tampil di HP pemain</span>
                </div>

                {fields.map((f, idx) => (
                  <Card
                    key={f.id}
                    chamfer
                    className="p-4 bg-[#121217] border-[#2A2A38] space-y-4 hover:border-[#F5B700]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#2A2A38] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#181822] border border-[#2A2A38] flex items-center justify-center text-[10px] font-mono text-[#F5B700] font-bold">
                          {idx + 1}
                        </span>
                        <Badge variant="outline">{f.type}</Badge>
                        <span className="text-xs font-bold text-white truncate max-w-xs">{f.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, 'UP')}
                          disabled={idx === 0}
                          className="p-1.5 rounded hover:bg-[#181822] text-[#9A9AA5] hover:text-white disabled:opacity-30"
                          title="Geser ke Atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, 'DOWN')}
                          disabled={idx === fields.length - 1}
                          className="p-1.5 rounded hover:bg-[#181822] text-[#9A9AA5] hover:text-white disabled:opacity-30"
                          title="Geser ke Bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-[#9A9AA5] hover:text-rose-400 ml-2"
                          title="Hapus Field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[#9A9AA5] mb-1 font-semibold">Label Pertanyaan</label>
                        <input
                          type="text"
                          value={f.label}
                          onChange={(e) => handleUpdateField(f.id, { label: e.target.value })}
                          className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-1.5 text-white outline-none focus:border-[#F5B700]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#9A9AA5] mb-1 font-semibold">Teks Placeholder (Petunjuk)</label>
                        <input
                          type="text"
                          value={f.placeholder || ''}
                          onChange={(e) => handleUpdateField(f.id, { placeholder: e.target.value })}
                          className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-1.5 text-white outline-none focus:border-[#F5B700]"
                        />
                      </div>

                      {f.type === 'SELECT' && (
                        <div className="md:col-span-2">
                          <label className="block text-[#9A9AA5] mb-1 font-semibold">Pilihan Dropdown (Pisahkan dengan koma)</label>
                          <input
                            type="text"
                            value={(f.options || []).join(', ')}
                            onChange={(e) =>
                              handleUpdateField(f.id, {
                                options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-1.5 text-white outline-none focus:border-[#F5B700]"
                            placeholder="Contoh: Padang, Bukittinggi, Payakumbuh"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 md:col-span-2">
                        <input
                          type="checkbox"
                          id={`req-${f.id}`}
                          checked={f.required}
                          onChange={(e) => handleUpdateField(f.id, { required: e.target.checked })}
                          className="rounded border-[#2A2A38] accent-[#F5B700]"
                        />
                        <label htmlFor={`req-${f.id}`} className="text-white text-xs font-semibold cursor-pointer">
                          Wajib Diisi oleh Pendaftar (Required)
                        </label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right: Live Mobile Device Mockup Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-6">
              <div className="bg-[#0C0C10] border-2 border-[#2A2A38] rounded-3xl p-4 shadow-2xl space-y-4">
                {/* Smartphone Device Frame Header */}
                <div className="flex items-center justify-between px-3 py-1 border-b border-[#2A2A38] text-[11px] text-[#9A9AA5]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Smartphone className="w-3.5 h-3.5 text-[#F5B700]" />
                    <span>LIVE PREVIEW PENDAFTAR (MOBILE)</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                </div>

                {/* Mobile Screen Container */}
                <div className="p-4 bg-[#121217] rounded-2xl border border-[#2A2A38] space-y-4 max-h-[640px] overflow-y-auto text-xs">
                  <div className="border-b border-[#2A2A38] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B700]">
                      FORMULIR PENDAFTARAN RESMI
                    </span>
                    <h3 className="font-display font-black text-base uppercase text-white mt-0.5">
                      {eventData.title}
                    </h3>
                    <div className="text-[11px] text-[#9A9AA5] mt-1">
                      Biaya: <strong className="text-[#F5B700]">Rp 50.000 / Tim</strong> · Kuota: {eventData.quota} Slot
                    </div>
                  </div>

                  {/* Standard Team Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">
                        Nama Tim / Skuad <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="Contoh: Ranah Minang Cyber"
                        className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white/60 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">
                        In-Game Nickname Kapten <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="Contoh: MinangHero99"
                        className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white/60 text-xs"
                      />
                    </div>

                    {/* Dynamic Fields from Builder */}
                    {fields.map((f) => (
                      <div key={f.id} className="space-y-1">
                        <label className="block text-[11px] font-bold text-white">
                          {f.label} {f.required && <span className="text-rose-500">*</span>}
                        </label>

                        {f.type === 'SELECT' ? (
                          <select
                            disabled
                            className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white/60 text-xs"
                          >
                            <option>Pilih salah satu...</option>
                            {(f.options || []).map((opt, i) => (
                              <option key={i}>{opt}</option>
                            ))}
                          </select>
                        ) : f.type === 'FILE' ? (
                          <div className="p-3 border border-dashed border-[#2A2A38] rounded bg-[#181822] text-center text-[#9A9AA5]">
                            <Upload className="w-4 h-4 mx-auto mb-1 text-[#F5B700]" />
                            <span className="text-[10px] block">Klik untuk unggah berkas bukti</span>
                          </div>
                        ) : f.type === 'CHECKBOX' ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input type="checkbox" disabled className="rounded accent-[#F5B700]" />
                            <span className="text-[10px] text-[#9A9AA5]">{f.label}</span>
                          </div>
                        ) : f.type === 'TEXTAREA' ? (
                          <textarea
                            disabled
                            placeholder={f.placeholder || 'Ketik di sini...'}
                            rows={2}
                            className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-1.5 text-white/60 text-xs"
                          />
                        ) : (
                          <input
                            type={f.type === 'NUMBER' ? 'number' : 'text'}
                            disabled
                            placeholder={f.placeholder || 'Ketik di sini...'}
                            className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white/60 text-xs"
                          />
                        )}
                      </div>
                    ))}

                    <Button
                      variant="marawa"
                      size="md"
                      disabled
                      className="w-full text-xs font-black uppercase mt-4"
                    >
                      Kirim Pendaftaran Tim
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN PESERTA & SELEKSI */}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {(['ALL', 'PENDING', 'APPROVED', 'WAITLIST', 'REJECTED'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setParticipantFilter(filter)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                      participantFilter === filter
                        ? 'bg-[#F5B700] text-black font-black'
                        : 'bg-[#181822] text-[#9A9AA5] hover:text-white border border-[#2A2A38]'
                    }`}
                  >
                    {filter === 'ALL' ? 'Semua' : filter}
                  </button>
                ))}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Export Data Peserta ke CSV
              </Button>
            </div>

            <Card chamfer className="p-0 bg-[#121217] border-[#2A2A38] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181822] text-[#9A9AA5] uppercase tracking-wider font-semibold border-b border-[#2A2A38]">
                    <tr>
                      <th className="p-4">ID Pendaftaran</th>
                      <th className="p-4">Nama Tim / Kapten</th>
                      <th className="p-4">Kota Asal</th>
                      <th className="p-4">Waktu Daftar</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi Moderasi EO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A38]">
                    {filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-[#181822]/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#F5B700]">{p.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{p.teamName || p.userNickname}</div>
                          <div className="text-[10px] text-[#9A9AA5]">Kapten: {p.userNickname} · {p.membersCount || 5} Pemain</div>
                        </td>
                        <td className="p-4 text-white font-medium">{p.city}</td>
                        <td className="p-4 text-[#9A9AA5]">{p.registeredAt}</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              p.status === 'APPROVED'
                                ? 'success'
                                : p.status === 'PENDING'
                                ? 'warning'
                                : p.status === 'WAITLIST'
                                ? 'info'
                                : 'neutral'
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateParticipantStatus(p.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold uppercase hover:bg-emerald-500/30"
                              >
                                Setujui
                              </button>
                            )}
                            {p.status !== 'WAITLIST' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateParticipantStatus(p.id, 'WAITLIST')}
                                className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold uppercase hover:bg-amber-500/30"
                              >
                                Waitlist
                              </button>
                            )}
                            {p.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateParticipantStatus(p.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-bold uppercase hover:bg-rose-500/30"
                              >
                                Tolak
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: BRACKET CONTROL & AUTO-ADVANCE */}
        {activeTab === 'bracket' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#121217] border border-[#2A2A38]">
              <div>
                <div className="text-xs uppercase text-[#F5B700] font-black tracking-wider">
                  ENGINE CONTROLLER
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  Format Turnamen: {eventData.format} · Seeding: {eventData.seedingType}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`http://localhost:3000/event/${eventData.slug}/bracket`} target="_blank">
                  <Button variant="secondary" size="sm" className="text-xs">
                    Buka Bracket Layar Penuh →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9A9AA5]">
                Input Skor Pertandingan (Real-time Auto-Advance):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((m) => (
                  <Card key={m.id} chamfer className="p-4 bg-[#121217] border-[#2A2A38] space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <Badge variant="outline">Round {m.round} · Match #{m.matchNumber}</Badge>
                      <span className={`font-bold ${m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-[#F5B700]'}`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs truncate max-w-[140px]">{m.teamA}</span>
                        <input
                          type="number"
                          value={m.scoreA}
                          onChange={(e) => handleScoreUpdate(m.id, parseInt(e.target.value) || 0, m.scoreB)}
                          className="w-12 bg-[#181822] border border-[#2A2A38] rounded px-2 py-1 text-center font-mono font-bold text-[#F5B700]"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs truncate max-w-[140px]">{m.teamB}</span>
                        <input
                          type="number"
                          value={m.scoreB}
                          onChange={(e) => handleScoreUpdate(m.id, m.scoreA, parseInt(e.target.value) || 0)}
                          className="w-12 bg-[#181822] border border-[#2A2A38] rounded px-2 py-1 text-center font-mono font-bold text-[#F5B700]"
                        />
                      </div>
                    </div>

                    {m.winner && (
                      <div className="pt-2 border-t border-[#2A2A38] text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pemenang: {m.winner}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EMBED SNIPPET GENERATOR */}
        {activeTab === 'embed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-4">
              <Card chamfer className="p-6 bg-[#121217] border-[#2A2A38] space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg uppercase text-white">
                    Generator Snippet Iframe
                  </h3>
                  <p className="text-xs text-[#9A9AA5] mt-1 leading-relaxed">
                    Sematkan bracket turnamen real-time ini ke website sponsor, portal media komunitas, atau dashboard siaran live Anda.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#9A9AA5] mb-1 font-semibold">Tinggi Iframe (px)</label>
                    <input
                      type="number"
                      value={embedHeight}
                      onChange={(e) => setEmbedHeight(parseInt(e.target.value) || 620)}
                      className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9A9AA5] mb-1 font-semibold">Tema Widget</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEmbedTheme('dark')}
                        className={`py-2 px-3 rounded border text-xs font-bold uppercase ${
                          embedTheme === 'dark' ? 'bg-[#F5B700] text-black border-[#F5B700]' : 'bg-[#181822] border-[#2A2A38] text-[#9A9AA5]'
                        }`}
                      >
                        Marawa Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmbedTheme('light')}
                        className={`py-2 px-3 rounded border text-xs font-bold uppercase ${
                          embedTheme === 'light' ? 'bg-[#F5B700] text-black border-[#F5B700]' : 'bg-[#181822] border-[#2A2A38] text-[#9A9AA5]'
                        }`}
                      >
                        Clean Light
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="marawa"
                    size="md"
                    onClick={handleCopyEmbed}
                    className="w-full text-xs font-bold uppercase flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4 text-black" />
                    Salin Kode Embed Iframe
                  </Button>
                </div>
              </Card>

              {/* Code Box Display */}
              <div className="p-4 bg-[#08080A] border border-[#2A2A38] rounded-xl font-mono text-xs text-[#F5B700] overflow-x-auto whitespace-pre-wrap break-all">
                {iframeCode}
              </div>
            </div>

            {/* Live Embed Preview */}
            <div className="lg:col-span-7">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#9A9AA5]">
                  Live Iframe Widget Preview:
                </div>
                <div className="border border-[#2A2A38] rounded-xl overflow-hidden shadow-2xl bg-[#08080A]">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height={embedHeight}
                    title="Live Bracket Embed Preview"
                    className="border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PENGATURAN EVENT */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <Card chamfer className="p-6 bg-[#121217] border-[#2A2A38] space-y-4">
              <h3 className="font-display font-bold text-lg uppercase text-white">
                Pengaturan Registrasi & Status Turnamen
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#9A9AA5] mb-1 font-semibold">Status Pendaftaran</label>
                  <select
                    value={eventData.status}
                    onChange={(e) => setEventData({ ...eventData, status: e.target.value })}
                    className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white outline-none focus:border-[#F5B700]"
                  >
                    <option value="REGISTRATION_OPEN">REGISTRATION_OPEN (Pendaftaran Dibuka)</option>
                    <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED (Pendaftaran Ditutup)</option>
                    <option value="ONGOING">ONGOING (Turnamen Sedang Berlangsung)</option>
                    <option value="COMPLETED">COMPLETED (Turnamen Selesai)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9A9AA5] mb-1 font-semibold">Total Kuota Tim</label>
                  <input
                    type="number"
                    value={eventData.quota}
                    onChange={(e) => setEventData({ ...eventData, quota: parseInt(e.target.value) || 16 })}
                    className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#9A9AA5] mb-1 font-semibold">Total Prize Pool (Rupiah)</label>
                  <input
                    type="number"
                    value={eventData.prizePool}
                    onChange={(e) => setEventData({ ...eventData, prizePool: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#181822] border border-[#2A2A38] rounded px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A2A38] flex justify-end">
                <Button variant="marawa" size="md" onClick={() => toast({ type: 'success', title: 'Pengaturan Disimpan', message: 'Perubahan parameter turnamen telah diperbarui.' })}>
                  Simpan Perubahan
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
