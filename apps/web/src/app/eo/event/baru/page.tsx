'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
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

      router.push(`/eo/event/${data.event.id}`);
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
      <div className="max-w-3xl mx-auto">
        <Link
          href="/eo/dashboard"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9AA5] hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 text-[#E10600]" />
          Kembali ke Dashboard EO
        </Link>

        <div className="mb-6">
          <Badge variant="brand">WIZARD TURNAMEN BARU</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase text-white mt-2">
            Buat Event / <span className="text-[#E10600]">Turnamen Esport</span>
          </h1>
          <p className="text-xs md:text-sm text-[#9A9AA5] mt-1">
            Sistem akan otomatis menyiapkan halaman publik, Form Builder pendaftaran
            dinamis, dan bucket Event Storage terisolasi (kuota 50 MB).
          </p>
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
              <Link href="/eo/dashboard">
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
