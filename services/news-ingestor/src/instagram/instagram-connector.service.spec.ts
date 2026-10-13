import { Test, TestingModule } from '@nestjs/testing';
import { InstagramConnectorService } from './instagram-connector.service';
import { DedupeService } from '../ingest/dedupe.service';

describe('InstagramConnectorService', () => {
  let service: InstagramConnectorService;
  let dedupeService: DedupeService;

  const mockEnv = {
    NODE_ENV: 'test',
    PORT: 4003,
    SERVICE_NAME: 'news-ingestor',
    SERVICE_VERSION: '0.1.0',
    CORS_ORIGIN: '*',
    AI_SERVICE_URL: 'http://localhost:4008',
    NEWS_SERVICE_URL: 'http://localhost:4002',
    INGEST_INTERVAL_MS: 300000,
    IG_APP_ID: 'app-123',
    IG_APP_SECRET: 'secret-456',
    IG_USER_ID: '1784140029381',
    IG_ACCESS_TOKEN: 'mock_token_abc',
    IG_WEBHOOK_VERIFY_TOKEN: 'verify-token-xyz',
    IG_POLL_INTERVAL_MIN: 15,
    IG_PUBLISH_MODE: 'REVIEW' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstagramConnectorService,
        DedupeService,
        {
          provide: 'CONFIG',
          useValue: mockEnv,
        },
      ],
    }).compile();

    service = module.get<InstagramConnectorService>(InstagramConnectorService);
    dedupeService = module.get<DedupeService>(DedupeService);
  });

  it('should be defined and return valid initial connection status', () => {
    expect(service).toBeDefined();
    const conn = service.getConnectionStatus();
    expect(conn.username).toBe('esportsumbar');
    expect(conn.status).toBe('CONNECTED');
    expect(conn.daysRemaining).toBeGreaterThan(0);
    expect(conn.mode).toBe('REVIEW');
  });

  it('should toggle publish mode between REVIEW and AUTO', () => {
    const autoConn = service.setPublishMode('AUTO');
    expect(autoConn.mode).toBe('AUTO');
    const reviewConn = service.setPublishMode('REVIEW');
    expect(reviewConn.mode).toBe('REVIEW');
  });

  it('should refresh access token and extend validity to 60 days', async () => {
    const refreshResult = await service.refreshToken();
    expect(refreshResult.success).toBe(true);
    expect(refreshResult.daysRemaining).toBe(60);
    expect(new Date(refreshResult.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('should classify tournament posts as event_info and extract EventDraft parameters', () => {
    const tournamentMedia = {
      id: 'ig-test-tourney',
      caption: '🔥 Pendaftaran Mobile Legends Bukittinggi Cup dibuka! Lokasi: Bukittinggi. Total Prize Pool Rp 15.000.000! #esportsumbar #mlbb',
      media_type: 'IMAGE' as const,
      media_url: 'https://example.com/banner.jpg',
      permalink: 'https://instagram.com/p/test-tourney/',
      timestamp: new Date().toISOString(),
    };

    const classified = service.classifyAndTransform(tournamentMedia);
    expect(classified.classification).toBe('event_info');
    expect(classified.gameId).toBe('Mobile Legends');
    expect(classified.cleanedBody).toContain('Sumber: Instagram @esportsumbar');
    expect(classified.eventDraft).toBeDefined();
    expect(classified.eventDraft?.extractedPrize).toBe('Rp 15.000.000');
    expect(classified.eventDraft?.extractedCity).toBe('Bukittinggi');
    expect(classified.eventDraft?.status).toBe('PENDING');
  });

  it('should classify match reports as news and promo/giveaways as promo', () => {
    const matchMedia = {
      id: 'ig-test-news',
      caption: '🏆 Selamat kepada tim Valorant Padang Slayers atas kemenangannya di turnamen Minang Pride!',
      media_type: 'IMAGE' as const,
      media_url: 'https://example.com/trophy.jpg',
      permalink: 'https://instagram.com/p/test-news/',
      timestamp: new Date().toISOString(),
    };

    const newsClassified = service.classifyAndTransform(matchMedia);
    expect(newsClassified.classification).toBe('news');
    expect(newsClassified.gameId).toBe('Valorant');

    const promoMedia = {
      id: 'ig-test-promo',
      caption: '🎉 Special Giveaway dari sponsor kami! Menangkan diamond MLBB gratis dengan follow sponsor.',
      media_type: 'IMAGE' as const,
      permalink: 'https://instagram.com/p/test-promo/',
      timestamp: new Date().toISOString(),
    };

    const promoClassified = service.classifyAndTransform(promoMedia);
    expect(promoClassified.classification).toBe('promo');
  });

  it('should sync feeds, generate articles and drafts, and deduplicate consecutive runs', async () => {
    // 1st run
    const result1 = await service.syncInstagramFeeds();
    expect(result1.fetched).toBeGreaterThan(0);
    expect(result1.processed).toBeGreaterThan(0);
    expect(result1.articlesCreated).toBeGreaterThan(0);
    expect(result1.draftsCreated).toBeGreaterThan(0);
    expect(result1.filteredPromos).toBe(1);

    const drafts = service.getEventDrafts();
    expect(drafts.length).toBeGreaterThan(0);
    const draftId = drafts[0]!.id;

    // Approve draft
    const approvedDraft = service.updateEventDraftStatus(draftId, 'APPROVED');
    expect(approvedDraft?.status).toBe('APPROVED');

    // Reject non-existent draft returns null
    expect(service.updateEventDraftStatus('invalid-id', 'REJECTED')).toBeNull();

    // 2nd run: should skip duplicates
    const result2 = await service.syncInstagramFeeds();
    expect(result2.skippedDuplicates).toBe(result1.fetched);
    expect(result2.processed).toBe(0);
  });
});
