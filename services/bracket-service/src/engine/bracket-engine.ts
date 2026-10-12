import {
  BracketMatch,
  BracketParticipant,
  BracketStage,
  PointRuleConfig,
  SeedingType,
  StandingEntry,
} from '@esport-sumbar/contracts';

export interface BattleRoyaleLobbyResult {
  participantId: string;
  placement: number;
  kills: number;
}

export class BracketEngine {
  /**
   * 1. Seeding Algorithm: MANUAL, RATING, or RANDOM
   */
  static applySeeding(
    participants: BracketParticipant[],
    seedingType: SeedingType,
    deterministicShuffleSeed?: number,
  ): BracketParticipant[] {
    const copy = participants.map((p) => ({ ...p }));

    if (seedingType === 'RATING') {
      copy.sort((a, b) => (b.rating ?? 1000) - (a.rating ?? 1000));
    } else if (seedingType === 'RANDOM') {
      let s = deterministicShuffleSeed ?? Date.now();
      const nextRand = () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
      };
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(nextRand() * (i + 1));
        const temp = copy[i]!;
        copy[i] = copy[j]!;
        copy[j] = temp;
      }
    }

    return copy.map((p, index) => ({
      ...p,
      seed: index + 1,
    }));
  }

  /**
   * Standard fold seeding pairs for power-of-2 bracket size (e.g., for 8: [1,8], [4,5], [2,7], [3,6])
   */
  static getStandardSeedPairs(bracketSize: number): Array<[number, number]> {
    let rounds = [1, 2];
    while (rounds.length < bracketSize) {
      const next: number[] = [];
      const sum = rounds.length * 2 + 1;
      for (const seed of rounds) {
        next.push(seed);
        next.push(sum - seed);
      }
      rounds = next;
    }

    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < rounds.length; i += 2) {
      pairs.push([rounds[i]!, rounds[i + 1]!]);
    }
    return pairs;
  }

  /**
   * 2. Single Elimination Generator (with automatic BYE calculation & auto-advance)
   */
  static generateSingleElimination(
    tournamentId: string,
    participants: BracketParticipant[],
    stage: BracketStage = 'UPPER',
  ): BracketMatch[] {
    const count = Math.max(2, participants.length);
    const totalRounds = Math.ceil(Math.log2(count));
    const bracketSize = Math.pow(2, totalRounds);
    const seedMap = new Map<number, BracketParticipant>();
    participants.forEach((p, idx) => seedMap.set(idx + 1, p));

    const matchesByRound: BracketMatch[][] = [];
    let globalMatchCounter = 1;

    for (let r = 1; r <= totalRounds; r++) {
      const matchesInRound = bracketSize / Math.pow(2, r);
      const roundMatches: BracketMatch[] = [];

      for (let m = 0; m < matchesInRound; m++) {
        roundMatches.push({
          id: `${tournamentId}-${stage.toLowerCase()}-r${r}-m${m + 1}`,
          tournamentId,
          stage,
          round: r,
          matchNumber: globalMatchCounter++,
          slotA: null,
          slotB: null,
          participantAName: null,
          participantBName: null,
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          nextMatchId: null,
          nextMatchSlot: null,
          loserNextMatchId: null,
          loserNextMatchSlot: null,
          scheduledAt: null,
          state: 'PENDING',
        });
      }
      matchesByRound.push(roundMatches);
    }

    // Wire nextMatchId and nextMatchSlot across rounds
    for (let r = 0; r < totalRounds - 1; r++) {
      const currentRound = matchesByRound[r]!;
      const nextRound = matchesByRound[r + 1]!;
      currentRound.forEach((match, idx) => {
        const targetMatch = nextRound[Math.floor(idx / 2)]!;
        match.nextMatchId = targetMatch.id;
        match.nextMatchSlot = idx % 2 === 0 ? 'A' : 'B';
      });
    }

    // Populate Round 1 using standard fold seed pairs & handle BYE auto-advance
    const pairs = this.getStandardSeedPairs(bracketSize);
    const round1 = matchesByRound[0]!;
    const allMatches = matchesByRound.flat();
    const matchLookup = new Map<string, BracketMatch>(
      allMatches.map((m) => [m.id, m]),
    );

    round1.forEach((match, idx) => {
      const [seedA, seedB] = pairs[idx]!;
      const partA = seedMap.get(seedA) ?? null;
      const partB = seedMap.get(seedB) ?? null;

      match.slotA = partA ? partA.id : null;
      match.participantAName = partA ? partA.name : 'BYE';
      match.slotB = partB ? partB.id : null;
      match.participantBName = partB ? partB.name : 'BYE';

      if (partA && !partB) {
        match.state = 'BYE';
        match.winnerId = partA.id;
        match.scoreA = 1;
        match.scoreB = 0;
        this.promoteToTargetMatch(
          matchLookup,
          match.nextMatchId,
          match.nextMatchSlot,
          partA,
        );
      } else if (!partA && partB) {
        match.state = 'BYE';
        match.winnerId = partB.id;
        match.scoreA = 0;
        match.scoreB = 1;
        this.promoteToTargetMatch(
          matchLookup,
          match.nextMatchId,
          match.nextMatchSlot,
          partB,
        );
      }
    });

    return allMatches;
  }

  /**
   * 3. Double Elimination Generator (Upper Bracket + Lower Bracket + Grand Final)
   */
  static generateDoubleElimination(
    tournamentId: string,
    participants: BracketParticipant[],
  ): BracketMatch[] {
    const upperMatches = this.generateSingleElimination(
      tournamentId,
      participants,
      'UPPER',
    );

    const upperRound1 = upperMatches.filter((m) => m.round === 1);
    const upperFinal = upperMatches[upperMatches.length - 1]!;

    // Lower bracket matches for Upper R1 losers
    const lowerRound1Count = Math.max(1, Math.floor(upperRound1.length / 2));
    const lowerMatches: BracketMatch[] = [];
    let matchCounter = upperMatches.length + 1;

    for (let i = 0; i < lowerRound1Count; i++) {
      lowerMatches.push({
        id: `${tournamentId}-lower-r1-m${i + 1}`,
        tournamentId,
        stage: 'LOWER',
        round: 1,
        matchNumber: matchCounter++,
        slotA: null,
        slotB: null,
        participantAName: 'Loser UB R1',
        participantBName: 'Loser UB R1',
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        loserNextMatchId: null,
        loserNextMatchSlot: null,
        scheduledAt: null,
        state: 'PENDING',
      });
    }

    const lowerFinal: BracketMatch = {
      id: `${tournamentId}-lower-final`,
      tournamentId,
      stage: 'LOWER',
      round: 2,
      matchNumber: matchCounter++,
      slotA: null,
      slotB: null,
      participantAName: 'Winner LB R1',
      participantBName: 'Loser UB Final',
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      nextMatchId: null,
      nextMatchSlot: null,
      loserNextMatchId: null,
      loserNextMatchSlot: null,
      scheduledAt: null,
      state: 'PENDING',
    };

    if (lowerMatches.length > 0) {
      lowerMatches.forEach((lm, idx) => {
        lm.nextMatchId = lowerFinal.id;
        lm.nextMatchSlot = idx % 2 === 0 ? 'A' : 'B';
      });
    }

    const grandFinal: BracketMatch = {
      id: `${tournamentId}-grand-final`,
      tournamentId,
      stage: 'GRAND_FINAL',
      round: 1,
      matchNumber: matchCounter++,
      slotA: null,
      slotB: null,
      participantAName: 'Winner Upper Bracket',
      participantBName: 'Winner Lower Bracket',
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      nextMatchId: null,
      nextMatchSlot: null,
      loserNextMatchId: null,
      loserNextMatchSlot: null,
      scheduledAt: null,
      state: 'PENDING',
    };

    // Wire Upper R1 losers into Lower R1
    upperRound1.forEach((um, idx) => {
      const targetLb = lowerMatches[Math.floor(idx / 2)];
      if (targetLb) {
        um.loserNextMatchId = targetLb.id;
        um.loserNextMatchSlot = idx % 2 === 0 ? 'A' : 'B';
      }
    });

    // Wire Upper Final winner -> Grand Final Slot A, loser -> Lower Final Slot B
    upperFinal.nextMatchId = grandFinal.id;
    upperFinal.nextMatchSlot = 'A';
    upperFinal.loserNextMatchId = lowerFinal.id;
    upperFinal.loserNextMatchSlot = 'B';

    // Wire Lower Final winner -> Grand Final Slot B
    lowerFinal.nextMatchId = grandFinal.id;
    lowerFinal.nextMatchSlot = 'B';

    return [...upperMatches, ...lowerMatches, lowerFinal, grandFinal];
  }

  /**
   * 4. Round Robin Generator (Circle / Berger Table Method)
   */
  static generateRoundRobin(
    tournamentId: string,
    participants: BracketParticipant[],
    stage: BracketStage = 'ROUND_ROBIN',
  ): BracketMatch[] {
    const list: Array<BracketParticipant | null> = [...participants];
    if (list.length % 2 !== 0) {
      list.push(null); // Dummy BYE slot
    }

    const n = list.length;
    const totalRounds = n - 1;
    const half = n / 2;
    const matches: BracketMatch[] = [];
    let matchCounter = 1;

    const rotating = list.slice(1);

    for (let round = 1; round <= totalRounds; round++) {
      const currentLineup = [list[0]!, ...rotating];
      for (let i = 0; i < half; i++) {
        const pA = currentLineup[i] ?? null;
        const pB = currentLineup[n - 1 - i] ?? null;
        if (!pA || !pB) continue; // Skip dummy bye match in Round Robin

        matches.push({
          id: `${tournamentId}-${stage.toLowerCase()}-r${round}-m${matchCounter}`,
          tournamentId,
          stage,
          round,
          matchNumber: matchCounter++,
          slotA: pA.id,
          slotB: pB.id,
          participantAName: pA.name,
          participantBName: pB.name,
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          nextMatchId: null,
          nextMatchSlot: null,
          loserNextMatchId: null,
          loserNextMatchSlot: null,
          scheduledAt: null,
          state: 'PENDING',
        });
      }

      // Rotate clockwise keeping index 0 fixed
      const last = rotating.pop()!;
      rotating.unshift(last);
    }

    return matches;
  }

  /**
   * 5. Swiss System Generator & Dynamic Next-Round Pairing (No Repeat Opponents)
   */
  static generateSwissRound(
    tournamentId: string,
    participants: BracketParticipant[],
    existingMatches: BracketMatch[],
    standings: StandingEntry[],
    roundNumber: number,
  ): BracketMatch[] {
    const orderedIds =
      roundNumber === 1 || standings.length === 0
        ? participants.map((p) => p.id)
        : standings.map((s) => s.participantId);

    const pMap = new Map(participants.map((p) => [p.id, p]));
    const playedPairs = new Set<string>();
    for (const m of existingMatches) {
      if (m.slotA && m.slotB) {
        playedPairs.add(`${m.slotA}:${m.slotB}`);
        playedPairs.add(`${m.slotB}:${m.slotA}`);
      }
    }

    const unpaired = [...orderedIds];
    const newMatches: BracketMatch[] = [];
    let matchIdx = 1;

    while (unpaired.length >= 2) {
      const firstId = unpaired.shift()!;
      let opponentIdx = unpaired.findIndex(
        (candId) => !playedPairs.has(`${firstId}:${candId}`),
      );
      if (opponentIdx === -1) {
        opponentIdx = 0; // Fallback if all combinations exhausted
      }
      const [secondId] = unpaired.splice(opponentIdx, 1);
      const pA = pMap.get(firstId)!;
      const pB = pMap.get(secondId!)!;

      newMatches.push({
        id: `${tournamentId}-swiss-r${roundNumber}-m${matchIdx}`,
        tournamentId,
        stage: 'SWISS',
        round: roundNumber,
        matchNumber: existingMatches.length + matchIdx,
        slotA: pA.id,
        slotB: pB.id,
        participantAName: pA.name,
        participantBName: pB.name,
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        loserNextMatchId: null,
        loserNextMatchSlot: null,
        scheduledAt: null,
        state: 'PENDING',
      });
      matchIdx++;
    }

    return newMatches;
  }

  /**
   * 6. Group Stage + Playoff Generator
   */
  static generateGroupPlayoff(
    tournamentId: string,
    participants: BracketParticipant[],
  ): BracketMatch[] {
    const groupA: BracketParticipant[] = [];
    const groupB: BracketParticipant[] = [];

    participants.forEach((p, idx) => {
      if (idx % 2 === 0) groupA.push(p);
      else groupB.push(p);
    });

    const matchesA = this.generateRoundRobin(tournamentId, groupA, 'GROUP_A');
    const matchesB = this.generateRoundRobin(tournamentId, groupB, 'GROUP_B');

    const playoffMatches: BracketMatch[] = [
      {
        id: `${tournamentId}-playoff-sf1`,
        tournamentId,
        stage: 'PLAYOFF',
        round: 1,
        matchNumber: matchesA.length + matchesB.length + 1,
        slotA: groupA[0]?.id ?? null,
        slotB: groupB[1]?.id ?? groupB[0]?.id ?? null,
        participantAName: groupA[0] ? `${groupA[0].name} (Grup A #1)` : 'Juara Grup A',
        participantBName: groupB[1] ? `${groupB[1].name} (Grup B #2)` : 'Runner-up Grup B',
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
        nextMatchId: `${tournamentId}-playoff-final`,
        nextMatchSlot: 'A',
        loserNextMatchId: null,
        loserNextMatchSlot: null,
        scheduledAt: null,
        state: 'PENDING',
      },
      {
        id: `${tournamentId}-playoff-sf2`,
        tournamentId,
        stage: 'PLAYOFF',
        round: 1,
        matchNumber: matchesA.length + matchesB.length + 2,
        slotA: groupB[0]?.id ?? null,
        slotB: groupA[1]?.id ?? groupA[0]?.id ?? null,
        participantAName: groupB[0] ? `${groupB[0].name} (Grup B #1)` : 'Juara Grup B',
        participantBName: groupA[1] ? `${groupA[1].name} (Grup A #2)` : 'Runner-up Grup A',
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
        nextMatchId: `${tournamentId}-playoff-final`,
        nextMatchSlot: 'B',
        loserNextMatchId: null,
        loserNextMatchSlot: null,
        scheduledAt: null,
        state: 'PENDING',
      },
      {
        id: `${tournamentId}-playoff-final`,
        tournamentId,
        stage: 'PLAYOFF',
        round: 2,
        matchNumber: matchesA.length + matchesB.length + 3,
        slotA: null,
        slotB: null,
        participantAName: 'Winner Semifinal 1',
        participantBName: 'Winner Semifinal 2',
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        loserNextMatchId: null,
        loserNextMatchSlot: null,
        scheduledAt: null,
        state: 'PENDING',
      },
    ];

    return [...matchesA, ...matchesB, ...playoffMatches];
  }

  /**
   * 7. Score Input & Automatic Winner/Loser Progression
   */
  static recordMatchScore(
    matches: BracketMatch[],
    participants: BracketParticipant[],
    matchId: string,
    scoreA: number,
    scoreB: number,
  ): BracketMatch {
    const matchLookup = new Map<string, BracketMatch>(
      matches.map((m) => [m.id, m]),
    );
    const participantLookup = new Map<string, BracketParticipant>(
      participants.map((p) => [p.id, p]),
    );

    const match = matchLookup.get(matchId);
    if (!match) {
      throw new Error(`Match '${matchId}' tidak ditemukan`);
    }

    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.state = 'COMPLETED';

    if (scoreA > scoreB) {
      match.winnerId = match.slotA ?? null;
    } else if (scoreB > scoreA) {
      match.winnerId = match.slotB ?? null;
    } else {
      match.winnerId = null; // Draw allowed in Round Robin / Swiss
    }

    const loserId =
      match.winnerId === match.slotA
        ? match.slotB
        : match.winnerId === match.slotB
          ? match.slotA
          : null;

    if (match.winnerId && match.nextMatchId) {
      const winnerObj = participantLookup.get(match.winnerId);
      if (winnerObj) {
        this.promoteToTargetMatch(
          matchLookup,
          match.nextMatchId,
          match.nextMatchSlot,
          winnerObj,
        );
      }
    }

    if (loserId && match.loserNextMatchId) {
      const loserObj = participantLookup.get(loserId);
      if (loserObj) {
        this.promoteToTargetMatch(
          matchLookup,
          match.loserNextMatchId,
          match.loserNextMatchSlot,
          loserObj,
        );
      }
    }

    return match;
  }

  private static promoteToTargetMatch(
    matchLookup: Map<string, BracketMatch>,
    targetMatchId: string | null | undefined,
    targetSlot: 'A' | 'B' | null | undefined,
    participant: BracketParticipant,
  ): void {
    if (!targetMatchId || !targetSlot) return;
    const nextMatch = matchLookup.get(targetMatchId);
    if (!nextMatch) return;

    if (targetSlot === 'A') {
      nextMatch.slotA = participant.id;
      nextMatch.participantAName = participant.name;
    } else {
      nextMatch.slotB = participant.id;
      nextMatch.participantBName = participant.name;
    }
  }

  /**
   * 8. Standings, Battle Royale Custom Points & Multi-Criteria Tiebreaker
   */
  static calculateStandings(
    participants: BracketParticipant[],
    matches: BracketMatch[],
    pointConfig: PointRuleConfig,
    battleRoyaleScores?: Record<
      string,
      { played: number; wins: number; placementPoints: number; killPoints: number }
    >,
  ): StandingEntry[] {
    const entriesMap = new Map<string, StandingEntry>();
    const opponentsMap = new Map<string, string[]>();
    const headToHeadMatrix = new Map<string, Set<string>>();

    for (const p of participants) {
      entriesMap.set(p.id, {
        rank: 1,
        participantId: p.id,
        participantName: p.name,
        city: p.city || 'Sumbar',
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        scoreDiff: 0,
        placementPoints: 0,
        killPoints: 0,
        totalPoints: 0,
        headToHeadWins: 0,
        buchholzScore: 0,
      });
      opponentsMap.set(p.id, []);
      headToHeadMatrix.set(p.id, new Set<string>());
    }

    // Apply Battle Royale Leaderboard Points if present
    if (battleRoyaleScores) {
      for (const [pid, br] of Object.entries(battleRoyaleScores)) {
        const entry = entriesMap.get(pid);
        if (!entry) continue;
        entry.played = br.played;
        entry.wins = br.wins;
        entry.placementPoints = br.placementPoints;
        entry.killPoints = br.killPoints;
        entry.totalPoints = br.placementPoints + br.killPoints;
      }
    }

    // Apply completed match results
    for (const m of matches) {
      if (m.state !== 'COMPLETED' || !m.slotA || !m.slotB) continue;
      const entryA = entriesMap.get(m.slotA);
      const entryB = entriesMap.get(m.slotB);
      if (!entryA || !entryB) continue;

      entryA.played += 1;
      entryB.played += 1;
      entryA.scoreFor += m.scoreA;
      entryA.scoreAgainst += m.scoreB;
      entryA.scoreDiff = entryA.scoreFor - entryA.scoreAgainst;

      entryB.scoreFor += m.scoreB;
      entryB.scoreAgainst += m.scoreA;
      entryB.scoreDiff = entryB.scoreFor - entryB.scoreAgainst;

      opponentsMap.get(m.slotA)?.push(m.slotB);
      opponentsMap.get(m.slotB)?.push(m.slotA);

      if (m.scoreA > m.scoreB) {
        entryA.wins += 1;
        entryB.losses += 1;
        entryA.totalPoints += pointConfig.winPoints;
        entryB.totalPoints += pointConfig.lossPoints;
        headToHeadMatrix.get(m.slotA)?.add(m.slotB);
      } else if (m.scoreB > m.scoreA) {
        entryB.wins += 1;
        entryA.losses += 1;
        entryB.totalPoints += pointConfig.winPoints;
        entryA.totalPoints += pointConfig.lossPoints;
        headToHeadMatrix.get(m.slotB)?.add(m.slotA);
      } else {
        entryA.draws += 1;
        entryB.draws += 1;
        entryA.totalPoints += pointConfig.drawPoints;
        entryB.totalPoints += pointConfig.drawPoints;
      }
    }

    // Compute Buchholz score & Head-to-Head wins among tied groups
    for (const [pid, entry] of entriesMap.entries()) {
      const opps = opponentsMap.get(pid) || [];
      entry.buchholzScore = opps.reduce(
        (sum, oppId) => sum + (entriesMap.get(oppId)?.totalPoints ?? 0),
        0,
      );
      entry.headToHeadWins = headToHeadMatrix.get(pid)?.size ?? 0;
    }

    const sorted = Array.from(entriesMap.values()).sort((a, b) => {
      for (const criterion of pointConfig.tiebreakerOrder) {
        if (criterion === 'TOTAL_POINTS' && b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (criterion === 'KILL_POINTS' && b.killPoints !== a.killPoints) {
          return b.killPoints - a.killPoints;
        }
        if (criterion === 'HEAD_TO_HEAD') {
          const aBeatB = headToHeadMatrix.get(a.participantId)?.has(b.participantId);
          const bBeatA = headToHeadMatrix.get(b.participantId)?.has(a.participantId);
          if (aBeatB && !bBeatA) return -1;
          if (bBeatA && !aBeatB) return 1;
        }
        if (criterion === 'SCORE_DIFF' && b.scoreDiff !== a.scoreDiff) {
          return b.scoreDiff - a.scoreDiff;
        }
        if (criterion === 'BUCHHOLZ' && b.buchholzScore !== a.buchholzScore) {
          return b.buchholzScore - a.buchholzScore;
        }
      }
      return b.wins - a.wins;
    });

    return sorted.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }
}
