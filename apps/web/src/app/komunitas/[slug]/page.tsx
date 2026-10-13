'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MOCK_COMMUNITIES,
  MOCK_COMMUNITY_MEMBERS,
  MOCK_COMMUNITY_POSTS,
  MOCK_COMMUNITY_COMMENTS,
  MOCK_EVENTS,
} from '../../../lib/mock-data';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input, Textarea } from '../../../components/ui/form';
import { Modal } from '../../../components/ui/modal';
import { useToast } from '../../../components/ui/toast';
import {
  CommunityRole,
  CommunityPost,
  CommunityComment,
  CommunityMember,
} from '@esport-sumbar/contracts';

type CommunityTab = 'DISKUSI' | 'EVENT' | 'BRACKET' | 'ANGGOTA';

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const community = useMemo(() => {
    return MOCK_COMMUNITIES.find((c) => c.slug === slug) || MOCK_COMMUNITIES[0]!;
  }, [slug]);

  const [activeTab, setActiveTab] = useState<CommunityTab>('DISKUSI');
  const [isJoined, setIsJoined] = useState(true);
  const [memberCount, setMemberCount] = useState(community.memberCount);
  const [myRole, setMyRole] = useState<CommunityRole>('MODERATOR');

  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [comments, setComments] = useState<CommunityComment[]>(MOCK_COMMUNITY_COMMENTS);
  const [members, setMembers] = useState<CommunityMember[]>(MOCK_COMMUNITY_MEMBERS);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // New Post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');

  // Reply / Comment state
  const [replyTarget, setReplyTarget] = useState<{
    postId: string;
    parentCommentId: string | null;
    replyToNickname?: string;
  } | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'POST' | 'COMMENT';
    id: string;
    preview: string;
  } | null>(null);
  const [reportCategory, setReportCategory] = useState<'SPAM' | 'TOXIC' | 'SARA' | 'JUDI'>('SPAM');
  const [reportReason, setReportReason] = useState('');

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts]);

  const checkAiModeration = (text: string): { approved: boolean; reason?: string } => {
    const lower = text.toLowerCase();
    if (
      lower.includes('slot') ||
      lower.includes('gacor') ||
      lower.includes('judi') ||
      lower.includes('maxwin')
    ) {
      return {
        approved: false,
        reason: 'Terdeteksi promosi judi online / slot ilegal oleh AI Safety Engine.',
      };
    }
    if (
      lower.includes('anjing') ||
      lower.includes('babi') ||
      lower.includes('kontol') ||
      lower.includes('bangsat')
    ) {
      return {
        approved: false,
        reason: 'Terdeteksi kata kasar / toxic yang melanggar etika komunitas.',
      };
    }
    return { approved: true };
  };

  const handleToggleJoin = () => {
    if (isJoined) {
      setIsJoined(false);
      setMemberCount((c) => Math.max(0, c - 1));
      toast({
        type: 'info',
        title: 'Keluar dari Komunitas',
        message: `Kamu telah keluar dari ${community.name}.`,
      });
    } else {
      setIsJoined(true);
      setMemberCount((c) => c + 1);
      toast({
        type: 'success',
        title: 'Bergabung ke Komunitas!',
        message: `Selamat datang di ${community.name}.`,
      });
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJoined) {
      toast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Silakan gabung komunitas terlebih dahulu untuk membuat postingan.',
      });
      return;
    }
    if (!newPostContent.trim()) return;

    const mod = checkAiModeration(newPostContent);
    if (!mod.approved) {
      toast({
        type: 'error',
        title: 'Ditolak AI Pre-Moderation!',
        message: mod.reason,
      });
      return;
    }

    const created: CommunityPost = {
      id: `post-${Date.now()}`,
      communityId: community.id,
      authorId: 'usr-current',
      authorNickname: 'RizkySlayer99',
      authorRole: myRole,
      content: newPostContent.trim(),
      media: newPostMedia.trim() ? [newPostMedia.trim()] : [],
      pinned: false,
      likesCount: 0,
      commentsCount: 0,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [created, ...prev]);
    setNewPostContent('');
    setNewPostMedia('');
    toast({
      type: 'success',
      title: 'Postingan Terbit',
      message: 'Lolos verifikasi AI Pre-Moderation & tampil di diskusi.',
    });
  };

  const handleToggleLike = (postId: string) => {
    const next = new Set(likedPostIds);
    const isLiked = next.has(postId);

    if (isLiked) {
      next.delete(postId);
    } else {
      next.add(postId);
    }
    setLikedPostIds(next);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1 }
          : p,
      ),
    );
  };

  const handleTogglePin = (postId: string) => {
    if (myRole !== 'MODERATOR' && myRole !== 'OWNER') {
      toast({
        type: 'error',
        title: 'Izin Ditolak',
        message: 'Hanya MODERATOR atau OWNER yang dapat menyematkan (pin) postingan.',
      });
      return;
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextPinned = !p.pinned;
          toast({
            type: 'info',
            title: nextPinned ? 'Postingan Disematkan (Pinned)' : 'Sematan Dilepas',
            message: nextPinned
              ? 'Postingan kini berada di urutan teratas diskusi.'
              : 'Postingan kembali ke urutan waktu normal.',
          });
          return { ...p, pinned: nextPinned };
        }
        return p;
      }),
    );
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const mod = checkAiModeration(text);
    if (!mod.approved) {
      toast({
        type: 'error',
        title: 'Komentar Ditolak AI Moderator!',
        message: mod.reason,
      });
      return;
    }

    // Enforce 1-level nesting
    let resolvedParentId: string | null = null;
    if (replyTarget && replyTarget.postId === postId && replyTarget.parentCommentId) {
      const targetCmt = comments.find((c) => c.id === replyTarget.parentCommentId);
      resolvedParentId = targetCmt?.parentId ? targetCmt.parentId : replyTarget.parentCommentId;
    }

    const newCmt: CommunityComment = {
      id: `cmt-${Date.now()}`,
      postId,
      authorId: 'usr-current',
      authorNickname: 'RizkySlayer99',
      authorRole: myRole,
      parentId: resolvedParentId,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newCmt]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p)),
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setReplyTarget(null);

    toast({
      type: 'success',
      title: 'Komentar Terkirim',
      message: 'Balasan berhasil ditambahkan ke diskusi.',
    });
  };

  const handleOpenReport = (type: 'POST' | 'COMMENT', id: string, preview: string) => {
    setReportTarget({ type, id, preview });
    setReportReason('');
    setReportModalOpen(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportModalOpen(false);
    toast({
      type: 'info',
      title: 'Laporan Diterima',
      message: 'Laporan telah masuk ke antrean Moderator & Admin untuk ditindaklanjuti.',
    });
  };

  const handleToggleModeratorRole = (userId: string) => {
    if (myRole !== 'OWNER') {
      toast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya OWNER komunitas yang dapat mengangkat/mencabut Moderator.',
      });
      return;
    }

    setMembers((prev) =>
      prev.map((m) => {
        if (m.userId === userId && m.role !== 'OWNER') {
          const nextRole: CommunityRole = m.role === 'MODERATOR' ? 'MEMBER' : 'MODERATOR';
          toast({
            type: 'success',
            title: 'Peran Anggota Diperbarui',
            message: `${m.nickname} kini berperan sebagai ${nextRole}.`,
          });
          return { ...m, role: nextRole };
        }
        return m;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-900)] text-[var(--text-100)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-400)] mb-6">
        <Link href="/" className="hover:text-white">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/komunitas" className="hover:text-white">
          Komunitas
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{community.name}</span>
      </nav>

      {/* Community Hero Banner */}
      <Card chamfer className="bg-[var(--bg-800)] border-[var(--line)] p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={community.type === 'OFFICIAL' ? 'brand' : 'info'} size="sm">
                {community.type === 'OFFICIAL' ? '✓ KOMUNITAS RESMI' : 'SUB-KOMUNITAS DAERAH'}
              </Badge>
              <Badge variant="neutral" size="sm">
                🎮 {community.gameId}
              </Badge>
              <span className="text-xs text-[var(--text-400)]">
                📍 Wilayah: <strong className="text-white">{community.region || 'Sumbar'}</strong>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              {community.name}
            </h1>

            <p className="text-sm text-[var(--text-400)] max-w-3xl leading-relaxed">
              {community.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[var(--text-400)]">
              <div>
                <strong className="text-white tabular-nums text-sm">
                  {memberCount.toLocaleString('id-ID')}
                </strong>{' '}
                Anggota Aktif
              </div>
              <div>
                Peran Kamu Saat Ini:{' '}
                <Badge
                  variant={
                    myRole === 'OWNER' ? 'brand' : myRole === 'MODERATOR' ? 'warning' : 'neutral'
                  }
                  size="sm"
                >
                  {myRole}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action & Demo Role Switcher */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <Button
              variant={isJoined ? 'outline' : 'marawa'}
              onClick={handleToggleJoin}
              className="text-xs"
            >
              {isJoined ? '✓ Tergabung (Klik untuk Keluar)' : '+ Gabung Komunitas'}
            </Button>

            <div className="flex items-center gap-1.5 bg-[var(--bg-900)] border border-[var(--line)] p-1.5 rounded-sm">
              <span className="text-[10px] uppercase text-[var(--text-400)] font-bold px-1">
                Simulasi Peran:
              </span>
              {(['MEMBER', 'MODERATOR', 'OWNER'] as CommunityRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setMyRole(r)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors ${
                    myRole === r
                      ? 'bg-[#F5B700] text-black font-black'
                      : 'text-[var(--text-400)] hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Broadcast Tabs (Diskusi · Event · Bracket · Anggota) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] mb-8">
        {(
          [
            { id: 'DISKUSI', label: `💬 Diskusi (${posts.length})` },
            { id: 'EVENT', label: '🏆 Event Komunitas' },
            { id: 'BRACKET', label: '📊 Bracket & Klasemen' },
            { id: 'ANGGOTA', label: `👥 Anggota (${members.length})` },
          ] as { id: CommunityTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-[#F5B700] text-black font-black chamfer-btn shadow-md shadow-[#F5B700]/20'
                : 'bg-[var(--bg-800)] text-[var(--text-400)] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DISKUSI */}
      {activeTab === 'DISKUSI' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Buat Postingan Box */}
            <Card className="bg-[var(--bg-800)] border-[var(--line)] p-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-3 font-display">
                Buat Diskusi / Cari Tim Scrim
              </h3>
              <form onSubmit={handleCreatePost} className="space-y-3">
                <Textarea
                  placeholder="Tulis info scrim, rekrutmen tim, atau diskusi meta... (Dilindungi AI Pre-Moderation anti-judi & anti-toxic)"
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Input
                    placeholder="URL Gambar / Tautan Turnamen (opsional)"
                    value={newPostMedia}
                    onChange={(e) => setNewPostMedia(e.target.value)}
                    className="text-xs py-1.5"
                  />
                  <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs">
                    Kirim Postingan
                  </Button>
                </div>
              </form>
            </Card>

            {/* Daftar Postingan */}
            <div className="space-y-4">
              {sortedPosts.map((post) => {
                const postComments = comments.filter((c) => c.postId === post.id);
                const rootComments = postComments.filter((c) => !c.parentId);
                const isLiked = likedPostIds.has(post.id);

                return (
                  <Card
                    key={post.id}
                    className={`bg-[var(--bg-800)] p-5 space-y-4 ${
                      post.pinned
                        ? 'border-[var(--warning)]/70 ring-1 ring-[var(--warning)]/30'
                        : 'border-[var(--line)]'
                    }`}
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-[var(--bg-700)] border border-[var(--line)] flex items-center justify-center font-display font-black text-sm text-[var(--red-400)]">
                          {post.authorNickname.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {post.authorNickname}
                            </span>
                            {post.authorRole && (
                              <Badge
                                variant={
                                  post.authorRole === 'OWNER'
                                    ? 'brand'
                                    : post.authorRole === 'MODERATOR'
                                      ? 'warning'
                                      : 'neutral'
                                }
                                size="sm"
                              >
                                {post.authorRole}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-[var(--text-400)]">
                            {new Date(post.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.pinned && (
                          <Badge variant="warning" size="sm">
                            📌 DISEMATKAN
                          </Badge>
                        )}
                        {(myRole === 'MODERATOR' || myRole === 'OWNER') && (
                          <button
                            onClick={() => handleTogglePin(post.id)}
                            className="text-xs px-2 py-1 bg-[var(--bg-700)] hover:bg-[var(--line)] text-[var(--text-400)] hover:text-white rounded-sm transition-colors"
                          >
                            {post.pinned ? 'Lepas Pin' : '📌 Pin Post'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-[var(--text-100)] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.media && post.media.length > 0 && (
                      <div className="p-2.5 bg-[var(--bg-900)] border border-[var(--line)] text-xs">
                        🔗 Lampiran Tautan:{' '}
                        <a
                          href={post.media[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--red-400)] underline break-all"
                        >
                          {post.media[0]}
                        </a>
                      </div>
                    )}

                    {/* Post Actions (Like, Reply, Report) */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-xs">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`font-bold flex items-center gap-1.5 transition-colors ${
                            isLiked
                              ? 'text-[var(--red-400)]'
                              : 'text-[var(--text-400)] hover:text-white'
                          }`}
                        >
                          <span>{isLiked ? '♥' : '♡'}</span>
                          <span className="tabular-nums">{post.likesCount} Suka</span>
                        </button>

                        <span className="text-[var(--text-400)]">
                          💬 {postComments.length} Komentar
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenReport('POST', post.id, post.content)}
                        className="text-[var(--text-400)] hover:text-[var(--red-400)] transition-colors"
                      >
                        ⚑ Laporkan
                      </button>
                    </div>

                    {/* 1-Level Nested Comments Section */}
                    <div className="pt-3 border-t border-[var(--line)]/60 space-y-3">
                      {rootComments.map((rootCmt) => {
                        const replies = postComments.filter((c) => c.parentId === rootCmt.id);
                        return (
                          <div key={rootCmt.id} className="space-y-2">
                            {/* Root Comment */}
                            <div className="bg-[var(--bg-900)] p-3 border border-[var(--line)] text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">
                                    {rootCmt.authorNickname}
                                  </span>
                                  {rootCmt.authorRole && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-700)] text-[var(--text-400)]">
                                      {rootCmt.authorRole}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-[var(--text-400)]">
                                  <button
                                    onClick={() =>
                                      setReplyTarget({
                                        postId: post.id,
                                        parentCommentId: rootCmt.id,
                                        replyToNickname: rootCmt.authorNickname,
                                      })
                                    }
                                    className="text-[var(--red-400)] hover:underline font-semibold"
                                  >
                                    Balas
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOpenReport('COMMENT', rootCmt.id, rootCmt.content)
                                    }
                                    className="hover:text-[var(--red-400)]"
                                  >
                                    ⚑
                                  </button>
                                </div>
                              </div>
                              <p className="text-[var(--text-100)]">{rootCmt.content}</p>
                            </div>

                            {/* Level-1 Replies */}
                            {replies.length > 0 && (
                              <div className="pl-6 border-l-2 border-[var(--line)] space-y-2">
                                {replies.map((rep) => (
                                  <div
                                    key={rep.id}
                                    className="bg-[var(--bg-900)]/70 p-2.5 border border-[var(--line)]/70 text-xs"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">
                                          {rep.authorNickname}
                                        </span>
                                        {rep.authorRole && (
                                          <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-700)] text-[var(--warning)]">
                                            {rep.authorRole}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          setReplyTarget({
                                            postId: post.id,
                                            parentCommentId: rootCmt.id, // flattened to 1-level parent
                                            replyToNickname: rep.authorNickname,
                                          })
                                        }
                                        className="text-[11px] text-[var(--red-400)] hover:underline"
                                      >
                                        Balas
                                      </button>
                                    </div>
                                    <p className="text-[var(--text-100)]">{rep.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Comment / Reply Input */}
                      <div className="pt-2 space-y-1.5">
                        {replyTarget && replyTarget.postId === post.id && (
                          <div className="flex items-center justify-between text-[11px] text-[var(--warning)] bg-[var(--bg-900)] px-2.5 py-1 border border-[var(--line)]">
                            <span>
                              Membalas komentar <strong>@{replyTarget.replyToNickname}</strong>{' '}
                              (Level-1 Thread)
                            </span>
                            <button
                              onClick={() => setReplyTarget(null)}
                              className="text-white hover:underline"
                            >
                              ✕ Batal
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tulis komentar atau balasan..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            className="text-xs py-1.5"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            className="text-xs shrink-0"
                          >
                            Balas
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar Rules & Moderators */}
          <div className="space-y-6">
            <Card className="bg-[var(--bg-800)] border-[var(--line)] p-5 space-y-3">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-white font-display border-b border-[var(--line)] pb-2">
                📜 Kode Etik Komunitas
              </h4>
              <ul className="text-xs text-[var(--text-400)] space-y-2 list-disc pl-4">
                <li>Dilarang keras memposting iklan judi online, slot, atau phising.</li>
                <li>Junjung tinggi sportivitas antar tim kabupaten/kota Sumatera Barat.</li>
                <li>Gunakan bahasa yang sopan tanpa unsur SARA & pelecehan.</li>
                <li>Gunakan Rekber resmi asosiasi bila melakukan transaksi komunitas.</li>
              </ul>
            </Card>

            <Card className="bg-[var(--bg-800)] border-[var(--line)] p-5 space-y-3">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-white font-display border-b border-[var(--line)] pb-2">
                🛡️ Pengurus & Moderator
              </h4>
              <div className="space-y-2.5">
                {members
                  .filter((m) => m.role === 'OWNER' || m.role === 'MODERATOR')
                  .map((mod) => (
                    <div key={mod.userId} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{mod.nickname}</span>
                        <span className="text-[10px] text-[var(--text-400)]">📍 {mod.city}</span>
                      </div>
                      <Badge variant={mod.role === 'OWNER' ? 'brand' : 'warning'} size="sm">
                        {mod.role}
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: EVENT KOMUNITAS */}
      {activeTab === 'EVENT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white border-l-2 border-[var(--red-500)] pl-3">
              Turnamen & Gathering Terhubung
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_EVENTS.map((evt) => (
              <Card
                key={evt.id}
                chamfer
                className="bg-[var(--bg-800)] border-[var(--line)] p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" size="sm">
                      {evt.scope}
                    </Badge>
                    <Badge variant="success" size="sm">
                      {evt.mode}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-extrabold text-white font-display uppercase leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[var(--text-400)]">📍 {evt.location}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--line)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-400)] block">
                      Total Prize Pool
                    </span>
                    <span className="text-sm font-black text-[var(--warning)] tabular-nums">
                      Rp {evt.prizePool.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('BRACKET')}
                    className="text-xs"
                  >
                    Lihat Bracket →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BRACKET & KLASEMEN KOMUNITAS */}
      {activeTab === 'BRACKET' && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-800)] border border-[var(--line)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[var(--line)]">
              <div>
                <Badge variant="brand" size="sm" className="mb-2">
                  ● LIVE COMMUNITY BRACKET WIDGET
                </Badge>
                <h2 className="text-2xl font-black uppercase text-white font-display">
                  Minang Super League Season 4 — Playoff Stage
                </h2>
                <p className="text-xs text-[var(--text-400)]">
                  Menampilkan tim kontingen anggota komunitas {community.name}
                </p>
              </div>
              <span className="text-xs font-mono bg-[var(--bg-900)] px-3 py-1.5 border border-[var(--line)] text-[var(--success)]">
                Format: Single Elimination (BO3)
              </span>
            </div>

            {/* Broadcast Bracket Tree */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Semifinals */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[var(--text-400)]">
                  Babak Semifinal
                </h4>

                <div className="bg-[var(--bg-900)] border border-[var(--line)] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--line)]">
                    <span className="font-bold text-white">🔥 Padang Slayers (Komunitas)</span>
                    <span className="font-black text-[var(--success)] tabular-nums text-sm">2</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-400)]">Solok Knights</span>
                    <span className="font-bold text-[var(--text-400)] tabular-nums text-sm">0</span>
                  </div>
                </div>

                <div className="bg-[var(--bg-900)] border border-[var(--line)] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--line)]">
                    <span className="font-bold text-white">🔥 Bukittinggi Esports</span>
                    <span className="font-black text-[var(--success)] tabular-nums text-sm">2</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-400)]">Payakumbuh Syndicate</span>
                    <span className="font-bold text-[var(--text-400)] tabular-nums text-sm">1</span>
                  </div>
                </div>
              </div>

              {/* Grand Final */}
              <div className="space-y-4 flex flex-col justify-center">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[var(--warning)]">
                  🏆 Grand Final (Sedang Berlangsung)
                </h4>

                <div className="bg-[var(--bg-900)] border-2 border-[var(--red-500)] p-5 space-y-3 chamfer-cut-sm">
                  <div className="flex items-center justify-between text-xs text-[var(--red-400)] font-bold">
                    <span>MATCH #GF-01 • GAME 4</span>
                    <span>LIVE STREAMING</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pb-2 border-b border-[var(--line)]">
                    <span className="font-extrabold text-white">Padang Slayers</span>
                    <span className="font-black text-[var(--warning)] tabular-nums text-lg">2</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-extrabold text-white">Bukittinggi Esports</span>
                    <span className="font-black text-white tabular-nums text-lg">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANGGOTA & MANAJEMEN PERAN */}
      {activeTab === 'ANGGOTA' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white border-l-2 border-[var(--red-500)] pl-3">
              Daftar Anggota Komunitas ({members.length})
            </h2>
            <span className="text-xs text-[var(--text-400)]">
              Tip: Ubah <strong>Simulasi Peran</strong> di atas menjadi <strong>OWNER</strong> untuk
              mengangkat/mencabut Moderator.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <Card
                key={m.userId}
                className="bg-[var(--bg-800)] border-[var(--line)] p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{m.nickname}</span>
                    <Badge
                      variant={
                        m.role === 'OWNER'
                          ? 'brand'
                          : m.role === 'MODERATOR'
                            ? 'warning'
                            : 'neutral'
                      }
                      size="sm"
                    >
                      {m.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-[var(--text-400)]">📍 Kota: {m.city}</span>
                </div>

                {myRole === 'OWNER' && m.role !== 'OWNER' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleModeratorRole(m.userId)}
                    className="text-[11px]"
                  >
                    {m.role === 'MODERATOR' ? 'Cabut Mod' : '+ Jadikan Mod'}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report Content Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Laporkan Pelanggaran Konten"
        description="Bantu moderator menjaga komunitas tetap sehat dan bebas spam/judi/toxic."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          {reportTarget && (
            <div className="p-3 bg-[var(--bg-900)] border border-[var(--line)] text-xs text-[var(--text-400)] italic">
              &ldquo;{reportTarget.preview.slice(0, 120)}...&rdquo;
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-400)] mb-1.5">
              Kategori Pelanggaran
            </label>
            <select
              value={reportCategory}
              onChange={(e) =>
                setReportCategory(e.target.value as 'SPAM' | 'TOXIC' | 'SARA' | 'JUDI')
              }
              className="w-full bg-[var(--bg-900)] border border-[var(--line)] text-xs text-white px-3 py-2.5 rounded-sm"
            >
              <option value="SPAM">Spam / Penipuan Jual Beli</option>
              <option value="JUDI">Promosi Judi Online / Slot</option>
              <option value="TOXIC">Ujaran Kebencian / Toxic</option>
              <option value="SARA">Pelanggaran SARA</option>
            </select>
          </div>

          <Textarea
            label="Keterangan Tambahan"
            placeholder="Jelaskan detail pelanggaran..."
            rows={3}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Kirim Laporan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
