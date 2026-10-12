import { Injectable, Inject } from '@nestjs/common';
import { EnvConfig } from '../config/env.config';
import { DedupeService } from './dedupe.service';
import { FeedFetcherService } from './feed-fetcher.service';
import { NewsIngestedPayload, NewsCuratedPayload } from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface PipelineRunResult {
  fetchedCount: number;
  duplicateCount: number;
  curatedCount: number;
  rejectedCount: number;
  errors: string[];
  durationMs: number;
}

@Injectable()
export class IngestPipelineService {
  private readonly logger = new StructuredLogger('news-ingestor');
  private lastRunStats: {
    lastRunAt?: string;
    totalRuns: number;
    totalIngested: number;
    totalDuplicates: number;
  } = {
    totalRuns: 0,
    totalIngested: 0,
    totalDuplicates: 0,
  };

  constructor(
    @Inject('CONFIG') private readonly env: EnvConfig,
    private readonly dedupeService: DedupeService,
    private readonly feedFetcher: FeedFetcherService,
  ) {}

  async runPipeline(): Promise<PipelineRunResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let duplicateCount = 0;
    let curatedCount = 0;
    let rejectedCount = 0;

    this.logger.info('Starting news ingestion pipeline cycle...');

    // 1. Fetch raw news items
    const rawItems = await this.feedFetcher.fetchFeeds();

    for (const item of rawItems) {
      try {
        // 2. Deduplication check
        if (this.dedupeService.isDuplicate(item.sourceUrl, item.rawTitle)) {
          duplicateCount++;
          this.logger.debug(`Skipping duplicate item: "${item.rawTitle}"`);
          continue;
        }

        // 3. AI Evaluation & Curate
        const curateRes = await this.callAiCurator(item);
        if (!curateRes) {
          errors.push(`AI curation returned null for item: ${item.rawTitle}`);
          continue;
        }

        // 4. Content Moderation
        const modRes = await this.callContentModeration(
          `${curateRes.curated.title} ${curateRes.curated.body}`,
        );
        if (modRes?.decision === 'REJECT') {
          rejectedCount++;
          this.logger.warn(`Item rejected by AI moderation: "${item.rawTitle}"`, 'Pipeline', {
            reason: modRes.reason,
          });
          continue;
        }

        // 5. Enforce mandatory source attribution
        const curatedPayload = {
          ...curateRes.curated,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          status: 'REVIEW' as const, // Strict spec: default mode is REVIEW queue
          aiMeta: {
            telemetry: curateRes.telemetry,
            moderation: modRes,
            curatedAt: new Date().toISOString(),
          },
        };

        // 6. Push to news-service
        await this.pushToNewsService(curatedPayload);

        // 7. Mark as processed in dedupe set
        this.dedupeService.markProcessed(item.sourceUrl, item.rawTitle);
        curatedCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error processing raw item "${item.rawTitle}"`, err as Error);
        errors.push(`${item.rawTitle}: ${msg}`);
      }
    }

    const durationMs = Date.now() - startTime;
    this.lastRunStats.totalRuns++;
    this.lastRunStats.totalIngested += curatedCount;
    this.lastRunStats.totalDuplicates += duplicateCount;
    this.lastRunStats.lastRunAt = new Date().toISOString();

    this.logger.info('News ingestion pipeline cycle completed', 'Pipeline', {
      fetched: rawItems.length,
      curated: curatedCount,
      duplicates: duplicateCount,
      rejected: rejectedCount,
      errorsCount: errors.length,
      durationMs,
    });

    return {
      fetchedCount: rawItems.length,
      duplicateCount,
      curatedCount,
      rejectedCount,
      errors,
      durationMs,
    };
  }

  private async callAiCurator(
    item: NewsIngestedPayload,
  ): Promise<{ curated: NewsCuratedPayload; telemetry: Record<string, unknown> } | null> {
    try {
      const response = await fetch(`${this.env.AI_SERVICE_URL}/ai/curate-news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      return (await response.json()) as {
        curated: NewsCuratedPayload;
        telemetry: Record<string, unknown>;
      };
    } catch (err) {
      this.logger.warn(`Failed to connect to AI service at ${this.env.AI_SERVICE_URL}`, 'AiClient', {
        error: String(err),
      });
      // Fallback: Create curated draft directly with original content
      return {
        curated: {
          title: item.rawTitle,
          slug: item.rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          summary: item.rawContent.slice(0, 150) + '...',
          body: item.rawContent,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          category: 'Sumbar',
          tags: ['Sumbar', 'Esport'],
          viralScore: 75,
          aiConfidence: 0.8,
          suggestedStatus: 'REVIEW',
        },
        telemetry: {
          fallback: true,
          provider: 'local-fallback',
        },
      };
    }
  }

  private async callContentModeration(text: string): Promise<{ decision: string; reason?: string } | null> {
    try {
      const response = await fetch(`${this.env.AI_SERVICE_URL}/ai/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) return { decision: 'APPROVE' };
      return (await response.json()) as { decision: string; reason?: string };
    } catch {
      return { decision: 'APPROVE' };
    }
  }

  private async pushToNewsService(payload: unknown): Promise<void> {
    const response = await fetch(`${this.env.NEWS_SERVICE_URL}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`News service responded with status ${response.status} when creating article`);
    }
  }

  getStatus() {
    return {
      ...this.lastRunStats,
      activeDedupedCount: this.dedupeService.getProcessedCount(),
    };
  }
}
