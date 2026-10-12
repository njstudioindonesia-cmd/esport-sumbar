import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  BracketMatch,
  BracketParticipant,
  PointRuleConfig,
  SeedingType,
  Tournament,
  TournamentFormat,
} from '@esport-sumbar/contracts';
import {
  BattleRoyaleLobbyResult,
  BracketEngine,
} from './engine/bracket-engine';

export interface SseBracketEvent {
  tournamentId: string;
  eventId: string;
  type: 'MATCH_UPDATED' | 'STANDINGS_UPDATED' | 'FORMAT_REGENERATED';
  timestamp: string;
  payload: unknown;
}

const DEFAULT_POINT_CONFIG: PointRuleConfig = {
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  killPointValue: 1,
  placementPointsMap: {
    '1': 12,
    '2': 9,
    '3': 8,
    '4': 7,
    '5': 6,
    '6': 5,
    '7': 4,
    '8': 3,
    '9': 2,
    '10': 1,
    '11': 0,
    '12': 0,
  },
  tiebreakerOrder: [
    'TOTAL_POINTS',
    'KILL_POINTS',
    'HEAD_TO_HEAD',
    'SCORE_DIFF',
    'BUCHHOLZ',
  ],
};

@Injectable()
export class BracketService {
  private readonly tournaments = new Map<string, Tournament>();
  private readonly brScores = new Map<
    string,
    Record<
      string,
      {
        played: number;
        wins: number;
        placementPoints: number;
        killPoints: number;
      }
    >
  >();
  private readonly sseSubject = new Subject<SseBracketEvent>();

  constructor() {
    this.seedInitialTournaments();
  }

  private seedInitialTournaments(): void {
    // 1. Minangkabau Esport Cup Season 4 (MLBB — Double Elimination 8 Teams)
    const mlbbParticipants: BracketParticipant[] = [
      {
        id: 'team-padang-roar',
        name: 'Padang Roar Esports',
        seed: 1,
        rating: 2150,
        city: 'Padang',
        communityId: 'comm-mlbb-sumbar',
      },
      {
        id: 'team-jam-gadang',
        name: 'Jam Gadang Reborn',
        seed: 2,
        rating: 2080,
        city: 'Bukittinggi',
        communityId: 'comm-mlbb-sumbar',
      },
      {
        id: 'team-payakumbuh-bala',
        name: 'Payakumbuh Bala Squad',
        seed: 3,
        rating: 1990,
        city: 'Payakumbuh',
        communityId: 'comm-mlbb-sumbar',
      },
      {
        id: 'team-solok-bareh',
        name: 'Solok Bareh Warriors',
        seed: 4,
        rating: 1940,
        city: 'Solok',
        communityId: 'comm-mlbb-sumbar',
      },
      {
        id: 'team-pariaman-tabuik',
        name: 'Pariaman Sala Tabuik',
        seed: 5,
        rating: 1890,
        city: 'Pariaman',
        communityId: 'comm-mlbb-sumbar',
      },
      {
        id: 'team-unand-lions',
        name: 'Unand Lions Esports',
        seed: 6,
        rating: 1850,
        city: 'Padang',
        communityId: 'comm-mlbb-padang',
      },
      {
        id: 'team-agam-tigers',
        name: 'Agam Harimau Squad',
        seed: 7,
        rating: 1810,
        city: 'Agam',
        communityId: 'comm-mlbb-sumbar',
      },
      {
        id: 'team-sawahlunto-coal',
        name: 'Sawahlunto Coal Gaming',
        seed: 8,
        rating: 1760,
        city: 'Sawahlunto',
        communityId: 'comm-mlbb-sumbar',
      },
    ];

    const mlbbId = 'trn-minangkabau-mlbb-s4';
    const mlbbMatches = BracketEngine.generateDoubleElimination(
      mlbbId,
      mlbbParticipants,
    );

    // Pre-play two Upper Round 1 matches so the live broadcast bracket looks dynamic
    if (mlbbMatches[0]) {
      BracketEngine.recordMatchScore(
        mlbbMatches,
        mlbbParticipants,
        mlbbMatches[0].id,
        2,
        0,
      );
    }
    if (mlbbMatches[1]) {
      BracketEngine.recordMatchScore(
        mlbbMatches,
        mlbbParticipants,
        mlbbMatches[1].id,
        2,
        1,
      );
    }

    const mlbbStandings = BracketEngine.calculateStandings(
      mlbbParticipants,
      mlbbMatches,
      DEFAULT_POINT_CONFIG,
    );

    this.tournaments.set(mlbbId, {
      id: mlbbId,
      eventId: 'evt-minangkabau-cup-2026',
      eventSlug: 'minangkabau-esport-cup-season-4',
      eventTitle: 'Minangkabau Esport Cup Season 4 — MLBB Championship',
      organizerId: 'user-eo-1',
      gameId: 'MLBB',
      format: 'DOUBLE_ELIMINATION',
      seedingType: 'RATING',
      bestOf: 3,
      pointConfig: DEFAULT_POINT_CONFIG,
      status: 'ACTIVE',
      participants: mlbbParticipants,
      matches: mlbbMatches,
      standings: mlbbStandings,
      updatedAt: new Date().toISOString(),
    });

    // 2. Valorant Campus Series Sumbar 2026 (SWISS System — 6 Campus Teams)
    const valParticipants: BracketParticipant[] = [
      {
        id: 'val-unand',
        name: 'Andalas Tacticians (UNAND)',
        seed: 1,
        rating: 2100,
        city: 'Padang',
        communityId: 'comm-val-sumbar',
      },
      {
        id: 'val-unp',
        name: 'UNP Garuda VCT',
        seed: 2,
        rating: 2040,
        city: 'Padang',
        communityId: 'comm-val-sumbar',
      },
      {
        id: 'val-pnp',
        name: 'Politeknik Negeri Padang Cypher',
        seed: 3,
        rating: 1980,
        city: 'Padang',
        communityId: 'comm-val-sumbar',
      },
      {
        id: 'val-upi',
        name: 'UPI YPTK Radiant Squad',
        seed: 4,
        rating: 1950,
        city: 'Padang',
        communityId: 'comm-val-sumbar',
      },
      {
        id: 'val-bukittinggi',
        name: 'SMAN 1 Bukittinggi Aces',
        seed: 5,
        rating: 1890,
        city: 'Bukittinggi',
        communityId: 'comm-val-sumbar',
      },
      {
        id: 'val-payakumbuh',
        name: 'Payakumbuh Vandal Five',
        seed: 6,
        rating: 1840,
        city: 'Payakumbuh',
        communityId: 'comm-val-sumbar',
      },
    ];

    const valId = 'trn-val-campus-sumbar';
    const valMatches = BracketEngine.generateSwissRound(
      valId,
      valParticipants,
      [],
      [],
      1,
    );
    if (valMatches[0]) {
      BracketEngine.recordMatchScore(
        valMatches,
        valParticipants,
        valMatches[0].id,
        13,
        9,
      );
    }

    const valStandings = BracketEngine.calculateStandings(
      valParticipants,
      valMatches,
      DEFAULT_POINT_CONFIG,
    );

    this.tournaments.set(valId, {
      id: valId,
      eventId: 'evt-val-campus-padang-2026',
      eventSlug: 'valorant-campus-series-sumbar-2026',
      eventTitle: 'Valorant Campus & Highschool Series Sumbar 2026',
      organizerId: 'user-eo-1',
      gameId: 'VALORANT',
      format: 'SWISS',
      seedingType: 'RATING',
      bestOf: 1,
      pointConfig: DEFAULT_POINT_CONFIG,
      status: 'ACTIVE',
      participants: valParticipants,
      matches: valMatches,
      standings: valStandings,
      updatedAt: new Date().toISOString(),
    });

    // 3. Free Fire Jam Gadang Clash (Battle Royale Custom Point Leaderboard)
    const ffParticipants: BracketParticipant[] = [
      {
        id: 'ff-jam-gadang',
        name: 'Jam Gadang Booyah Squad',
        seed: 1,
        rating: 2100,
        city: 'Bukittinggi',
        communityId: 'comm-ff-sumbar',
      },
      {
        id: 'ff-padang-storm',
        name: 'Padang Storm Survivors',
        seed: 2,
        rating: 2050,
        city: 'Padang',
        communityId: 'comm-ff-sumbar',
      },
      {
        id: 'ff-agam-predator',
        name: 'Agam Predator Guild',
        seed: 3,
        rating: 2000,
        city: 'Agam',
        communityId: 'comm-ff-sumbar',
      },
      {
        id: 'ff-payakumbuh-fire',
        name: 'Payakumbuh Fire Kings',
        seed: 4,
        rating: 1960,
        city: 'Payakumbuh',
        communityId: 'comm-ff-sumbar',
      },
      {
        id: 'ff-solok-elite',
        name: 'Solok Elite Hunters',
        seed: 5,
        rating: 1910,
        city: 'Solok',
        communityId: 'comm-ff-sumbar',
      },
      {
        id: 'ff-pariaman-wave',
        name: 'Pariaman Wave Rushers',
        seed: 6,
        rating: 1880,
        city: 'Pariaman',
        communityId: 'comm-ff-sumbar',
      },
    ];

    const ffId = 'trn-ff-jam-gadang-br';
    const initialBrScores = {
      'ff-jam-gadang': { played: 3, wins: 2, placementPoints: 33, killPoints: 24 },
      'ff-padang-storm': { played: 3, wins: 1, placementPoints: 28, killPoints: 21 },
      'ff-agam-predator': { played: 3, wins: 0, placementPoints: 22, killPoints: 25 },
      'ff-payakumbuh-fire': { played: 3, wins: 0, placementPoints: 19, killPoints: 14 },
      'ff-solok-elite': { played: 3, wins: 0, placementPoints: 15, killPoints: 12 },
      'ff-pariaman-wave': { played: 3, wins: 0, placementPoints: 11, killPoints: 9 },
    };
    this.brScores.set(ffId, initialBrScores);

    const ffStandings = BracketEngine.calculateStandings(
      ffParticipants,
      [],
      DEFAULT_POINT_CONFIG,
      initialBrScores,
    );

    this.tournaments.set(ffId, {
      id: ffId,
      eventId: 'evt-ff-bukittinggi-clash',
      eventSlug: 'free-fire-jam-gadang-clash-2026',
      eventTitle: 'Free Fire Jam Gadang Clash — Battle Royale Point Series',
      organizerId: 'user-eo-2',
      gameId: 'FREE_FIRE',
      format: 'LEADERBOARD',
      seedingType: 'MANUAL',
      bestOf: 4,
      pointConfig: DEFAULT_POINT_CONFIG,
      status: 'ACTIVE',
      participants: ffParticipants,
      matches: [],
      standings: ffStandings,
      updatedAt: new Date().toISOString(),
    });
  }

  listTournaments(communityId?: string): Tournament[] {
    const all = Array.from(this.tournaments.values());
    if (!communityId) return all;
    return all.filter((t) =>
      t.participants.some((p) => p.communityId === communityId),
    );
  }

  getTournamentByIdOrEvent(idOrEventSlug: string): Tournament {
    const direct = this.tournaments.get(idOrEventSlug);
    if (direct) return direct;

    const byEvent = Array.from(this.tournaments.values()).find(
      (t) => t.eventId === idOrEventSlug || t.eventSlug === idOrEventSlug,
    );
    if (!byEvent) {
      throw new NotFoundException(
        `Turnamen/Bracket untuk '${idOrEventSlug}' tidak ditemukan`,
      );
    }
    return byEvent;
  }

  /**
   * Re-generates tournament bracket with chosen Format & Seeding Type
   */
  configureAndGenerate(
    idOrEventSlug: string,
    dto: {
      format: TournamentFormat;
      seedingType?: SeedingType;
      bestOf?: number;
      pointConfig?: Partial<PointRuleConfig>;
      participants?: BracketParticipant[];
    },
  ): Tournament {
    const trn = this.getTournamentByIdOrEvent(idOrEventSlug);
    const seedingType = dto.seedingType || trn.seedingType;
    const seededParticipants = BracketEngine.applySeeding(
      dto.participants && dto.participants.length >= 2
        ? dto.participants
        : trn.participants,
      seedingType,
    );

    const pointConfig: PointRuleConfig = {
      ...trn.pointConfig,
      ...(dto.pointConfig || {}),
    };

    let matches: BracketMatch[] = [];
    if (dto.format === 'SINGLE_ELIMINATION') {
      matches = BracketEngine.generateSingleElimination(
        trn.id,
        seededParticipants,
      );
    } else if (dto.format === 'DOUBLE_ELIMINATION') {
      matches = BracketEngine.generateDoubleElimination(
        trn.id,
        seededParticipants,
      );
    } else if (dto.format === 'ROUND_ROBIN') {
      matches = BracketEngine.generateRoundRobin(trn.id, seededParticipants);
    } else if (dto.format === 'SWISS') {
      matches = BracketEngine.generateSwissRound(
        trn.id,
        seededParticipants,
        [],
        [],
        1,
      );
    } else if (dto.format === 'GROUP_PLAYOFF') {
      matches = BracketEngine.generateGroupPlayoff(trn.id, seededParticipants);
    } else if (dto.format === 'LEADERBOARD') {
      matches = [];
    }

    const standings = BracketEngine.calculateStandings(
      seededParticipants,
      matches,
      pointConfig,
      dto.format === 'LEADERBOARD' ? this.brScores.get(trn.id) : undefined,
    );

    const updated: Tournament = {
      ...trn,
      format: dto.format,
      seedingType,
      bestOf: dto.bestOf ?? trn.bestOf,
      pointConfig,
      participants: seededParticipants,
      matches,
      standings,
      updatedAt: new Date().toISOString(),
    };

    this.tournaments.set(trn.id, updated);
    this.emitSse({
      tournamentId: updated.id,
      eventId: updated.eventId,
      type: 'FORMAT_REGENERATED',
      timestamp: updated.updatedAt,
      payload: updated,
    });

    return updated;
  }

  /**
   * Updates score of a match, auto-advances winner/loser, recalculates standings & emits SSE
   */
  updateMatchScore(
    idOrEventSlug: string,
    matchId: string,
    scoreA: number,
    scoreB: number,
  ): { match: BracketMatch; tournament: Tournament } {
    const trn = this.getTournamentByIdOrEvent(idOrEventSlug);
    const updatedMatch = BracketEngine.recordMatchScore(
      trn.matches,
      trn.participants,
      matchId,
      Number(scoreA),
      Number(scoreB),
    );

    trn.standings = BracketEngine.calculateStandings(
      trn.participants,
      trn.matches,
      trn.pointConfig,
      trn.format === 'LEADERBOARD' ? this.brScores.get(trn.id) : undefined,
    );
    trn.updatedAt = new Date().toISOString();

    this.tournaments.set(trn.id, trn);

    this.emitSse({
      tournamentId: trn.id,
      eventId: trn.eventId,
      type: 'MATCH_UPDATED',
      timestamp: trn.updatedAt,
      payload: {
        match: updatedMatch,
        standings: trn.standings,
      },
    });

    return { match: updatedMatch, tournament: trn };
  }

  /**
   * Pairs the next Swiss round dynamically without repeating past opponents
   */
  generateNextSwissRound(idOrEventSlug: string): Tournament {
    const trn = this.getTournamentByIdOrEvent(idOrEventSlug);
    if (trn.format !== 'SWISS') {
      throw new BadRequestException(
        'Generate Swiss Round hanya berlaku untuk turnamen berformat SWISS',
      );
    }

    const currentMaxRound = trn.matches.reduce(
      (max, m) => Math.max(max, m.round),
      0,
    );
    const nextRound = currentMaxRound + 1;

    const newMatches = BracketEngine.generateSwissRound(
      trn.id,
      trn.participants,
      trn.matches,
      trn.standings,
      nextRound,
    );

    trn.matches = [...trn.matches, ...newMatches];
    trn.updatedAt = new Date().toISOString();
    this.tournaments.set(trn.id, trn);

    this.emitSse({
      tournamentId: trn.id,
      eventId: trn.eventId,
      type: 'FORMAT_REGENERATED',
      timestamp: trn.updatedAt,
      payload: trn,
    });

    return trn;
  }

  /**
   * Submits Battle Royale Lobby Results (Placement + Kills) using Custom Point Rules JSON
   */
  recordBattleRoyaleLobby(
    idOrEventSlug: string,
    results: BattleRoyaleLobbyResult[],
  ): Tournament {
    const trn = this.getTournamentByIdOrEvent(idOrEventSlug);
    const currentBr = this.brScores.get(trn.id) || {};

    for (const res of results) {
      const existing = currentBr[res.participantId] || {
        played: 0,
        wins: 0,
        placementPoints: 0,
        killPoints: 0,
      };
      const placePts =
        trn.pointConfig.placementPointsMap[String(res.placement)] ?? 0;
      const killPts = res.kills * trn.pointConfig.killPointValue;

      currentBr[res.participantId] = {
        played: existing.played + 1,
        wins: existing.wins + (res.placement === 1 ? 1 : 0),
        placementPoints: existing.placementPoints + placePts,
        killPoints: existing.killPoints + killPts,
      };
    }

    this.brScores.set(trn.id, currentBr);
    trn.standings = BracketEngine.calculateStandings(
      trn.participants,
      trn.matches,
      trn.pointConfig,
      currentBr,
    );
    trn.updatedAt = new Date().toISOString();
    this.tournaments.set(trn.id, trn);

    this.emitSse({
      tournamentId: trn.id,
      eventId: trn.eventId,
      type: 'STANDINGS_UPDATED',
      timestamp: trn.updatedAt,
      payload: {
        standings: trn.standings,
      },
    });

    return trn;
  }

  private emitSse(event: SseBracketEvent): void {
    this.sseSubject.next(event);
  }

  streamTournamentUpdates(
    idOrEventSlug: string,
  ): Observable<{ data: SseBracketEvent }> {
    const trn = this.getTournamentByIdOrEvent(idOrEventSlug);
    return this.sseSubject.asObservable().pipe(
      filter(
        (evt) =>
          evt.tournamentId === trn.id || evt.eventId === trn.eventId,
      ),
      map((evt) => ({ data: evt })),
    );
  }
}
