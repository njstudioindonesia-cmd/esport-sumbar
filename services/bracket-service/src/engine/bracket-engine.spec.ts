import { BracketParticipant, PointRuleConfig } from '@esport-sumbar/contracts';
import { BracketEngine } from './bracket-engine';

const SAMPLE_TEAMS: BracketParticipant[] = [
  { id: 't1', name: 'Padang Roar', seed: 1, rating: 1800, city: 'Padang' },
  { id: 't2', name: 'Jam Gadang Reborn', seed: 2, rating: 2200, city: 'Bukittinggi' },
  { id: 't3', name: 'Payakumbuh Bala', seed: 3, rating: 2000, city: 'Payakumbuh' },
  { id: 't4', name: 'Solok Bareh', seed: 4, rating: 1950, city: 'Solok' },
  { id: 't5', name: 'Pariaman Tabuik', seed: 5, rating: 1900, city: 'Pariaman' },
  { id: 't6', name: 'Unand Lions', seed: 6, rating: 1750, city: 'Padang' },
];

const POINT_CONFIG: PointRuleConfig = {
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  killPointValue: 1,
  placementPointsMap: { '1': 12, '2': 9, '3': 8, '4': 7 },
  tiebreakerOrder: [
    'TOTAL_POINTS',
    'KILL_POINTS',
    'HEAD_TO_HEAD',
    'SCORE_DIFF',
    'BUCHHOLZ',
  ],
};

describe('BracketEngine (All 6 Tournament Formats, Seeding, BYE, Auto-Advance & Tiebreaker)', () => {
  it('sorts participants by RATING descending when seedingType is RATING', () => {
    const seeded = BracketEngine.applySeeding(SAMPLE_TEAMS, 'RATING');
    expect(seeded[0]?.id).toBe('t2'); // rating 2200
    expect(seeded[0]?.seed).toBe(1);
    expect(seeded[1]?.id).toBe('t3'); // rating 2000
    expect(seeded[1]?.seed).toBe(2);
  });

  it('generates Single Elimination for 6 teams, calculates 2 BYEs, and auto-advances top seeds to Round 2', () => {
    const matches = BracketEngine.generateSingleElimination('trn-se', SAMPLE_TEAMS);
    // 6 teams -> bracketSize 8 -> 4 R1 matches + 2 R2 matches + 1 Final = 7 matches
    expect(matches.length).toBe(7);

    const byeMatches = matches.filter((m) => m.state === 'BYE');
    expect(byeMatches.length).toBe(2);

    // Seed 1 (t1) and Seed 2 (t2) should already be auto-advanced into Round 2
    const round2Matches = matches.filter((m) => m.round === 2);
    expect(round2Matches[0]?.slotA).toBe('t1');
    expect(round2Matches[1]?.slotA).toBe('t2');

    // Recording score on R1 Match #2 (Seed 4 vs Seed 5) should advance winner to R2 Match #1 Slot B
    const r1Playable = matches.find(
      (m) => m.round === 1 && m.slotA === 't4' && m.slotB === 't5',
    )!;
    expect(r1Playable).toBeDefined();

    BracketEngine.recordMatchScore(matches, SAMPLE_TEAMS, r1Playable.id, 2, 1);
    expect(round2Matches[0]?.slotB).toBe('t4');
    expect(round2Matches[0]?.participantBName).toBe('Solok Bareh');
  });

  it('generates Double Elimination and drops Upper Bracket losers into Lower Bracket', () => {
    const fourTeams = SAMPLE_TEAMS.slice(0, 4);
    const matches = BracketEngine.generateDoubleElimination('trn-de', fourTeams);

    const upperR1 = matches.filter((m) => m.stage === 'UPPER' && m.round === 1);
    const lowerR1 = matches.find((m) => m.stage === 'LOWER' && m.round === 1)!;
    const grandFinal = matches.find((m) => m.stage === 'GRAND_FINAL')!;

    expect(upperR1.length).toBe(2);
    expect(lowerR1).toBeDefined();
    expect(grandFinal).toBeDefined();

    // Play Upper R1 Match 1: t1 (2) vs t4 (0) -> t4 drops to Lower R1 Slot A
    BracketEngine.recordMatchScore(matches, fourTeams, upperR1[0]!.id, 2, 0);
    expect(lowerR1.slotA).toBe('t4');

    // Play Upper R1 Match 2: t2 (1) vs t3 (2) -> t2 drops to Lower R1 Slot B
    BracketEngine.recordMatchScore(matches, fourTeams, upperR1[1]!.id, 1, 2);
    expect(lowerR1.slotB).toBe('t2');
  });

  it('generates Round Robin Berger pairings with exact N*(N-1)/2 matches and resolves Head-to-Head tiebreaker', () => {
    const fourTeams = SAMPLE_TEAMS.slice(0, 4);
    const matches = BracketEngine.generateRoundRobin('trn-rr', fourTeams);
    // 4 teams -> 4 * 3 / 2 = 6 matches
    expect(matches.length).toBe(6);

    // Suppose t1 beats t2, and both finish with 1 win (3 points), t1 should rank above t2 via HEAD_TO_HEAD
    const mT1vsT2 = matches.find(
      (m) =>
        (m.slotA === 't1' && m.slotB === 't2') ||
        (m.slotA === 't2' && m.slotB === 't1'),
    )!;
    const scoreA = mT1vsT2.slotA === 't1' ? 2 : 0;
    const scoreB = mT1vsT2.slotB === 't1' ? 2 : 0;
    BracketEngine.recordMatchScore(matches, fourTeams, mT1vsT2.id, scoreA, scoreB);

    // Give t2 a win against t3 so t1 and t2 are tied at 3 pts
    const mT2vsT3 = matches.find(
      (m) =>
        (m.slotA === 't2' && m.slotB === 't3') ||
        (m.slotA === 't3' && m.slotB === 't2'),
    )!;
    BracketEngine.recordMatchScore(
      matches,
      fourTeams,
      mT2vsT3.id,
      mT2vsT3.slotA === 't2' ? 2 : 0,
      mT2vsT3.slotB === 't2' ? 2 : 0,
    );

    const standings = BracketEngine.calculateStandings(
      fourTeams,
      matches,
      POINT_CONFIG,
    );
    const rankT1 = standings.find((s) => s.participantId === 't1')!.rank;
    const rankT2 = standings.find((s) => s.participantId === 't2')!.rank;
    expect(rankT1).toBeLessThan(rankT2);
  });

  it('pairs Swiss rounds dynamically without repeating Round 1 opponents', () => {
    const round1 = BracketEngine.generateSwissRound(
      'trn-swiss',
      SAMPLE_TEAMS,
      [],
      [],
      1,
    );
    expect(round1.length).toBe(3);

    // Complete all Round 1 matches
    for (const m of round1) {
      BracketEngine.recordMatchScore(round1, SAMPLE_TEAMS, m.id, 1, 0);
    }

    const standingsAfterR1 = BracketEngine.calculateStandings(
      SAMPLE_TEAMS,
      round1,
      POINT_CONFIG,
    );

    const round2 = BracketEngine.generateSwissRound(
      'trn-swiss',
      SAMPLE_TEAMS,
      round1,
      standingsAfterR1,
      2,
    );
    expect(round2.length).toBe(3);

    // Verify no pair in Round 2 already played in Round 1
    const r1Pairs = new Set(round1.map((m) => `${m.slotA}:${m.slotB}`));
    for (const m2 of round2) {
      expect(r1Pairs.has(`${m2.slotA}:${m2.slotB}`)).toBe(false);
      expect(r1Pairs.has(`${m2.slotB}:${m2.slotA}`)).toBe(false);
    }
  });

  it('generates Group Stage + Playoff and calculates Battle Royale Custom Point Leaderboard', () => {
    const gpMatches = BracketEngine.generateGroupPlayoff('trn-gp', SAMPLE_TEAMS);
    expect(gpMatches.some((m) => m.stage === 'GROUP_A')).toBe(true);
    expect(gpMatches.some((m) => m.stage === 'GROUP_B')).toBe(true);
    expect(gpMatches.some((m) => m.stage === 'PLAYOFF')).toBe(true);

    const brStandings = BracketEngine.calculateStandings(
      SAMPLE_TEAMS.slice(0, 3),
      [],
      POINT_CONFIG,
      {
        t1: { played: 2, wins: 1, placementPoints: 20, killPoints: 10 }, // 30 pts, 10 kills
        t2: { played: 2, wins: 1, placementPoints: 18, killPoints: 12 }, // 30 pts, 12 kills -> wins tiebreaker via KILL_POINTS
        t3: { played: 2, wins: 0, placementPoints: 10, killPoints: 5 },  // 15 pts
      },
    );
    expect(brStandings[0]?.participantId).toBe('t2');
    expect(brStandings[1]?.participantId).toBe('t1');
  });
});
