'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Radio, Trophy, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function BracketEmbedWidgetPage() {
  const params = useParams();
  const eventId = (params?.eventId as string) || 'minangkabau-esport-cup-season-4';
  const [tournament, setTournament] = useState<any>(null);
  const [liveConnected, setLiveConnected] = useState(false);

  const fetchWidgetData = async () => {
    try {
      const res = await fetch(`${API_BASE}/brackets/tournaments/${eventId}`);
      if (res.ok) {
        setTournament(await res.json());
      }
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    fetchWidgetData();
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE}/brackets/tournaments/${eventId}/stream`);
      es.onopen = () => setLiveConnected(true);
      es.onmessage = () => fetchWidgetData();
      es.onerror = () => setLiveConnected(false);
    } catch {
      setLiveConnected(false);
    }
    return () => {
      if (es) es.close();
    };
  }, [eventId]);

  if (!tournament) {
    return (
      <div className="p-6 bg-[#0B0B0D] text-[#9A9AA5] text-xs font-mono">
        Memuat Widget Bracket ESPORT SUMBAR...
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#0B0B0D] text-[#F5F5F7] min-h-screen space-y-4">
      {/* Compact Broadcast Widget Header */}
      <div className="p-3 bg-[#131316] border border-[#2A2A31] rounded flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">ESPORT SUMBAR EMBED</Badge>
            <Badge variant="outline">{tournament.format}</Badge>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#22C55E] font-bold uppercase">
              <Radio className="w-3 h-3 animate-pulse" />
              {liveConnected ? 'LIVE SSE' : 'SYNC'}
            </span>
          </div>
          <h1 className="font-display text-lg font-extrabold uppercase text-white mt-1">
            {tournament.eventTitle}
          </h1>
        </div>

        <Link
          href={`/event/${tournament.eventSlug}/bracket`}
          target="_blank"
          className="text-xs text-[#E10600] hover:text-white font-bold uppercase inline-flex items-center gap-1"
        >
          Layar Penuh
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Matches Grid */}
      {tournament.matches && tournament.matches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tournament.matches.slice(0, 6).map((m: any) => (
            <Card key={m.id} chamfer className="p-3 bg-[#1C1C21] text-xs space-y-1.5">
              <div className="flex justify-between text-[10px] text-[#9A9AA5] uppercase font-mono">
                <span>
                  {m.stage} · R{m.round} M#{m.matchNumber}
                </span>
                <span className="text-[#E10600] font-bold">{m.state}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span className="truncate pr-2">{m.participantAName || 'TBD'}</span>
                <span className="tabular-nums text-[#E10600]">{m.scoreA}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span className="truncate pr-2">{m.participantBName || 'TBD'}</span>
                <span className="tabular-nums text-[#E10600]">{m.scoreB}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Top Standings */}
      <Card chamfer className="p-3 bg-[#131316]">
        <div className="text-xs font-display font-bold uppercase text-white mb-2 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-[#F5A524]" />
          Top Klasemen Sementara
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs tabular-nums">
          {(tournament.standings || []).slice(0, 4).map((s: any) => (
            <div
              key={s.participantId}
              className="p-2 bg-[#0B0B0D] border border-[#2A2A31] rounded flex items-center justify-between"
            >
              <span className="truncate pr-2 font-semibold text-white">
                #{s.rank} {s.participantName}
              </span>
              <span className="text-[#E10600] font-extrabold">
                {s.totalPoints} pts
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
