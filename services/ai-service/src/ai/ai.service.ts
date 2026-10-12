import { Injectable, BadRequestException } from '@nestjs/common';
import { ClaudeLlmProvider } from '../providers/claude-llm.provider';
import { PROMPTS } from '../prompts/prompt-registry';
import {
  NewsIngestedPayload,
  NewsCuratedPayload,
  NewsCuratedPayloadSchema,
} from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface CuratedNewsResult {
  curated: NewsCuratedPayload;
  telemetry: {
    provider: string;
    promptVersion: string;
    latencyMs: number;
    tokens: number;
    costUsd: number;
  };
}

export interface ModerationResult {
  approved: boolean;
  decision: 'APPROVE' | 'FLAG' | 'REJECT';
  reason?: string;
  categoriesFlagged: string[];
  latencyMs: number;
}

@Injectable()
export class AiService {
  private readonly logger = new StructuredLogger('ai-service');

  constructor(private readonly llmProvider: ClaudeLlmProvider) {}

  async curateNews(rawItem: NewsIngestedPayload): Promise<CuratedNewsResult> {
    const promptConfig = PROMPTS.NEWS_CURATOR;
    const userPrompt = JSON.stringify(rawItem, null, 2);

    const result = await this.llmProvider.generateCompletion(
      promptConfig.systemPrompt,
      userPrompt,
      promptConfig.temperature,
    );

    let parsedJson: unknown;
    try {
      // Strip potential markdown backticks if returned by LLM
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedJson = JSON.parse(cleaned);
    } catch {
      this.logger.error('Failed to parse LLM completion as JSON', new Error(result.content));
      throw new BadRequestException('Keluaran kurasi AI gagal di-parse sebagai JSON');
    }

    // Strict validation against contracts Zod schema
    const validation = NewsCuratedPayloadSchema.safeParse(parsedJson);
    if (!validation.success) {
      this.logger.error(
        'Curated news output schema validation failed',
        new Error(JSON.stringify(validation.error.format())),
      );
      throw new BadRequestException({
        message: 'Hasil kurasi AI tidak sesuai dengan skema kontrak NewsCuratedPayload',
        details: validation.error.format(),
      });
    }

    this.logger.info(`Successfully curated article: "${validation.data.title}"`, 'AiService', {
      source: validation.data.sourceName,
      viralScore: validation.data.viralScore,
      latencyMs: result.usage.latencyMs,
    });

    return {
      curated: validation.data,
      telemetry: {
        provider: result.provider,
        promptVersion: promptConfig.version,
        latencyMs: result.usage.latencyMs,
        tokens: result.usage.totalTokens,
        costUsd: result.usage.estimatedCostUsd,
      },
    };
  }

  async moderateContent(text: string): Promise<ModerationResult> {
    const promptConfig = PROMPTS.CONTENT_MODERATOR;

    const result = await this.llmProvider.generateCompletion(
      promptConfig.systemPrompt,
      text,
      promptConfig.temperature,
    );

    try {
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        approved: Boolean(parsed.approved),
        decision: parsed.decision || (parsed.approved ? 'APPROVE' : 'REJECT'),
        reason: parsed.reason,
        categoriesFlagged: Array.isArray(parsed.categoriesFlagged) ? parsed.categoriesFlagged : [],
        latencyMs: result.usage.latencyMs,
      };
    } catch {
      return {
        approved: true,
        decision: 'APPROVE',
        categoriesFlagged: [],
        latencyMs: result.usage.latencyMs,
      };
    }
  }

  getPrompts() {
    return PROMPTS;
  }
}
