'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Check,
  Clock,
  Trophy,
  ExternalLink,
  RefreshCw,
  Send,
} from 'lucide-react';
import { getSession } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TOURNAMENT' | 'SYSTEM' | 'COMMUNITY' | 'MATCH_ALERT';
  read: boolean;
  link?: string;
  createdAt: string;
}

export default function NotifikasiPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>('usr-gamer-1');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'TOURNAMENT' | 'SYSTEM'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    const { user } = getSession();
    if (user?.id) {
      setUserId(user.id);
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        toast({
          type: 'info',
          title: 'Notifikasi Dibaca',
          message: 'Status notifikasi telah diperbarui.',
        });
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: err.message,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast({
          type: 'success',
          title: 'Semua Notifikasi Ditandai Dibaca',
          message: 'Seluruh notifikasi Anda telah diperbarui.',
        });
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: err.message,
      });
    }
  };

  const handleSimulateReminder = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/remind-tournament`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'evt-minangkabau-cup-2026',
          eventTitle: 'Minangkabau Esport Cup Season 4 (MLBB)',
          participantUserIds: [userId],
          scheduleTime: 'Hari ini pukul 19:30 WIB',
        }),
      });

      if (res.ok) {
        toast({
          type: 'success',
          title: 'Pengingat Turnamen Terkirim!',
          message: 'Notifikasi reminder dan mock email dispatch berhasil dibuat.',
        });
        await fetchNotifications();
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Simulasi Gagal',
        message: err.message,
      });
    } finally {
      setSimulating(false);
    }
  };

  const filteredList = notifications.filter((item) => {
    if (filterType === 'UNREAD') return !item.read;
    if (filterType === 'TOURNAMENT') return item.type === 'TOURNAMENT' || item.type === 'MATCH_ALERT';
    if (filterType === 'SYSTEM') return item.type === 'SYSTEM';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F5F5F7] py-8 px-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26262B]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-[#E10600] rounded-sm" />
              <h1 className="font-display text-2xl md:text-3xl font-black uppercase tracking-wide text-white flex items-center gap-2">
                Pusat Notifikasi
                {unreadCount > 0 && (
                  <span className="bg-[#E10600] text-white text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                    {unreadCount} Baru
                  </span>
                )}
              </h1>
            </div>
            <p className="text-xs text-[#9A9AA5]">
              Update pengingat jadwal pertandingan, verifikasi EO, dan aktivitas komunitas Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              chamfer={false}
              onClick={handleSimulateReminder}
              disabled={simulating}
              className="text-xs flex items-center gap-1.5 border-[#26262B] bg-[#121216]"
            >
              <Send className="w-3.5 h-3.5 text-[#E10600]" />
              {simulating ? 'Mengirim...' : 'Kirim Simulasi Reminder'}
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                chamfer={false}
                onClick={handleMarkAllAsRead}
                className="text-xs flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                Tandai Semua Dibaca
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              title="Refresh"
              className="p-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: 'ALL', label: 'Semua' },
              { id: 'UNREAD', label: `Belum Dibaca (${unreadCount})` },
              { id: 'TOURNAMENT', label: 'Turnamen & Jadwal' },
              { id: 'SYSTEM', label: 'Sistem & Akun' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                filterType === tab.id
                  ? 'bg-[#E10600] text-white shadow-lg shadow-[#E10600]/20'
                  : 'bg-[#121216] text-[#9A9AA5] hover:text-white border border-[#26262B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Notifications */}
        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-[#E10600] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-wider">
                Memuat notifikasi...
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-[#121216] border border-[#26262B] rounded-xl p-12 text-center space-y-3">
              <Bell className="w-10 h-10 text-[#5A5A66] mx-auto opacity-50" />
              <h3 className="font-display text-base uppercase font-bold text-white">
                Tidak Ada Notifikasi
              </h3>
              <p className="text-xs text-[#9A9AA5] max-w-sm mx-auto">
                Anda tidak memiliki notifikasi pada kategori ini. Klik &quot;Kirim Simulasi Reminder&quot; untuk menguji pengiriman pemberitahuan instan.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !item.read
                    ? 'bg-[#18181E] border-[#E10600]/40 shadow-sm'
                    : 'bg-[#121216] border-[#26262B] hover:border-[#383842]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon indicator */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === 'TOURNAMENT' || item.type === 'MATCH_ALERT'
                        ? 'bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {item.type === 'TOURNAMENT' ? (
                      <Trophy className="w-4 h-4" />
                    ) : item.type === 'MATCH_ALERT' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{item.title}</span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#E10600]" title="Belum dibaca" />
                      )}
                      <Badge variant="neutral" className="text-[10px] font-mono uppercase">
                        {item.type}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#9A9AA5] leading-relaxed">{item.message}</p>

                    <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-[#5A5A66]">
                      <span>{new Date(item.createdAt).toLocaleString('id-ID')}</span>
                      {item.link && (
                        <Link
                          href={item.link}
                          className="text-[#E10600] hover:underline flex items-center gap-1 font-semibold"
                        >
                          Lihat Tautan <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Read Action button */}
                {!item.read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Tandai telah dibaca"
                    className="p-1.5 rounded-lg text-[#9A9AA5] hover:text-white hover:bg-[#26262B] transition-colors shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
