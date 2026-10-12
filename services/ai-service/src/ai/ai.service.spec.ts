import { AiService } from './ai.service';
import { ClaudeLlmProvider } from '../providers/claude-llm.provider';
import { MockLlmProvider } from '../providers/mock-llm.provider';
import { EnvConfig } from '../config/env.config';

describe('AiService', () => {
  let aiService: AiService;
  let mockProvider: MockLlmProvider;
  let claudeProvider: ClaudeLlmProvider;

  const mockConfig: EnvConfig = {
    NODE_ENV: 'test',
    PORT: 4008,
    SERVICE_NAME: 'ai-service',
    SERVICE_VERSION: '0.1.0',
    CORS_ORIGIN: '*',
    ANTHROPIC_API_KEY: '',
    DEFAULT_LLM_PROVIDER: 'mock',
  };

  beforeEach(() => {
    mockProvider = new MockLlmProvider();
    claudeProvider = new ClaudeLlmProvider(mockConfig, mockProvider);
    aiService = new AiService(claudeProvider);
  });

  it('should be defined', () => {
    expect(aiService).toBeDefined();
  });

  it('should curate raw news into structured JSON compliant with contracts schema', async () => {
    const rawInput = {
      sourceId: 'src-1',
      sourceName: 'Portal Esport Minang',
      sourceUrl: 'https://minang-esport.id/final-mpl',
      rawTitle: 'Padang Slayers Juara Kualifikasi MLBB Sumbar',
      rawContent: 'Pertandingan sengit berlangsung di Padang antara dua tim teratas...',
    };

    const result = await aiService.curateNews(rawInput);

    expect(result.curated).toBeDefined();
    expect(result.curated.title).toContain('Padang Slayers');
    expect(result.curated.summary).toBeDefined();
    expect(result.curated.body).toBeDefined();
    expect(result.curated.sourceName).toBe(rawInput.sourceName);
    expect(result.curated.sourceUrl).toBe(rawInput.sourceUrl);
    expect(result.curated.viralScore).toBeGreaterThanOrEqual(70);
    expect(result.curated.suggestedStatus).toBe('REVIEW');
    expect(result.telemetry.latencyMs).toBeGreaterThan(0);
  });

  it('should approve clean gaming content during moderation', async () => {
    const cleanText = 'GG pertandingannya seru banget tadi malam! Next match kapan?';
    const result = await aiService.moderateContent(cleanText);

    expect(result.approved).toBe(true);
    expect(result.decision).toBe('APPROVE');
    expect(result.categoriesFlagged).toHaveLength(0);
  });

  it('should flag and reject illegal gambling / toxic content during moderation', async () => {
    const badText = 'Ayo main slot gacor deposit 10rb sekarang juga!';
    const result = await aiService.moderateContent(badText);

    expect(result.approved).toBe(false);
    expect(result.decision).toBe('REJECT');
    expect(result.categoriesFlagged).toContain('judi');
  });
});
