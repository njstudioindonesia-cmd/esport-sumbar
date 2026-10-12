import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { BracketService, SseBracketEvent } from './bracket.service';
import {
  BracketParticipant,
  PointRuleConfig,
  SeedingType,
  TournamentFormat,
} from '@esport-sumbar/contracts';
import { BattleRoyaleLobbyResult } from './engine/bracket-engine';

@ApiTags('Brackets, Leaderboards & Realtime SSE')
@Controller('brackets')
export class BracketController {
  constructor(private readonly bracketService: BracketService) {}

  @Get('tournaments')
  @ApiOperation({
    summary: 'Daftar seluruh turnamen/bracket aktif (bisa difilter per communityId)',
  })
  listTournaments(@Query('communityId') communityId?: string) {
    return this.bracketService.listTournaments(communityId);
  }

  @Get('tournaments/:idOrEvent')
  @ApiOperation({
    summary:
      'Ambil struktur bracket lengkap, match, konfigurasi poin & klasemen berdasarkan ID turnamen atau slug event',
  })
  getTournament(@Param('idOrEvent') idOrEvent: string) {
    return this.bracketService.getTournamentByIdOrEvent(idOrEvent);
  }

  @Post('tournaments/:idOrEvent/generate')
  @ApiOperation({
    summary:
      'Generate / ubah format turnamen (SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN, SWISS, GROUP_PLAYOFF, LEADERBOARD) & seeding (MANUAL, RANDOM, RATING)',
  })
  generateBracket(
    @Param('idOrEvent') idOrEvent: string,
    @Body()
    body: {
      format: TournamentFormat;
      seedingType?: SeedingType;
      bestOf?: number;
      pointConfig?: Partial<PointRuleConfig>;
      participants?: BracketParticipant[];
    },
  ) {
    return this.bracketService.configureAndGenerate(idOrEvent, body);
  }

  @Patch('tournaments/:idOrEvent/matches/:matchId/score')
  @ApiOperation({
    summary:
      'Input skor pertandingan, auto-advance pemenang/pecundang & broadcast update via SSE',
  })
  updateScore(
    @Param('idOrEvent') idOrEvent: string,
    @Param('matchId') matchId: string,
    @Body() body: { scoreA: number; scoreB: number },
  ) {
    return this.bracketService.updateMatchScore(
      idOrEvent,
      matchId,
      Number(body.scoreA),
      Number(body.scoreB),
    );
  }

  @Post('tournaments/:idOrEvent/swiss-next-round')
  @ApiOperation({
    summary:
      'Generate ronde Swiss berikutnya berdasarkan klasemen saat ini tanpa rematch',
  })
  nextSwissRound(@Param('idOrEvent') idOrEvent: string) {
    return this.bracketService.generateNextSwissRound(idOrEvent);
  }

  @Post('tournaments/:idOrEvent/leaderboard-lobby')
  @ApiOperation({
    summary:
      'Input hasil lobby Battle Royale (Placement + Kill) dengan aturan poin custom JSON',
  })
  recordBattleRoyaleLobby(
    @Param('idOrEvent') idOrEvent: string,
    @Body() body: { results: BattleRoyaleLobbyResult[] },
  ) {
    return this.bracketService.recordBattleRoyaleLobby(
      idOrEvent,
      body.results || [],
    );
  }

  @Sse('tournaments/:idOrEvent/stream')
  @ApiOperation({
    summary: 'Realtime Server-Sent Events (SSE) stream untuk live bracket & klasemen',
  })
  streamUpdates(
    @Param('idOrEvent') idOrEvent: string,
  ): Observable<{ data: SseBracketEvent }> {
    return this.bracketService.streamTournamentUpdates(idOrEvent);
  }
}
