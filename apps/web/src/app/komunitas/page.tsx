'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MOCK_COMMUNITIES,
  MOCK_COMMUNITY_POSTS,
} from '../../lib/mock-data';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input, Textarea } from '../../components/ui/form';
import { Modal } from '../../components/ui/modal';
import { useToast } from '../../components/ui/toast';
import { Community } from '@esport-sumbar/contracts';

const GAME_FILTERS = [
  { label: 'Semua Game', value: 'ALL' },
  { label: 'Mobile Legends', value: 'mobile-legends' },
  { label: 'Free Fire', value: 'free-fire' },
  { label: 'Valorant', value: 'valorant' },
  { label: 'PUBG Mobile', value: 'pubg-mobile' },
];

const SUMBAR_REGIONS = [
  'Semua Wilayah',
  'Sumatera Barat',
  'Padang',
  'Bukittinggi',
  'Payakumbuh',
  'Solok',
  'Pariaman',
  'Padang Panjang',
  'Sawahlunto',
  'Agam',
  'Tanah Datar',
];

export default function KomunitasCatalogPage() {
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [selectedGame, setSelectedGame] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'OFFICIAL' | 'USER'>('ALL');
  const [selectedRegion, setSelectedRegion] = useState('Semua Wilayah');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(['com-001', 'com-003']));

  // Create Sub-Community Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGame, setNewGame] = useState('mobile-legends');
  const [newRegion, setNewRegion] = useState('Padang');
  const [newDesc, setNewDesc] = useState('');

  const { toast } = useToast();

  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      const matchGame =
        selectedGame === 'ALL' || c.gameId.toLowerCase() === selectedGame.toLowerCase();
      const matchType = selectedType === 'ALL' || c.type === selectedType;
      const matchRegion =
        selectedRegion === 'Semua Wilayah' ||
        (c.region || '').toLowerCase().includes(selectedRegion.toLowerCase());
      const matchSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchGame && matchType && matchRegion && matchSearch;
    });
  }, [communities, selectedGame, selectedType, selectedRegion, searchQuery]);

  const myFeedPosts = useMemo(() => {
    return MOCK_COMMUNITY_POSTS.filter((p) => joinedIds.has(p.communityId));
  }, [joinedIds]);

  const handleToggleJoin = (com: Community) => {
    const next = new Set(joinedIds);
    const isJoining = !next.has(com.id);

    if (isJoining) {
      next.add(com.id);
      setCommunities((prev) =>
        prev.map((item) =>
          item.id === com.id ? { ...item, memberCount: item.memberCount + 1 } : item,
        ),
      );
      toast({
        type: 'success',
        title: 'Berhasil Bergabung!',
        message: `Kamu kini menjadi anggota ${com.name}.`,
      });
    } else {
      next.delete(com.id);
      setCommunities((prev) =>
        prev.map((item) =>
          item.id === com.id
            ? { ...item, memberCount: Math.max(0, item.memberCount - 1) }
            : item,
        ),
      );
      toast({
        type: 'info',
        title: 'Keluar dari Komunitas',
        message: `Kamu telah keluar dari ${com.name}.`,
      });
    }
    setJoinedIds(next);
  };

  const handleCreateSubCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim().length < 4) {
      toast({
        type: 'error',
        title: 'Nama Tidak Valid',
        message: 'Nama sub-komunitas minimal 4 karakter.',
      });
      return;
    }

    const slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const created: Community = {
      id: `com-usr-${Date.now()}`,
      gameId: newGame,
      name: newName.trim(),
      slug,
      description:
        newDesc.trim() ||
        `Sub-komunitas pemain dan squad ${newGame} wilayah ${newRegion}, Sumatera Barat.`,
      type: 'USER',
      ownerId: 'usr-player-1',
      region: newRegion,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    setCommunities((prev) => [created, ...prev]);
    setJoinedIds((prev) => new Set(prev).add(created.id));
    setIsCreateOpen(false);
    setNewName('');
    setNewDesc('');

    toast({
      type: 'success',
      title: 'Sub-Komunitas Dibuat!',
      message: `${created.name} berhasil dibuat dengan kamu sebagai OWNER.`,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-900)] text-[var(--text-100)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--line)] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[var(--red-500)] inline-block"></span>
            <span className="text-xs uppercase tracking-widest font-black text-[var(--red-400)]">
              Markas Komunitas & Guild Daerah
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-display">
            Komunitas Esport Sumatera Barat
          </h1>
          <p className="text-sm text-[var(--text-400)] mt-1 max-w-2xl">
            Temukan komunitas resmi cabang game maupun sub-komunitas kabupaten/kota di Ranah Minang.
            Cari tim scrim, diskusi strategi, dan pantau bracket turnamen komunitas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="http://localhost:3002/moderasi"
            className="text-xs px-3 py-1.5 rounded border border-[#2A2A38] hover:border-[#F5B700] text-[#9A9AA5] hover:text-[#F5B700] transition-colors"
          >
            🛡️ Moderasi Admin Console →
          </a>
          <Button
            variant="marawa"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs"
          >
            + Buat Sub-Komunitas Daerah
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-800)] border border-[var(--line)] p-4 mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Game Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {GAME_FILTERS.map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGame(g.value)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors chamfer-cut-sm ${
                  selectedGame === g.value
                    ? 'bg-[#F5B700] text-black font-black shadow-md shadow-[#F5B700]/20'
                    : 'bg-[var(--bg-700)] text-[var(--text-400)] hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full lg:w-72">
            <Input
              placeholder="Cari nama komunitas atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--bg-900)] border-[var(--line)] text-xs py-1.5"
            />
          </div>
        </div>

        {/* Secondary Filters: Type & Region */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-[var(--text-400)]">Tipe:</span>
            {(['ALL', 'OFFICIAL', 'USER'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 text-xs rounded-sm border transition-all ${
                  selectedType === t
                    ? 'border-[var(--red-500)] bg-[var(--line)] text-white font-bold'
                    : 'border-transparent bg-[var(--bg-900)] text-[var(--text-400)] hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'Semua' : t === 'OFFICIAL' ? 'Resmi (Official)' : 'Sub-Komunitas Warga'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-[var(--text-400)]">Wilayah:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-[var(--bg-900)] border border-[var(--line)] text-xs text-white px-3 py-1.5 rounded-sm focus:outline-none focus:border-[var(--red-500)]"
            >
              {SUMBAR_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Cols Community Cards + 1 Col Joined Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Community List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white border-l-2 border-[var(--red-500)] pl-3">
              Daftar Komunitas ({filteredCommunities.length})
            </h2>
            <span className="text-xs text-[var(--text-400)]">
              Tergabung di {joinedIds.size} komunitas
            </span>
          </div>

          {filteredCommunities.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-800)] border border-[var(--line)]">
              <p className="text-sm text-[var(--text-400)]">
                Belum ada komunitas yang sesuai dengan filter pencarian.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCommunities.map((com) => {
                const isJoined = joinedIds.has(com.id);
                return (
                  <Card
                    key={com.id}
                    chamfer
                    className="bg-[var(--bg-800)] border-[var(--line)] hover:border-[var(--red-500)]/60 p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge
                          variant={com.type === 'OFFICIAL' ? 'brand' : 'info'}
                          size="sm"
                        >
                          {com.type === 'OFFICIAL' ? '✓ OFFICIAL' : 'SUB-KOMUNITAS'}
                        </Badge>
                        <span className="text-xs text-[var(--text-400)] font-medium">
                          📍 {com.region || 'Sumatera Barat'}
                        </span>
                      </div>

                      <Link href={`/komunitas/${com.slug}`}>
                        <h3 className="text-lg font-extrabold text-white hover:text-[var(--red-400)] transition-colors uppercase font-display leading-snug mb-2">
                          {com.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-[var(--text-400)] leading-relaxed line-clamp-2 mb-4">
                        {com.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="font-bold text-white tabular-nums">
                          {com.memberCount.toLocaleString('id-ID')}
                        </span>{' '}
                        <span className="text-[var(--text-400)]">Anggota</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={isJoined ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleJoin(com)}
                          className="text-xs"
                        >
                          {isJoined ? '✓ Tergabung' : '+ Gabung'}
                        </Button>
                        <Link href={`/komunitas/${com.slug}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Buka →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Feed dari Komunitas yang Diikuti */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-800)] border border-[var(--line)] p-5">
            <h3 className="text-base font-bold uppercase tracking-wider text-white font-display pb-3 mb-4 border-b border-[var(--line)]">
              🔥 Feed Komunitas Saya
            </h3>

            {myFeedPosts.length === 0 ? (
              <p className="text-xs text-[var(--text-400)] leading-relaxed">
                Kamu belum bergabung ke komunitas mana pun. Klik tombol <strong>+ Gabung</strong> pada
                kartu komunitas untuk melihat diskusi terbaru di sini.
              </p>
            ) : (
              <div className="space-y-4">
                {myFeedPosts.map((post) => {
                  const com = communities.find((c) => c.id === post.communityId);
                  return (
                    <div
                      key={post.id}
                      className="p-3 bg-[var(--bg-900)] border border-[var(--line)] space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[var(--red-400)]">
                          {com?.name || 'Komunitas Sumbar'}
                        </span>
                        {post.pinned && (
                          <span className="text-[var(--warning)] font-bold">📌 PINNED</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-100)] line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-400)] pt-1">
                        <span>Oleh: {post.authorNickname}</span>
                        <span>
                          ♥ {post.likesCount} • 💬 {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Box AI Moderation */}
          <div className="bg-[var(--bg-800)] border border-[var(--line)] p-5">
            <h4 className="text-xs font-extrabold uppercase text-[var(--success)] tracking-wider mb-2">
              🛡️ AI Pre-Moderation Aktif
            </h4>
            <p className="text-xs text-[var(--text-400)] leading-relaxed">
              Setiap postingan dan komentar di dalam komunitas diperiksa secara real-time oleh{' '}
              <strong className="text-white">AI Safety Engine</strong> untuk mencegah spam, promosi
              judi online, ujaran kebencian, dan SARA.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Buat Sub-Komunitas Baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Sub-Komunitas Esport Daerah"
        description="Bentuk wadah resmi untuk squad atau pemain satu kabupaten/kota di Sumatera Barat."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubCommunity} className="space-y-4">
          <Input
            label="Nama Sub-Komunitas"
            placeholder="Contoh: Mobile Legends Kota Solok Community"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-400)] mb-1.5">
                Cabang Game
              </label>
              <select
                value={newGame}
                onChange={(e) => setNewGame(e.target.value)}
                className="w-full bg-[var(--bg-900)] border border-[var(--line)] text-xs text-white px-3 py-2.5 rounded-sm"
              >
                <option value="mobile-legends">Mobile Legends</option>
                <option value="free-fire">Free Fire</option>
                <option value="valorant">Valorant</option>
                <option value="pubg-mobile">PUBG Mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-400)] mb-1.5">
                Kota / Kabupaten di Sumbar
              </label>
              <select
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                className="w-full bg-[var(--bg-900)] border border-[var(--line)] text-xs text-white px-3 py-2.5 rounded-sm"
              >
                {SUMBAR_REGIONS.filter((r) => r !== 'Semua Wilayah').map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Deskripsi & Aturan Singkat Komunitas"
            placeholder="Jelaskan jadwal mabar/scrim rutin dan aturan sopan santun komunitas..."
            rows={3}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            required
          />

          <div className="bg-[var(--bg-900)] border border-[var(--line)] p-3 text-xs text-[var(--text-400)]">
            Dengan membuat sub-komunitas, kamu otomatis menjadi <strong>OWNER</strong> dan wajib
            menjaga ketertiban diskusi bersama sistem AI Pre-Moderation.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Buat Sub-Komunitas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
