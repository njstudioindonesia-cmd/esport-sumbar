'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Radio,
  Trophy,
  Shuffle,
  Code2,
  Flame,
  Swords,
  CheckCircle2,
  PlusCircle,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function BroadcastBracketPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'minangkabau-esport-cup-season-4';
  const { toast } = useToast();

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [lastSseLog, setLastSseLog] = useState<string>('Menunggu sinyal skor live...');
  const [selectedFormat, setSelectedFormat] = useState<string>('DOUBLE_ELIMINATION');
  const [selectedSeeding, setSelectedSeeding] = useState<string>('RATING');
  const [scoreDrafts, setScoreDrafts] = useState<
    Record<string, { scoreA: number; scoreB: number }>
  >({});
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const loadTournament = async () => {
    try {
      const res = await fetch(`${API_BASE}/brackets/tournaments/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data);
        setSelectedFormat(data.format);
        setSelectedSeeding(data.seedingType);

        const drafts: Record<string, { scoreA: number; scoreB: number }> = {};
        for (const m of data.matches || []) {
          drafts[m.id] = { scoreA: m.scoreA ?? 0, scoreB: m.scoreB ?? 0 };
        }
        setScoreDrafts(drafts);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournament();

    // Connect to Realtime SSE Stream
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE}/brackets/tournaments/${slug}/stream`);
      es.onopen = () => {
        setSseConnected(true);
      };
      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastSseLog(
            `[${new Date().toLocaleTimeString('id-ID')}] SSE ${parsed.type} diterima secara realtime!`,
          );
          loadTournament();
        } catch {
          // Ignore malformed event
        }
      };
      es.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      setSseConnected(false);
    }

    return () => {
      if (es) es.close();
    };
  }, [slug]);

  const handleRegenerateBracket = async (
    formatOverride?: string,
    seedingOverride?: string,
  ) => {
    const fmt = formatOverride || selectedFormat;
    const seed = seedingOverride || selectedSeeding;

    try {
      const res = await fetch(`${API_BASE}/brackets/tournaments/${slug}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: fmt,
          seedingType: seed,
        }),
      });
      if (!res.ok) throw new Error('Gagal men-generate ulang bracket');
      const updated = await res.json();
      setTournament(updated);
      toast({
        type: 'success',
        title: `Format ${fmt} Terpasang!`,
        message: `Bracket di-generate ulang dengan seeding ${seed} & disiarkan via SSE.`,
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', message: err?.message });
    }
  };

  const handleSaveMatchScore = async (matchId: string) => {
    const draft = scoreDrafts[matchId] || { scoreA: 2, scoreB: 0 };
    try {
      const res = await fetch(
        `${API_BASE}/brackets/tournaments/${slug}/matches/${matchId}/score`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        },
      );
      if (!res.ok) throw new Error('Gagal menyimpan skor match');
      const data = await res.json();
      setTournament(data.tournament);
      toast({
        type: 'success',
        title: 'Skor Match Diperbarui & Auto-Advance!',
        message: `Skor ${draft.scoreA} - ${draft.scoreB} tersimpan dan pemenang otomatis melaju ke babak berikutnya.`,
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal Update Skor', message: err?.message });
    }
  };

  const handleNextSwissRound = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/brackets/tournaments/${slug}/swiss-next-round`,
        { method: 'POST' },
      );
      if (!res.ok) throw new Error('Gagal membuat ronde Swiss baru');
      const updated = await res.json();
      setTournament(updated);
      toast({
        type: 'success',
        title: 'Ronde Swiss Baru Terbentuk!',
        message: 'Pairing otomatis berdasarkan poin klasemen tanpa lawan berulang.',
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', message: err?.message });
    }
  };

  const handleSimulateBattleRoyaleLobby = async () => {
    if (!tournament?.participants) return;
    const results = tournament.participants.map((p: any, idx: number) => ({
      participantId: p.id,
      placement: idx + 1,
      kills: Math.max(1, 10 - idx * 2),
    }));

    try {
      const res = await fetch(
        `${API_BASE}/brackets/tournaments/${slug}/leaderboard-lobby`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results }),
        },
      );
      if (!res.ok) throw new Error('Gagal mencatat hasil lobby Battle Royale');
      const updated = await res.json();
      setTournament(updated);
      toast({
        type: 'success',
        title: 'Poin Lobby Battle Royale Masuk!',
        message:
          'Poin Placement + Kill ditambahkan & dievaluasi dengan tiebreaker JSON.',
      });
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

  if (!tournament) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          Bracket Turnamen Belum Tersedia
        </h1>
        <Link href={`/event/${slug}`} className="inline-block mt-4">
          <Button variant="primary">Kembali ke Halaman Event</Button>
        </Link>
      </div>
    );
  }

  // Group matches by stage -> round
  const stagesOrder = [
    'UPPER',
    'LOWER',
    'GRAND_FINAL',
    'GROUP_A',
    'GROUP_B',
    'PLAYOFF',
    'SWISS',
    'ROUND_ROBIN',
  ];
  const groupedStages = stagesOrder
    .map((stage) => {
      const stageMatches = (tournament.matches || []).filter(
        (m: any) => m.stage === stage,
      );
      const roundsMap = new Map<number, any[]>();
      for (const m of stageMatches) {
        const arr = roundsMap.get(m.round) || [];
        arr.push(m);
        roundsMap.set(m.round, arr);
      }
      return {
        stage,
        rounds: Array.from(roundsMap.entries()).sort((a, b) => a[0] - b[0]),
      };
    })
    .filter((s) => s.rounds.length > 0);

  const embedUrl = `http://localhost:3000/embed/bracket/${tournament.eventSlug}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="620" frameborder="0" style="border:1px solid #2A2A31;border-radius:6px;background:#0B0B0D;"></iframe>`;

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F7] pb-20">
      {/* Broadcast Top Header */}
      <section className="border-b border-[#2A2A38] bg-gradient-to-b from-[#140D04] via-[#0B0B0E] to-[#08080A] py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-songket opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Link
              href={`/event/${tournament.eventSlug}`}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9A9AA5] hover:text-[#F5B700] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#F5B700]" />
              Kembali ke Detail Event
            </Link>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded bg-[#121217] border border-[#2A2A38] flex items-center gap-2 text-xs">
                <Radio
                  className={`w-3.5 h-3.5 ${
                    sseConnected
                      ? 'text-[#10B981] animate-pulse'
                      : 'text-[#F5B700]'
                  }`}
                />
                <span className="font-bold uppercase tracking-wider text-white">
                  {sseConnected ? 'LIVE SSE STREAM AKTIF' : 'REALTIME STANDBY'}
                </span>
                <span className="text-[#9A9AA5] hidden sm:inline">
                  · {lastSseLog}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEmbedCode((v) => !v)}
              >
                <Code2 className="w-4 h-4 mr-1.5 text-[#F5B700]" />
                Embed Widget
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="marawa">BROADCAST BRACKET & LEADERBOARD</Badge>
                <Badge variant="warning">{tournament.format}</Badge>
                <Badge variant="outline">SEEDING: {tournament.seedingType}</Badge>
                <Badge variant="info">BO{tournament.bestOf}</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
                {tournament.eventTitle}
              </h1>
            </div>

            {/* EO Bracket Format & Seeding Control Strip */}
            <div className="p-3 bg-[#131316] border border-[#2A2A31] rounded flex flex-wrap items-center gap-2">
              <select
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value);
                  handleRegenerateBracket(e.target.value, selectedSeeding);
                }}
                className="bg-[#0B0B0D] border border-[#2A2A31] rounded px-3 py-1.5 text-xs font-bold uppercase text-white outline-none"
              >
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="ROUND_ROBIN">Round Robin (Liga)</option>
                <option value="SWISS">Swiss System</option>
                <option value="GROUP_PLAYOFF">Group Stage + Playoff</option>
                <option value="LEADERBOARD">
                  Leaderboard Poin (Battle Royale)
                </option>
              </select>

              <select
                value={selectedSeeding}
                onChange={(e) => {
                  setSelectedSeeding(e.target.value);
                  handleRegenerateBracket(selectedFormat, e.target.value);
                }}
                className="bg-[#0B0B0D] border border-[#2A2A31] rounded px-3 py-1.5 text-xs font-bold uppercase text-white outline-none"
              >
                <option value="RATING">Seeding: Rating MMR</option>
                <option value="MANUAL">Seeding: Manual Urutan</option>
                <option value="RANDOM">Seeding: Acak (Shuffle)</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleRegenerateBracket(selectedFormat, selectedSeeding)
                }
              >
                <Shuffle className="w-3.5 h-3.5 mr-1.5" />
                Reset & Acak Ulang
              </Button>
            </div>
          </div>

          {/* Embed Widget Code Drawer */}
          {showEmbedCode && (
            <Card chamfer className="mt-6 p-4 bg-[#131316] border-[#E10600]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="font-bold uppercase text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#E10600]" />
                    Kode Iframe Embed Widget (Untuk Halaman Komunitas / Website Media)
                  </div>
                  <div className="p-2 bg-[#0B0B0D] border border-[#2A2A31] rounded font-mono text-[11px] text-[#22C55E] break-all">
                    {iframeSnippet}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(iframeSnippet);
                      toast({
                        type: 'success',
                        title: 'Kode Embed Disalin!',
                        message: 'Tempelkan kode iframe ke halaman komunitas atau web.',
                      });
                    }}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Salin Iframe
                  </Button>
                  <Link href={`/embed/bracket/${tournament.eventSlug}`} target="_blank">
                    <Button variant="primary" size="sm">
                      Buka Layar Embed
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-10">
        {/* Format-Specific Action Banner (Swiss Next Round or Battle Royale Lobby Input) */}
        {tournament.format === 'SWISS' && (
          <Card chamfer className="p-4 bg-[#131316] border-[#3B82F6]/60 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold uppercase text-white">
                Mode Turnamen Swiss System Aktif
              </div>
              <p className="text-[#9A9AA5]">
                Setelah seluruh pertandingan ronde berjalan selesai, klik tombol di
                kanan untuk memasangkan tim dengan poin setara tanpa rematch.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleNextSwissRound}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Pair Ronde Swiss Berikutnya
            </Button>
          </Card>
        )}

        {tournament.format === 'LEADERBOARD' && (
          <Card chamfer className="p-4 bg-[#131316] border-[#F5A524]/60 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold uppercase text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#F5A524]" />
                Sistem Poin Battle Royale (Placement + Eliminasi Kill)
              </div>
              <p className="text-[#9A9AA5]">
                Aturan JSON: Placement #1 = 12 Poin, #2 = 9 Poin, #3 = 8 Poin +{' '}
                {tournament.pointConfig?.killPointValue ?? 1} Poin per Kill.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSimulateBattleRoyaleLobby}
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Input Skor Match Lobby Baru
            </Button>
          </Card>
        )}

        {/* BROADCAST BRACKET STAGES VIEWER */}
        {groupedStages.map(({ stage, rounds }) => (
          <div key={stage} className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-[#E10600] pl-3">
              <Swords className="w-5 h-5 text-[#E10600]" />
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-white">
                {stage === 'UPPER'
                  ? 'Upper Bracket (Winners Stage)'
                  : stage === 'LOWER'
                    ? 'Lower Bracket (Elimination Stage)'
                    : stage === 'GRAND_FINAL'
                      ? 'Grand Final Championship'
                      : `Stage: ${stage.replace('_', ' ')}`}
              </h2>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4">
              {rounds.map(([roundNum, matches]) => (
                <div
                  key={roundNum}
                  className="min-w-[300px] md:min-w-[330px] flex flex-col justify-around space-y-4"
                >
                  <div className="px-3 py-1.5 bg-[#131316] border border-[#2A2A31] rounded text-xs font-display font-bold uppercase tracking-widest text-[#9A9AA5] flex items-center justify-between">
                    <span>RONDE {roundNum}</span>
                    <span className="tabular-nums">{matches.length} MATCH</span>
                  </div>

                  {matches.map((match: any) => {
                    const draft = scoreDrafts[match.id] || {
                      scoreA: match.scoreA ?? 0,
                      scoreB: match.scoreB ?? 0,
                    };
                    const aWon =
                      match.winnerId && match.winnerId === match.slotA;
                    const bWon =
                      match.winnerId && match.winnerId === match.slotB;

                    return (
                      <Card
                        key={match.id}
                        chamfer
                        className={`p-0 overflow-hidden border ${
                          match.state === 'COMPLETED'
                            ? 'border-[#2A2A31]'
                            : match.state === 'BYE'
                              ? 'border-[#2A2A31]/50 opacity-75'
                              : 'border-[#E10600]/60'
                        }`}
                      >
                        {/* Match Top Bar */}
                        <div className="px-3 py-1.5 bg-[#131316] border-b border-[#2A2A31] flex items-center justify-between text-[10px] uppercase tracking-wider text-[#9A9AA5]">
                          <span className="font-mono font-bold text-white">
                            MATCH #{match.matchNumber}
                          </span>
                          <Badge
                            variant={
                              match.state === 'COMPLETED'
                                ? 'success'
                                : match.state === 'BYE'
                                  ? 'neutral'
                                  : 'brand'
                            }
                          >
                            {match.state}
                          </Badge>
                        </div>

                        {/* Slot A */}
                        <div
                          className={`px-3.5 py-2.5 flex items-center justify-between border-b border-[#2A2A31]/60 ${
                            aWon ? 'bg-[#E10600]/15' : 'bg-[#1C1C21]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {aWon && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                            )}
                            <span
                              className={`text-xs font-bold truncate ${
                                aWon ? 'text-white' : 'text-[#F5F5F7]/85'
                              }`}
                            >
                              {match.participantAName || 'TBD'}
                            </span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            disabled={match.state === 'BYE' || !match.slotA || !match.slotB}
                            value={draft.scoreA}
                            onChange={(e) =>
                              setScoreDrafts((prev) => ({
                                ...prev,
                                [match.id]: {
                                  scoreA: Number(e.target.value),
                                  scoreB: draft.scoreB,
                                },
                              }))
                            }
                            className="w-12 bg-[#0B0B0D] border border-[#2A2A31] rounded px-1.5 py-0.5 text-right font-mono font-bold text-sm text-white tabular-nums"
                          />
                        </div>

                        {/* Slot B */}
                        <div
                          className={`px-3.5 py-2.5 flex items-center justify-between ${
                            bWon ? 'bg-[#E10600]/15' : 'bg-[#1C1C21]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {bWon && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                            )}
                            <span
                              className={`text-xs font-bold truncate ${
                                bWon ? 'text-white' : 'text-[#F5F5F7]/85'
                              }`}
                            >
                              {match.participantBName || 'TBD'}
                            </span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            disabled={match.state === 'BYE' || !match.slotA || !match.slotB}
                            value={draft.scoreB}
                            onChange={(e) =>
                              setScoreDrafts((prev) => ({
                                ...prev,
                                [match.id]: {
                                  scoreA: draft.scoreA,
                                  scoreB: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-12 bg-[#0B0B0D] border border-[#2A2A31] rounded px-1.5 py-0.5 text-right font-mono font-bold text-sm text-white tabular-nums"
                          />
                        </div>

                        {/* Quick EO Score Submit Footer */}
                        {match.state !== 'BYE' && match.slotA && match.slotB && (
                          <div className="px-3 py-1.5 bg-[#131316] border-t border-[#2A2A31] flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSaveMatchScore(match.id)}
                              className="text-[11px] font-display font-bold uppercase tracking-wider text-[#E10600] hover:text-white transition-colors"
                            >
                              Simpan Skor & Advance →
                            </button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* STANDINGS & CUSTOM POINT LEADERBOARD TABLE */}
        <Card chamfer className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-[#F5A524]" />
                <h2 className="font-display text-2xl font-extrabold uppercase text-white">
                  Klasemen & Tiebreaker Poin Turnamen
                </h2>
              </div>
              <p className="text-xs text-[#9A9AA5]">
                Urutan Tiebreaker Aktif:{' '}
                <span className="text-white font-mono">
                  {(tournament.pointConfig?.tiebreakerOrder || []).join(' → ')}
                </span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#2A2A31] text-[#9A9AA5] uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">#Rank</th>
                  <th className="py-3 px-3">Skuad / Peserta</th>
                  <th className="py-3 px-3">Kota</th>
                  <th className="py-3 px-3 text-right">Main</th>
                  <th className="py-3 px-3 text-right">Menang</th>
                  <th className="py-3 px-3 text-right">Selisih Skor</th>
                  <th className="py-3 px-3 text-right">Placement Pts</th>
                  <th className="py-3 px-3 text-right">Kill Pts</th>
                  <th className="py-3 px-3 text-right">Buchholz</th>
                  <th className="py-3 px-3 text-right text-white">Total Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A31]/60 tabular-nums">
                {(tournament.standings || []).map((row: any) => (
                  <tr
                    key={row.participantId}
                    className={`hover:bg-[#131316] ${
                      row.rank <= 3 ? 'bg-[#E10600]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-display font-extrabold text-base">
                      <span
                        className={
                          row.rank === 1
                            ? 'text-[#F5A524]'
                            : row.rank === 2
                              ? 'text-[#F5F5F7]'
                              : row.rank === 3
                                ? 'text-[#E10600]'
                                : 'text-[#9A9AA5]'
                        }
                      >
                        #{row.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {row.participantName}
                    </td>
                    <td className="py-3 px-3 text-[#9A9AA5]">{row.city}</td>
                    <td className="py-3 px-3 text-right">{row.played}</td>
                    <td className="py-3 px-3 text-right text-[#22C55E] font-semibold">
                      {row.wins}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {row.scoreDiff > 0 ? `+${row.scoreDiff}` : row.scoreDiff}
                    </td>
                    <td className="py-3 px-3 text-right">{row.placementPoints}</td>
                    <td className="py-3 px-3 text-right">{row.killPoints}</td>
                    <td className="py-3 px-3 text-right text-[#9A9AA5]">
                      {row.buchholzScore}
                    </td>
                    <td className="py-3 px-3 text-right font-display font-extrabold text-lg text-[#E10600]">
                      {row.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
