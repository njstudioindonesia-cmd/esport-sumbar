'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Sparkles, Wand2, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function CreateEoEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [gameId, setGameId] = useState('MLBB');
  const [scope, setScope] = useState<'SUMBAR' | 'NASIONAL' | 'GLOBAL'>('SUMBAR');
  const [mode, setMode] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');
  const [city, setCity] = useState('Padang');
  const [location, setLocation] = useState('GOR Prayoga Padang');
  const [prizePool, setPrizePool] = useState(10_000_000);
  const [prizeDescription, setPrizeDescription] = useState(
    'Juara 1: Rp 5.000.000 · Juara 2: Rp 3.000.000 · Juara 3: Rp 2.000.000',
  );
  const [quota, setQuota] = useState(32);
  const [fee, setFee] = useState(50_000);
  const [description, setDescription] = useState(
    'Turnamen kompetitif resmi untuk menjaring talenta esport terbaik Sumatera Barat.',
  );

  // EO AI Assistant State
  const [aiPrompt, setAiPrompt] = useState(
    'Turnamen Mobile Legends di Bukittinggi untuk 32 tim prize pool 5jt rupiah babak eliminasi di Jam Gadang',
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPackage, setAiPackage] = useState<any>(null);
  const [showAiRulebook, setShowAiRulebook] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/eo-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          game: gameId,
          city: city,
          targetTeams: quota,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Gagal memanggil EO AI Assistant');
      }

      const pkg = data.package || data;
      setAiPackage(pkg);

      if (pkg.title) setTitle(pkg.title);
      if (pkg.description) setDescription(pkg.description);
      if (pkg.prizeDistribution) setPrizeDescription(pkg.prizeDistribution);
      if (pkg.recommendedBestOf) {
        // AI format recommended
      }

      toast({
        type: 'success',
        title: '✨ AI Assistant Berhasil Menghasilkan Proposal!',
        message: 'Judul, deskripsi, pembagian hadiah, dan rulebook turnamen telah otomatis terisi.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menjalankan AI Assistant',
        message: err.message,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/eo/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-eo-1',
          'x-user-role': 'ORGANIZER',
        },
        body: JSON.stringify({
          organizerId: 'user-eo-1',
          organizerName: 'Minang Pro Organizer',
          title,
          gameId,
          scope,
          mode,
          city,
          location,
          prizePool: Number(prizePool),
          prizeDescription,
          quota: Number(quota),
          fee: Number(fee),
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Gagal membuat turnamen baru');
      }

      toast({
        type: 'success',
        title: 'Turnamen Berhasil Dibuat!',
        message: `"${data.event.title}" beserta Form Builder pendaftaran siap dikelola.`,
      });

      router.push(`/event/${data.event.id}`);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Membuat Event',
        message: err?.message || 'Periksa kembali input Anda.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-10 px-4 pb-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9AA5] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 text-[#E10600]" />
          Kembali ke Dashboard EO
        </Link>

        <div>
          <Badge variant="brand">WIZARD TURNAMEN BARU</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white mt-2">
            Buat Event / <span className="text-[#E10600]">Turnamen Esport</span>
          </h1>
          <p className="text-xs md:text-sm text-[#9A9AA5] mt-1">
            Sistem akan otomatis menyiapkan halaman publik, Form Builder pendaftaran
            dinamis, dan bucket Event Storage terisolasi (kuota 50 MB).
          </p>
        </div>

        {/* EO AI ASSISTANT GENERATOR CARD */}
        <div className="bg-gradient-to-r from-[#171113] via-[#15151A] to-[#121217] border border-[#E10600]/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#E10600]/20 border border-[#E10600]/30 flex items-center justify-center text-[#E10600]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  EO AI Assistant · <span className="text-[#E10600]">Auto Proposal & Format</span>
                </h3>
                <span className="text-[11px] text-[#9A9AA5]">
                  Claude/Mock LLM v1.0.0 siap meracik judul, regulasi resmi Minang, dan format bracket
                </span>
              </div>
            </div>
            <Badge variant="brand" className="font-mono text-[10px] hidden sm:inline-block">
              AI ENGINE READY
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={2}
                placeholder="Tulis ide turnamen Anda, cth: Turnamen Valorant mahasiswa Padang 16 tim prize 3 juta rupiah..."
                className="w-full bg-[#0D0D10] border border-[#2A2A31] focus:border-[#E10600] rounded-lg p-3 text-xs md:text-sm text-white placeholder-[#5A5A66] outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-[11px] text-[#9A9AA5]">
                <span>Contoh:</span>
                <button
                  type="button"
                  onClick={() =>
                    setAiPrompt(
                      'Turnamen Mobile Legends di Bukittinggi untuk 32 tim prize pool 5jt rupiah babak eliminasi di Jam Gadang',
                    )
                  }
                  className="hover:text-white underline decoration-dotted"
                >
                  MLBB Bukittinggi
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() =>
                    setAiPrompt(
                      'Turnamen Valorant Campus Series antar mahasiswa Unand dan UNP Padang 16 tim prize pool 10jt',
                    )
                  }
                  className="hover:text-white underline decoration-dotted"
                >
                  Valorant Kampus Padang
                </button>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                chamfer={false}
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="text-xs uppercase font-display font-bold flex items-center gap-1.5 shadow-md shadow-[#E10600]/20"
              >
                <Wand2 className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiLoading ? 'Meracik Proposal...' : 'Generate dengan AI'}
              </Button>
            </div>

            {aiPackage && (
              <div className="mt-4 pt-3 border-t border-[#26262B] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Proposal & Aturan Berhasil Digenerate
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAiRulebook(!showAiRulebook)}
                    className="text-[#E10600] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {showAiRulebook ? 'Sembunyikan Rulebook' : 'Lihat Rulebook Lengkap'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#0E0E12] p-2.5 rounded border border-[#222228]">
                  <div>
                    <span className="text-[#5A5A66] block">Format Rekomendasi:</span>
                    <strong className="text-white font-mono">
                      {aiPackage.recommendedFormat} (Best of {aiPackage.recommendedBestOf})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#5A5A66] block">Kolom Formulir Dianjurkan:</span>
                    <span className="text-[#9A9AA5]">
                      {aiPackage.suggestedFormFields?.slice(0, 2).join(', ')}...
                    </span>
                  </div>
                </div>

                {showAiRulebook && (
                  <div className="bg-[#09090C] border border-[#26262B] rounded p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-[#A0A0B0] whitespace-pre-wrap leading-relaxed">
                    {aiPackage.rulebook}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <Card chamfer className="p-6 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                Judul Turnamen / Event *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Piala Walikota Padang MLBB Championship 2026"
                className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2.5 text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Cabang Game *
                </label>
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="MLBB">Mobile Legends (MLBB)</option>
                  <option value="VALORANT">Valorant</option>
                  <option value="FREE_FIRE">Free Fire</option>
                  <option value="PUBG_MOBILE">PUBG Mobile</option>
                  <option value="EFOOTBALL">eFootball</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Cakupan Wilayah
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="SUMBAR">Sumatera Barat</option>
                  <option value="NASIONAL">Nasional</option>
                  <option value="GLOBAL">Global</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Mode Pertandingan
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="OFFLINE">Offline (Venue LAN)</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Kota / Kabupaten Sumbar
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Nama Venue / Lokasi Spesifik
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Total Prize Pool (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white tabular-nums outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Kuota Maksimal Tim
                </label>
                <input
                  type="number"
                  min={2}
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white tabular-nums outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                  Biaya Pendaftaran (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                  className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white tabular-nums outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                Rincian Pembagian Hadiah
              </label>
              <input
                type="text"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9A9AA5] font-semibold mb-1.5">
                Deskripsi & Ringkasan Peraturan
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#131316] border border-[#2A2A31] focus:border-[#E10600] rounded px-3 py-2 text-sm text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A31]">
              <Link href="/">
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={submitting}>
                <PlusCircle className="w-4 h-4 mr-1.5" />
                {submitting ? 'Membuat Turnamen...' : 'Publikasikan & Buka Form Builder'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
