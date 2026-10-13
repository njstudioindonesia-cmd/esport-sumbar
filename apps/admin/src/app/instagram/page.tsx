'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface SyncedMedia {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'CAROUSEL' | 'VIDEO';
  likeCount: number;
  commentsCount: number;
  extractedTitle: string;
  extractedGame: string;
  status: 'PROCESSED' | 'DRAFT_CREATED';
  timestamp: string;
}

const MOCK_SYNCED_MEDIA: SyncedMedia[] = [
  {
    id: 'ig-1804291823901',
    caption: '🔥 SIAPKAN TIM TERBAIKMU! Kualifikasi Padang Mobile Legends Battleground resmi dibuka pendaftaran mulai hari ini! Total prize pool Rp 15.000.000 #esportsumbar #mlbb #padang',
    mediaType: 'IMAGE',
    likeCount: 342,
    commentsCount: 48,
    extractedTitle: 'Kualifikasi Padang Mobile Legends Battleground Dibuka',
    extractedGame: 'Mobile Legends',
    status: 'DRAFT_CREATED',
    timestamp: '2 jam lalu',
  },
  {
    id: 'ig-1804291823902',
    caption: 'Selamat kepada @padang.slayers berhasil mengamankan gelar juara 1 turnamen Valorant Minang Pride Cup 2026! 🔥🏆 #esportsumbar #valorant #sumbarjuara',
    mediaType: 'CAROUSEL',
    likeCount: 512,
    commentsCount: 63,
    extractedTitle: 'Padang Slayers Raih Juara 1 Valorant Minang Pride Cup 2026',
    extractedGame: 'Valorant',
    status: 'PROCESSED',
    timestamp: '1 hari lalu',
  },
  {
    id: 'ig-1804291823903',
    caption: 'Pengumuman resmi: Jadwal pertandingan babak semifinal Free Fire Bukittinggi Clash diundur 1 jam karena kendala teknis jaringan. #esportsumbar #freefire',
    mediaType: 'IMAGE',
    likeCount: 198,
    commentsCount: 22,
    extractedTitle: 'Jadwal Semifinal Free Fire Bukittinggi Clash Diundur 1 Jam',
    extractedGame: 'Free Fire',
    status: 'PROCESSED',
    timestamp: '3 hari lalu',
  },
];

export default function AdminInstagramPage() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [mode, setMode] = useState<'REVIEW' | 'AUTO'>('REVIEW');
  const [mediaList] = useState<SyncedMedia[]>(MOCK_SYNCED_MEDIA);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        type: 'success',
        title: 'Sinkronisasi Instagram Berhasil!',
        message: '3 feed media terbaru dari @esportsumbar berhasil ditarik dan diproses oleh pipeline AI.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'REVIEW' ? 'AUTO' : 'REVIEW';
    setMode(nextMode);
    toast({
      type: 'info',
      title: `Mode Sinkronisasi Diubah ke ${nextMode}`,
      message:
        nextMode === 'REVIEW'
          ? 'Konten Instagram akan masuk ke antrean kurasi redaksi (REVIEW) sebelum tayang.'
          : 'Konten Instagram otomatis dipublikasikan ke portal publik.',
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
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            Kembali ke Dashboard Admin
          </Link>
          <div className="flex items-center gap-2">
            <InstagramIcon className="w-6 h-6 text-purple-400" />
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white font-display">
              Meta Instagram Graph API
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Integrasi resmi Meta Graph API untuk akun resmi <strong>@esportsumbar</strong>. Mengotomasi penarikan berita dan deteksi turnamen baru.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSyncNow}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Menyinkronkan...' : 'Sinkronkan Media Sekarang'}
          </Button>
        </div>
      </div>

      {/* Account Status Card */}
      <Card chamfer className="p-6 bg-neutral-900 border-neutral-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">@esportsumbar</h3>
                <Badge variant="success">TERHUBUNG</Badge>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Instagram Business Account · Page ID: 104829104810283 · IG User ID: 1784140029381
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Masa Berlaku Token: 52 Hari (Long-Lived Access Token)
                </span>
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <Clock className="w-3.5 h-3.5" />
                  Sinkronisasi Terakhir: 15 menit lalu
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <div>
              <div className="text-xs font-bold text-neutral-200">Mode Ingesti</div>
              <div className="text-[11px] text-neutral-500">
                {mode === 'REVIEW' ? 'Kurasi Redaksi (REVIEW)' : 'Auto-Publish'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleMode}
              className="p-1 text-purple-400 hover:text-purple-300"
            >
              {mode === 'REVIEW' ? (
                <ToggleLeft className="w-7 h-7 text-neutral-500" />
              ) : (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Synced Media List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
          Feed Media yang Disinkronkan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mediaList.map((media) => (
            <Card
              key={media.id}
              chamfer
              className="p-5 bg-neutral-900 border-neutral-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="brand">{media.extractedGame}</Badge>
                  <span className="text-neutral-500 text-[11px]">{media.timestamp}</span>
                </div>
                <h4 className="font-bold text-sm text-white leading-snug">
                  {media.extractedTitle}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-3">
                  {media.caption}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-3">
                  <span>❤️ {media.likeCount}</span>
                  <span>💬 {media.commentsCount}</span>
                </div>
                <Badge variant={media.status === 'DRAFT_CREATED' ? 'warning' : 'info'}>
                  {media.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
