import { Test, TestingModule } from '@nestjs/testing';
import { IngestPipelineService } from './ingest-pipeline.service';
import { DedupeService } from './dedupe.service';
import { FeedFetcherService } from './feed-fetcher.service';

describe('News Ingestor Pipeline', () => {
  let pipeline: IngestPipelineService;
  let dedupe: DedupeService;

  beforeEach(async () => {
    const mockEnv = {
      AI_SERVICE_URL: 'http://localhost:4008',
      NEWS_SERVICE_URL: 'http://localhost:4002',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestPipelineService,
        DedupeService,
        FeedFetcherService,
        {
          provide: 'CONFIG',
          useValue: mockEnv,
        },
      ],
    }).compile();

    pipeline = module.get<IngestPipelineService>(IngestPipelineService);
    dedupe = module.get<DedupeService>(DedupeService);
  });

  describe('DedupeService', () => {
    it('should correctly hash and identify duplicate items', () => {
      const url = 'https://esports.id/news/sumbar-championship';
      const title = 'Turnamen Akbar Sumbar';

      expect(dedupe.isDuplicate(url, title)).toBe(false);
      dedupe.markProcessed(url, title);
      expect(dedupe.isDuplicate(url, title)).toBe(true);

      // Case-insensitive test
      expect(dedupe.isDuplicate(url.toUpperCase(), title.toLowerCase())).toBe(true);
    });
  });

  describe('IngestPipelineService', () => {
    it('should be defined', () => {
      expect(pipeline).toBeDefined();
    });

    it('should report initial status correctly', () => {
      const status = pipeline.getStatus();
      expect(status.totalRuns).toBe(0);
      expect(status.totalIngested).toBe(0);
    });
  });
});
